const { sequelize } = require('../../src/config/database');
const { AuditLog, User, Request, Material, Stock } = require('../../models');
const fs = require('fs').promises;
const path = require('path');
const { Op } = require('sequelize');

class DatabaseService {
  /**
   * Get database statistics
   */
  static async getDatabaseStats() {
    try {
      const stats = {};

      // Get table sizes and row counts
      const tables = ['users', 'sites', 'materials', 'requests', 'request_items', 'stock', 'audit_logs'];
      
      for (const table of tables) {
        try {
          const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
          const [sizeResult] = await sequelize.query(`
            SELECT 
              ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name = '${table}'
          `);
          
          stats[table] = {
            row_count: countResult[0].count,
            size_mb: sizeResult[0]?.size_mb || 0
          };
        } catch (error) {
          console.error(`Error getting stats for table ${table}:`, error);
          stats[table] = { row_count: 0, size_mb: 0, error: error.message };
        }
      }

      // Get total database size
      const [totalSizeResult] = await sequelize.query(`
        SELECT 
          ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS total_size_mb
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `);

      // Get database version and status
      const [versionResult] = await sequelize.query('SELECT VERSION() as version');
      const [statusResult] = await sequelize.query('SHOW STATUS LIKE "Uptime"');

      return {
        tables: stats,
        total_size_mb: totalSizeResult[0].total_size_mb,
        version: versionResult[0].version,
        uptime_seconds: parseInt(statusResult[0].Value),
        last_checked: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }

  /**
   * Create database backup
   */
  static async createBackup(backupName = null) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = backupName || `cdims_backup_${timestamp}.sql`;
      const backupPath = path.join(process.cwd(), 'backups', backupFileName);

      // Ensure backups directory exists
      await fs.mkdir(path.dirname(backupPath), { recursive: true });

      // Get database configuration
      const config = sequelize.config;
      const dbName = config.database;
      const dbHost = config.host;
      const dbPort = config.port;
      const dbUser = config.username;

      // Create mysqldump command
      const mysqldumpCmd = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} -p${config.password} ${dbName} > "${backupPath}"`;

      // For now, we'll create a simple backup by exporting data
      // In production, you'd want to use mysqldump or similar
      const backupData = {
        timestamp: new Date().toISOString(),
        database: dbName,
        tables: {}
      };

      // Export key tables
      const tables = ['users', 'sites', 'materials', 'requests', 'request_items', 'stock'];
      for (const table of tables) {
        try {
          const [results] = await sequelize.query(`SELECT * FROM ${table}`);
          backupData.tables[table] = results;
        } catch (error) {
          console.error(`Error backing up table ${table}:`, error);
          backupData.tables[table] = { error: error.message };
        }
      }

      // Write backup file
      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));

      return {
        success: true,
        backup_file: backupFileName,
        backup_path: backupPath,
        size_mb: (await fs.stat(backupPath)).size / (1024 * 1024),
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  /**
   * List available backups
   */
  static async listBackups() {
    try {
      const backupsDir = path.join(process.cwd(), 'backups');
      
      try {
        await fs.access(backupsDir);
      } catch {
        return { backups: [] };
      }

      const files = await fs.readdir(backupsDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('.sql') || file.endsWith('.json')) {
          const filePath = path.join(backupsDir, file);
          const stats = await fs.stat(filePath);
          
          backups.push({
            filename: file,
            size_mb: (stats.size / (1024 * 1024)).toFixed(2),
            created_at: stats.birthtime.toISOString(),
            modified_at: stats.mtime.toISOString()
          });
        }
      }

      return { backups: backups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) };
    } catch (error) {
      console.error('Error listing backups:', error);
      throw error;
    }
  }

  /**
   * Clean up old data
   */
  static async cleanupOldData(options = {}) {
    try {
      const {
        auditLogsDays = 90,
        oldBackupsDays = 30,
        emptyTables = false
      } = options;

      const results = {};

      // Clean up old audit logs
      if (auditLogsDays > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - auditLogsDays);

        const deletedAuditLogs = await AuditLog.destroy({
          where: {
            created_at: { [Op.lt]: cutoffDate }
          }
        });

        results.audit_logs_deleted = deletedAuditLogs;
      }

      // Clean up old backups
      if (oldBackupsDays > 0) {
        const backupsDir = path.join(process.cwd(), 'backups');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - oldBackupsDays);

        try {
          const files = await fs.readdir(backupsDir);
          let deletedBackups = 0;

          for (const file of files) {
            const filePath = path.join(backupsDir, file);
            const stats = await fs.stat(filePath);
            
            if (stats.birthtime < cutoffDate) {
              await fs.unlink(filePath);
              deletedBackups++;
            }
          }

          results.backups_deleted = deletedBackups;
        } catch (error) {
          console.error('Error cleaning up backups:', error);
          results.backups_error = error.message;
        }
      }

      // Clean up empty tables (if requested)
      if (emptyTables) {
        // This would be more complex in a real implementation
        // For now, we'll just report what could be cleaned
        results.empty_tables_note = 'Empty table cleanup not implemented';
      }

      return {
        success: true,
        results,
        cleaned_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      throw error;
    }
  }

  /**
   * Optimize database tables
   */
  static async optimizeTables() {
    try {
      const tables = ['users', 'sites', 'materials', 'requests', 'request_items', 'stock', 'audit_logs'];
      const results = {};

      for (const table of tables) {
        try {
          await sequelize.query(`OPTIMIZE TABLE ${table}`);
          results[table] = 'optimized';
        } catch (error) {
          console.error(`Error optimizing table ${table}:`, error);
          results[table] = `error: ${error.message}`;
        }
      }

      return {
        success: true,
        results,
        optimized_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error optimizing tables:', error);
      throw error;
    }
  }

  /**
   * Get database health status
   */
  static async getHealthStatus() {
    try {
      const health = {
        database_connection: 'unknown',
        response_time_ms: 0,
        active_connections: 0,
        slow_queries: 0,
        table_locks: 0,
        issues: []
      };

      // Test database connection and response time
      const startTime = Date.now();
      try {
        await sequelize.authenticate();
        health.database_connection = 'healthy';
        health.response_time_ms = Date.now() - startTime;
      } catch (error) {
        health.database_connection = 'unhealthy';
        health.issues.push(`Database connection failed: ${error.message}`);
      }

      // Get connection stats
      try {
        const [connectionsResult] = await sequelize.query('SHOW STATUS LIKE "Threads_connected"');
        health.active_connections = parseInt(connectionsResult[0].Value);
      } catch (error) {
        health.issues.push(`Could not get connection count: ${error.message}`);
      }

      // Get slow query count
      try {
        const [slowQueriesResult] = await sequelize.query('SHOW STATUS LIKE "Slow_queries"');
        health.slow_queries = parseInt(slowQueriesResult[0].Value);
      } catch (error) {
        health.issues.push(`Could not get slow query count: ${error.message}`);
      }

      // Get table lock count
      try {
        const [tableLocksResult] = await sequelize.query('SHOW STATUS LIKE "Table_locks_waited"');
        health.table_locks = parseInt(tableLocksResult[0].Value);
      } catch (error) {
        health.issues.push(`Could not get table lock count: ${error.message}`);
      }

      // Determine overall health
      if (health.database_connection === 'unhealthy') {
        health.overall_status = 'critical';
      } else if (health.response_time_ms > 1000 || health.slow_queries > 100) {
        health.overall_status = 'warning';
      } else {
        health.overall_status = 'healthy';
      }

      return health;
    } catch (error) {
      console.error('Error getting database health:', error);
      throw error;
    }
  }

  /**
   * Restore database from backup
   */
  static async restoreFromBackup(backupFileName) {
    try {
      const backupPath = path.join(process.cwd(), 'backups', backupFileName);
      
      // Check if backup file exists
      try {
        await fs.access(backupPath);
      } catch {
        throw new Error(`Backup file ${backupFileName} not found`);
      }

      // Read backup file
      const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));

      // Start transaction
      const transaction = await sequelize.transaction();

      try {
        // Clear existing data (be very careful in production!)
        const tables = Object.keys(backupData.tables);
        for (const table of tables) {
          await sequelize.query(`TRUNCATE TABLE ${table}`, { transaction });
        }

        // Restore data
        for (const [tableName, tableData] of Object.entries(backupData.tables)) {
          if (tableData.error) {
            console.warn(`Skipping table ${tableName} due to error: ${tableData.error}`);
            continue;
          }

          if (tableData.length > 0) {
            // Get column names from first row
            const columns = Object.keys(tableData[0]);
            const values = tableData.map(row => 
              columns.map(col => row[col])
            );

            // Insert data
            for (const row of values) {
              const placeholders = row.map(() => '?').join(', ');
              await sequelize.query(
                `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`,
                { 
                  replacements: row,
                  transaction 
                }
              );
            }
          }
        }

        await transaction.commit();

        return {
          success: true,
          restored_tables: tables,
          restored_at: new Date().toISOString()
        };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }
}

module.exports = DatabaseService;

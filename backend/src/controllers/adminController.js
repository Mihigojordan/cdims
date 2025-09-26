const AuditService = require('../services/auditService');
const DatabaseService = require('../services/databaseService');
const ExportService = require('../services/exportService');
const { User, Role, Site, Material, Request, Stock, SystemConfig } = require('../../models');
const { Op } = require('sequelize');

// Simple test endpoint
const testAdmin = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Admin endpoint working',
      user: req.user
    });
  } catch (error) {
    console.error('Test admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get comprehensive audit logs for Admin/Padiri
 */
const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      user_id,
      action,
      resource_type,
      resource_id,
      status,
      date_from,
      date_to,
      search
    } = req.query;

    const result = await AuditService.getAuditLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      userId: user_id ? parseInt(user_id) : null,
      action,
      resourceType: resource_type,
      resourceId: resource_id ? parseInt(resource_id) : null,
      status,
      dateFrom: date_from,
      dateTo: date_to,
      search
    });

    res.json({
      success: true,
      data: result,
      message: 'Audit logs retrieved successfully'
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack
    });
  }
};

/**
 * Get system statistics and performance metrics
 */
const getSystemStats = async (req, res) => {
  try {
    // Simple version first
    const totalUsers = await User.count();
    const totalSites = await Site.count();
    const totalMaterials = await Material.count();
    const totalRequests = await Request.count();
    const totalStockItems = await Stock.count();

    res.json({
      success: true,
      data: {
        system_metrics: {
          total_users: totalUsers,
          total_sites: totalSites,
          total_materials: totalMaterials,
          total_requests: totalRequests,
          total_stock_items: totalStockItems
        },
        system_health: {
          database_connection: 'healthy',
          api_response_time: 'normal',
          error_rate: 'low',
          uptime: process.uptime()
        }
      },
      message: 'System statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.stack
    });
  }
};

/**
 * Get user activity summary
 */
const getUserActivity = async (req, res) => {
  try {
    const { user_id, date_from, date_to, limit = 20 } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const whereClause = { user_id: parseInt(user_id) };
    
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) {
        whereClause.created_at[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        whereClause.created_at[Op.lte] = new Date(date_to);
      }
    }

    const result = await AuditService.getAuditLogs({
      page: 1,
      limit: parseInt(limit),
      userId: parseInt(user_id),
      dateFrom: date_from,
      dateTo: date_to
    });

    // Get user information
    const user = await User.findByPk(user_id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name']
        }
      ],
      attributes: ['id', 'full_name', 'email', 'last_login', 'created_at']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role.name,
          last_login: user.last_login,
          created_at: user.created_at
        },
        activity: result.auditLogs,
        pagination: result.pagination
      },
      message: 'User activity retrieved successfully'
    });
  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Export audit logs (for future implementation)
 */
const exportAuditLogs = async (req, res) => {
  try {
    const { format = 'json', date_from, date_to } = req.query;

    // Get all audit logs for the specified date range
    const result = await AuditService.getAuditLogs({
      page: 1,
      limit: 10000, // Large limit for export
      dateFrom: date_from,
      dateTo: date_to
    });

    if (format === 'csv') {
      // TODO: Implement CSV export
      res.json({
        success: false,
        message: 'CSV export not yet implemented'
      });
    } else if (format === 'excel') {
      // TODO: Implement Excel export
      res.json({
        success: false,
        message: 'Excel export not yet implemented'
      });
    } else {
      // JSON export
      res.json({
        success: true,
        data: result.auditLogs,
        message: 'Audit logs exported successfully'
      });
    }
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Clean up old audit logs
 */
const cleanupAuditLogs = async (req, res) => {
  try {
    const { days_to_keep = 90 } = req.body;

    const deletedCount = await AuditService.cleanupOldLogs(parseInt(days_to_keep));

    res.json({
      success: true,
      data: {
        deleted_count: deletedCount,
        days_kept: parseInt(days_to_keep)
      },
      message: `Cleaned up ${deletedCount} old audit log entries`
    });
  } catch (error) {
    console.error('Cleanup audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// System Configuration Management
const getSystemConfigs = async (req, res) => {
  try {
    const { category, is_public } = req.query;
    const whereClause = {};

    if (category) whereClause.category = category;
    if (is_public !== undefined) whereClause.is_public = is_public === 'true';

    const configs = await SystemConfig.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] },
        { model: User, as: 'updater', attributes: ['id', 'full_name', 'email'] }
      ],
      order: [['category', 'ASC'], ['key', 'ASC']]
    });

    res.json({
      success: true,
      data: { configs },
      message: 'System configurations retrieved successfully'
    });
  } catch (error) {
    console.error('Get system configs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateSystemConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const userId = req.user.id;

    const config = await SystemConfig.setConfig(key, value, userId);

    res.json({
      success: true,
      data: { config },
      message: `Configuration ${key} updated successfully`
    });
  } catch (error) {
    console.error('Update system config error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getSystemConfig = async (req, res) => {
  try {
    const { key } = req.params;
    const config = await SystemConfig.findOne({ where: { key } });

    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Configuration not found'
      });
    }

    res.json({
      success: true,
      data: { config },
      message: 'System configuration retrieved successfully'
    });
  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Database Maintenance
const getDatabaseStats = async (req, res) => {
  try {
    const stats = await DatabaseService.getDatabaseStats();
    
    res.json({
      success: true,
      data: stats,
      message: 'Database statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Get database stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createDatabaseBackup = async (req, res) => {
  try {
    const { backup_name } = req.body;
    const backup = await DatabaseService.createBackup(backup_name);
    
    res.json({
      success: true,
      data: backup,
      message: 'Database backup created successfully'
    });
  } catch (error) {
    console.error('Create database backup error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const listDatabaseBackups = async (req, res) => {
  try {
    const backups = await DatabaseService.listBackups();
    
    res.json({
      success: true,
      data: backups,
      message: 'Database backups retrieved successfully'
    });
  } catch (error) {
    console.error('List database backups error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const restoreDatabaseBackup = async (req, res) => {
  try {
    const { backup_filename } = req.body;
    
    if (!backup_filename) {
      return res.status(400).json({
        success: false,
        message: 'Backup filename is required'
      });
    }

    const result = await DatabaseService.restoreFromBackup(backup_filename);
    
    res.json({
      success: true,
      data: result,
      message: 'Database restored from backup successfully'
    });
  } catch (error) {
    console.error('Restore database backup error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const optimizeDatabase = async (req, res) => {
  try {
    const result = await DatabaseService.optimizeTables();
    
    res.json({
      success: true,
      data: result,
      message: 'Database optimization completed successfully'
    });
  } catch (error) {
    console.error('Optimize database error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getDatabaseHealth = async (req, res) => {
  try {
    const health = await DatabaseService.getHealthStatus();
    
    res.json({
      success: true,
      data: health,
      message: 'Database health status retrieved successfully'
    });
  } catch (error) {
    console.error('Get database health error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const cleanupDatabase = async (req, res) => {
  try {
    const {
      audit_logs_days = 90,
      old_backups_days = 30,
      empty_tables = false
    } = req.body;

    const result = await DatabaseService.cleanupOldData({
      auditLogsDays: parseInt(audit_logs_days),
      oldBackupsDays: parseInt(old_backups_days),
      emptyTables: empty_tables
    });
    
    res.json({
      success: true,
      data: result,
      message: 'Database cleanup completed successfully'
    });
  } catch (error) {
    console.error('Cleanup database error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Export Functionality
const exportUsers = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const filters = req.query;
    
    const exportData = await ExportService.exportUsers(filters);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `users_export_${timestamp}.${format}`;
    
    let result;
    if (format === 'json') {
      result = await ExportService.exportToJSON(exportData.data, filename, {
        type: 'users',
        filters: filters,
        total_records: exportData.total_records
      });
    } else {
      result = await ExportService.exportToCSV(exportData.data, filename, exportData.headers);
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Users exported successfully'
    });
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const exportRequests = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const filters = req.query;
    
    const exportData = await ExportService.exportRequests(filters);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `requests_export_${timestamp}.${format}`;
    
    let result;
    if (format === 'json') {
      result = await ExportService.exportToJSON(exportData.data, filename, {
        type: 'requests',
        filters: filters,
        total_records: exportData.total_records
      });
    } else {
      result = await ExportService.exportToCSV(exportData.data, filename, exportData.headers);
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Requests exported successfully'
    });
  } catch (error) {
    console.error('Export requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const exportMaterials = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const filters = req.query;
    
    const exportData = await ExportService.exportMaterials(filters);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `materials_export_${timestamp}.${format}`;
    
    let result;
    if (format === 'json') {
      result = await ExportService.exportToJSON(exportData.data, filename, {
        type: 'materials',
        filters: filters,
        total_records: exportData.total_records
      });
    } else {
      result = await ExportService.exportToCSV(exportData.data, filename, exportData.headers);
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Materials exported successfully'
    });
  } catch (error) {
    console.error('Export materials error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const exportStock = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const filters = req.query;
    
    const exportData = await ExportService.exportStock(filters);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `stock_export_${timestamp}.${format}`;
    
    let result;
    if (format === 'json') {
      result = await ExportService.exportToJSON(exportData.data, filename, {
        type: 'stock',
        filters: filters,
        total_records: exportData.total_records
      });
    } else {
      result = await ExportService.exportToCSV(exportData.data, filename, exportData.headers);
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Stock exported successfully'
    });
  } catch (error) {
    console.error('Export stock error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const exportAuditLogsData = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const filters = req.query;
    
    const exportData = await ExportService.exportAuditLogs(filters);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `audit_logs_export_${timestamp}.${format}`;
    
    let result;
    if (format === 'json') {
      result = await ExportService.exportToJSON(exportData.data, filename, {
        type: 'audit_logs',
        filters: filters,
        total_records: exportData.total_records
      });
    } else {
      result = await ExportService.exportToCSV(exportData.data, filename, exportData.headers);
    }
    
    res.json({
      success: true,
      data: result,
      message: 'Audit logs exported successfully'
    });
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const exportSystemConfigs = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const filters = req.query;
    
    const exportData = await ExportService.exportSystemConfigs(filters);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `system_configs_export_${timestamp}.${format}`;
    
    let result;
    if (format === 'json') {
      result = await ExportService.exportToJSON(exportData.data, filename, {
        type: 'system_configs',
        filters: filters,
        total_records: exportData.total_records
      });
    } else {
      result = await ExportService.exportToCSV(exportData.data, filename, exportData.headers);
    }
    
    res.json({
      success: true,
      data: result,
      message: 'System configurations exported successfully'
    });
  } catch (error) {
    console.error('Export system configs error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const generateSystemReport = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const filters = { ...req.query, user_id: req.user.id };
    
    const report = await ExportService.generateSystemReport(filters);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `system_report_${timestamp}.${format}`;
    
    let result;
    if (format === 'csv') {
      // For CSV, we'll export each section separately
      const csvData = [];
      const headers = ['Section', 'Record Type', 'Count', 'Details'];
      
      Object.entries(report.details).forEach(([section, data]) => {
        csvData.push({
          Section: section,
          'Record Type': 'Summary',
          Count: data.total_records,
          Details: `${data.total_records} records exported`
        });
      });
      
      result = await ExportService.exportToCSV(csvData, filename, headers);
    } else {
      result = await ExportService.exportToJSON(report, filename, {
        type: 'system_report',
        generated_by: req.user.id
      });
    }
    
    res.json({
      success: true,
      data: result,
      message: 'System report generated successfully'
    });
  } catch (error) {
    console.error('Generate system report error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const listExports = async (req, res) => {
  try {
    const exports = await ExportService.listExports();
    
    res.json({
      success: true,
      data: exports,
      message: 'Export files retrieved successfully'
    });
  } catch (error) {
    console.error('List exports error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const cleanupExports = async (req, res) => {
  try {
    const { days_old = 7 } = req.body;
    const result = await ExportService.cleanupExports(parseInt(days_old));
    
    res.json({
      success: true,
      data: result,
      message: 'Export cleanup completed successfully'
    });
  } catch (error) {
    console.error('Cleanup exports error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  testAdmin,
  getAuditLogs,
  getSystemStats,
  getUserActivity,
  exportAuditLogs,
  cleanupAuditLogs,
  // System Configuration
  getSystemConfigs,
  getSystemConfig,
  updateSystemConfig,
  // Database Maintenance
  getDatabaseStats,
  createDatabaseBackup,
  listDatabaseBackups,
  restoreDatabaseBackup,
  optimizeDatabase,
  getDatabaseHealth,
  cleanupDatabase,
  // Export Functionality
  exportUsers,
  exportRequests,
  exportMaterials,
  exportStock,
  exportAuditLogsData,
  exportSystemConfigs,
  generateSystemReport,
  listExports,
  cleanupExports
};

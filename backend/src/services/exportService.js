const fs = require('fs').promises;
const path = require('path');
const { Op } = require('sequelize');
const { User, Role, Site, Material, Request, RequestItem, Stock, AuditLog, SystemConfig } = require('../../models');

class ExportService {
  /**
   * Export data to CSV format
   */
  static async exportToCSV(data, filename, headers) {
    try {
      const csvContent = this.convertToCSV(data, headers);
      const filePath = path.join(process.cwd(), 'exports', filename);
      
      // Ensure exports directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      
      await fs.writeFile(filePath, csvContent, 'utf8');
      
      return {
        success: true,
        file_path: filePath,
        filename: filename,
        size_mb: (await fs.stat(filePath)).size / (1024 * 1024),
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('CSV export error:', error);
      throw error;
    }
  }

  /**
   * Export data to JSON format
   */
  static async exportToJSON(data, filename, metadata = {}) {
    try {
      const exportData = {
        metadata: {
          export_date: new Date().toISOString(),
          total_records: Array.isArray(data) ? data.length : 1,
          ...metadata
        },
        data: data
      };

      const filePath = path.join(process.cwd(), 'exports', filename);
      
      // Ensure exports directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      
      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf8');
      
      return {
        success: true,
        file_path: filePath,
        filename: filename,
        size_mb: (await fs.stat(filePath)).size / (1024 * 1024),
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('JSON export error:', error);
      throw error;
    }
  }

  /**
   * Convert data to CSV format
   */
  static convertToCSV(data, headers) {
    if (!Array.isArray(data) || data.length === 0) {
      return headers.join(',') + '\n';
    }

    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = this.getNestedValue(row, header);
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }

  /**
   * Get nested value from object using dot notation
   */
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj);
  }

  /**
   * Export users data
   */
  static async exportUsers(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.role_id) whereClause.role_id = filters.role_id;
      if (filters.active !== undefined) whereClause.active = filters.active;
      if (filters.date_from && filters.date_to) {
        whereClause.created_at = {
          [Op.between]: [new Date(filters.date_from), new Date(filters.date_to)]
        };
      }

      const users = await User.findAll({
        where: whereClause,
        include: [
          { model: Role, as: 'role', attributes: ['id', 'name'] },
          { model: Site, as: 'assignedSites', attributes: ['id', 'name', 'location'] }
        ],
        order: [['created_at', 'DESC']]
      });

      const headers = [
        'ID', 'Full Name', 'Email', 'Phone', 'Role', 'Active', 
        'First Login', 'Sites', 'Created At', 'Updated At'
      ];

      const csvData = users.map(user => ({
        ID: user.id,
        'Full Name': user.full_name,
        Email: user.email,
        Phone: user.phone || '',
        Role: user.role?.name || '',
        Active: user.active ? 'Yes' : 'No',
        'First Login': user.first_login ? 'Yes' : 'No',
        Sites: user.assignedSites?.map(site => site.name).join('; ') || '',
        'Created At': user.created_at,
        'Updated At': user.updated_at
      }));

      return {
        data: csvData,
        headers,
        total_records: users.length
      };
    } catch (error) {
      console.error('Export users error:', error);
      throw error;
    }
  }

  /**
   * Export requests data
   */
  static async exportRequests(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.status) whereClause.status = filters.status;
      if (filters.site_id) whereClause.site_id = filters.site_id;
      if (filters.user_id) whereClause.requested_by = filters.user_id;
      if (filters.date_from && filters.date_to) {
        whereClause.created_at = {
          [Op.between]: [new Date(filters.date_from), new Date(filters.date_to)]
        };
      }

      const requests = await Request.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'requestedBy', attributes: ['id', 'full_name', 'email'] },
          { model: Site, as: 'site', attributes: ['id', 'name', 'location'] },
          { 
            model: RequestItem, 
            as: 'items',
            include: [
              { model: Material, as: 'material', attributes: ['id', 'name', 'unit_price'] }
            ]
          }
        ],
        order: [['created_at', 'DESC']]
      });

      const headers = [
        'ID', 'Reference Number', 'Site', 'Requested By', 'Status', 
        'Total Items', 'Total Amount', 'Created At', 'Updated At'
      ];

      const csvData = requests.map(request => {
        const totalAmount = request.items?.reduce((sum, item) => {
          return sum + (parseFloat(item.qty_requested || 0) * parseFloat(item.material?.unit_price || 0));
        }, 0) || 0;

        return {
          ID: request.id,
          'Reference Number': request.ref_no,
          Site: request.site?.name || '',
          'Requested By': request.requestedBy?.full_name || '',
          Status: request.status,
          'Total Items': request.items?.length || 0,
          'Total Amount': totalAmount.toFixed(2),
          'Created At': request.created_at,
          'Updated At': request.updated_at
        };
      });

      return {
        data: csvData,
        headers,
        total_records: requests.length
      };
    } catch (error) {
      console.error('Export requests error:', error);
      throw error;
    }
  }

  /**
   * Export materials data
   */
  static async exportMaterials(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.category_id) whereClause.category_id = filters.category_id;
      if (filters.unit_id) whereClause.unit_id = filters.unit_id;
      if (filters.search) {
        whereClause[Op.or] = [
          { name: { [Op.like]: `%${filters.search}%` } },
          { description: { [Op.like]: `%${filters.search}%` } }
        ];
      }

      const materials = await Material.findAll({
        where: whereClause,
        include: [
          { model: require('../../models').Category, as: 'category', attributes: ['id', 'name'] },
          { model: require('../../models').Unit, as: 'unit', attributes: ['id', 'name', 'code'] }
        ],
        order: [['name', 'ASC']]
      });

      const headers = [
        'ID', 'Name', 'Description', 'Category', 'Unit', 'Unit Price', 
        'Created At', 'Updated At'
      ];

      const csvData = materials.map(material => ({
        ID: material.id,
        Name: material.name,
        Description: material.description || '',
        Category: material.category?.name || '',
        Unit: material.unit?.name || '',
        'Unit Price': material.unit_price || 0,
        'Created At': material.created_at,
        'Updated At': material.updated_at
      }));

      return {
        data: csvData,
        headers,
        total_records: materials.length
      };
    } catch (error) {
      console.error('Export materials error:', error);
      throw error;
    }
  }

  /**
   * Export stock data
   */
  static async exportStock(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.store_id) whereClause.store_id = filters.store_id;
      if (filters.material_id) whereClause.material_id = filters.material_id;
      if (filters.low_stock) whereClause.qty_on_hand = { [Op.lt]: require('sequelize').col('reorder_level') };

      const stock = await Stock.findAll({
        where: whereClause,
        include: [
          { model: Material, as: 'material', attributes: ['id', 'name', 'unit_price'] },
          { model: require('../../models').Store, as: 'store', attributes: ['id', 'name', 'location'] }
        ],
        order: [['qty_on_hand', 'ASC']]
      });

      const headers = [
        'ID', 'Material', 'Store', 'Quantity on Hand', 'Reorder Level', 
        'Low Stock Alert', 'Unit Price', 'Total Value', 'Last Updated'
      ];

      const csvData = stock.map(item => {
        const totalValue = parseFloat(item.qty_on_hand || 0) * parseFloat(item.material?.unit_price || 0);
        const isLowStock = parseFloat(item.qty_on_hand || 0) < parseFloat(item.reorder_level || 0);

        return {
          ID: item.id,
          Material: item.material?.name || '',
          Store: item.store?.name || '',
          'Quantity on Hand': item.qty_on_hand || 0,
          'Reorder Level': item.reorder_level || 0,
          'Low Stock Alert': isLowStock ? 'Yes' : 'No',
          'Unit Price': item.material?.unit_price || 0,
          'Total Value': totalValue.toFixed(2),
          'Last Updated': item.updated_at
        };
      });

      return {
        data: csvData,
        headers,
        total_records: stock.length
      };
    } catch (error) {
      console.error('Export stock error:', error);
      throw error;
    }
  }

  /**
   * Export audit logs
   */
  static async exportAuditLogs(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.user_id) whereClause.user_id = filters.user_id;
      if (filters.action) whereClause.action = filters.action;
      if (filters.status) whereClause.status = filters.status;
      if (filters.date_from && filters.date_to) {
        whereClause.created_at = {
          [Op.between]: [new Date(filters.date_from), new Date(filters.date_to)]
        };
      }

      const auditLogs = await AuditLog.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'auditUser', attributes: ['id', 'full_name', 'email'] }
        ],
        order: [['created_at', 'DESC']],
        limit: filters.limit || 10000
      });

      const headers = [
        'ID', 'User', 'Action', 'Entity', 'Entity ID', 'Status', 
        'IP Address', 'User Agent', 'Created At'
      ];

      const csvData = auditLogs.map(log => ({
        ID: log.id,
        User: log.auditUser?.full_name || 'System',
        Action: log.action,
        Entity: log.entity,
        'Entity ID': log.entity_id || '',
        Status: log.status,
        'IP Address': log.ip_address || '',
        'User Agent': log.user_agent || '',
        'Created At': log.created_at
      }));

      return {
        data: csvData,
        headers,
        total_records: auditLogs.length
      };
    } catch (error) {
      console.error('Export audit logs error:', error);
      throw error;
    }
  }

  /**
   * Export system configurations
   */
  static async exportSystemConfigs(filters = {}) {
    try {
      const whereClause = {};
      
      if (filters.category) whereClause.category = filters.category;
      if (filters.is_public !== undefined) whereClause.is_public = filters.is_public;

      const configs = await SystemConfig.findAll({
        where: whereClause,
        include: [
          { model: User, as: 'creator', attributes: ['id', 'full_name', 'email'] },
          { model: User, as: 'updater', attributes: ['id', 'full_name', 'email'] }
        ],
        order: [['category', 'ASC'], ['key', 'ASC']]
      });

      const headers = [
        'ID', 'Key', 'Value', 'Type', 'Category', 'Description', 
        'Editable', 'Public', 'Created By', 'Updated By', 'Created At', 'Updated At'
      ];

      const csvData = configs.map(config => ({
        ID: config.id,
        Key: config.key,
        Value: config.value,
        Type: config.type,
        Category: config.category,
        Description: config.description || '',
        Editable: config.is_editable ? 'Yes' : 'No',
        Public: config.is_public ? 'Yes' : 'No',
        'Created By': config.creator?.full_name || 'System',
        'Updated By': config.updater?.full_name || 'System',
        'Created At': config.created_at,
        'Updated At': config.updated_at
      }));

      return {
        data: csvData,
        headers,
        total_records: configs.length
      };
    } catch (error) {
      console.error('Export system configs error:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive system report
   */
  static async generateSystemReport(filters = {}) {
    try {
      const report = {
        generated_at: new Date().toISOString(),
        generated_by: filters.user_id,
        period: {
          from: filters.date_from || 'All time',
          to: filters.date_to || 'Present'
        },
        summary: {},
        details: {}
      };

      // Get system summary
      const userCount = await User.count();
      const requestCount = await Request.count();
      const materialCount = await Material.count();
      const stockCount = await Stock.count();

      report.summary = {
        total_users: userCount,
        total_requests: requestCount,
        total_materials: materialCount,
        total_stock_items: stockCount
      };

      // Get detailed data
      report.details.users = await this.exportUsers(filters);
      report.details.requests = await this.exportRequests(filters);
      report.details.materials = await this.exportMaterials(filters);
      report.details.stock = await this.exportStock(filters);
      report.details.audit_logs = await this.exportAuditLogs(filters);

      return report;
    } catch (error) {
      console.error('Generate system report error:', error);
      throw error;
    }
  }

  /**
   * List available export files
   */
  static async listExports() {
    try {
      const exportsDir = path.join(process.cwd(), 'exports');
      
      try {
        await fs.access(exportsDir);
      } catch {
        return { exports: [] };
      }

      const files = await fs.readdir(exportsDir);
      const exports = [];

      for (const file of files) {
        const filePath = path.join(exportsDir, file);
        const stats = await fs.stat(filePath);
        
        exports.push({
          filename: file,
          size_mb: (stats.size / (1024 * 1024)).toFixed(2),
          created_at: stats.birthtime.toISOString(),
          modified_at: stats.mtime.toISOString()
        });
      }

      return { exports: exports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) };
    } catch (error) {
      console.error('List exports error:', error);
      throw error;
    }
  }

  /**
   * Clean up old export files
   */
  static async cleanupExports(daysOld = 7) {
    try {
      const exportsDir = path.join(process.cwd(), 'exports');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      try {
        const files = await fs.readdir(exportsDir);
        let deletedFiles = 0;

        for (const file of files) {
          const filePath = path.join(exportsDir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.birthtime < cutoffDate) {
            await fs.unlink(filePath);
            deletedFiles++;
          }
        }

        return {
          success: true,
          deleted_files: deletedFiles,
          cleaned_at: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error cleaning up exports:', error);
        return {
          success: false,
          error: error.message
        };
      }
    } catch (error) {
      console.error('Cleanup exports error:', error);
      throw error;
    }
  }
}

module.exports = ExportService;

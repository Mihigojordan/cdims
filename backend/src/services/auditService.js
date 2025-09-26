const { AuditLog, User } = require('../../models');
const { Op } = require('sequelize');

class AuditService {
  /**
   * Log a user action
   * @param {Object} params - Audit log parameters
   * @param {number} params.userId - User ID who performed the action
   * @param {string} params.action - Action performed
   * @param {string} params.resourceType - Type of resource affected
   * @param {number} params.resourceId - ID of the affected resource
   * @param {Object} params.oldValues - Previous values
   * @param {Object} params.newValues - New values
   * @param {Object} params.request - Express request object
   * @param {string} params.status - Action status (SUCCESS, FAILED, PENDING)
   * @param {string} params.errorMessage - Error message if failed
   * @param {Object} params.metadata - Additional metadata
   */
  static async logAction({
    userId,
    action,
    resourceType,
    resourceId = null,
    oldValues = null,
    newValues = null,
    request = null,
    status = 'SUCCESS',
    errorMessage = null,
    metadata = null
  }) {
    try {
    const auditData = {
      user_id: userId,
      action,
      entity: resourceType,
      entity_id: resourceId,
      details: {
        old_values: oldValues,
        new_values: newValues,
        metadata: metadata
      },
      status,
      error_message: errorMessage
    };

      // Extract request information if available
      if (request) {
        auditData.ip_address = request.ip || request.connection?.remoteAddress;
        auditData.user_agent = request.get('User-Agent');
        auditData.session_id = request.sessionID || request.headers['x-session-id'];
      }

      await AuditLog.create(auditData);
    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw error to avoid breaking the main operation
    }
  }

  /**
   * Log authentication events
   */
  static async logLogin(userId, request, status = 'SUCCESS', errorMessage = null) {
    await this.logAction({
      userId,
      action: 'LOGIN',
      resourceType: 'AUTH',
      request,
      status,
      errorMessage,
      metadata: {
        login_method: 'email_password',
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logLogout(userId, request) {
    await this.logAction({
      userId,
      action: 'LOGOUT',
      resourceType: 'AUTH',
      request,
      metadata: {
        logout_method: 'manual',
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logPasswordChange(userId, request) {
    await this.logAction({
      userId,
      action: 'PASSWORD_CHANGE',
      resourceType: 'USER',
      resourceId: userId,
      request,
      metadata: {
        change_type: 'password_update',
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log CRUD operations
   */
  static async logCreate(userId, resourceType, resourceId, newValues, request) {
    await this.logAction({
      userId,
      action: 'CREATE',
      resourceType,
      resourceId,
      newValues,
      request,
      metadata: {
        operation: 'create',
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logUpdate(userId, resourceType, resourceId, oldValues, newValues, request) {
    await this.logAction({
      userId,
      action: 'UPDATE',
      resourceType,
      resourceId,
      oldValues,
      newValues,
      request,
      metadata: {
        operation: 'update',
        timestamp: new Date().toISOString()
      }
    });
  }

  static async logDelete(userId, resourceType, resourceId, oldValues, request) {
    await this.logAction({
      userId,
      action: 'DELETE',
      resourceType,
      resourceId,
      oldValues,
      request,
      metadata: {
        operation: 'delete',
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log request workflow actions
   */
  static async logRequestAction(userId, action, requestId, oldValues, newValues, request) {
    await this.logAction({
      userId,
      action,
      resourceType: 'REQUEST',
      resourceId: requestId,
      oldValues,
      newValues,
      request,
      metadata: {
        workflow_action: action,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log stock operations
   */
  static async logStockOperation(userId, action, stockId, oldValues, newValues, request) {
    await this.logAction({
      userId,
      action,
      resourceType: 'STOCK',
      resourceId: stockId,
      oldValues,
      newValues,
      request,
      metadata: {
        stock_operation: action,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Get audit logs with filtering
   */
  static async getAuditLogs({
    page = 1,
    limit = 50,
    userId = null,
    action = null,
    resourceType = null,
    resourceId = null,
    status = null,
    dateFrom = null,
    dateTo = null,
    search = null
  }) {
    const offset = (page - 1) * limit;
    const whereClause = {};

    if (userId) whereClause.user_id = userId;
    if (action) whereClause.action = action;
    if (resourceType) whereClause.entity = resourceType;
    if (resourceId) whereClause.entity_id = resourceId;
    if (status) whereClause.status = status;

    // Date range filtering
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) {
        whereClause.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.created_at[Op.lte] = new Date(dateTo);
      }
    }

    // Search in action and entity
    if (search) {
      whereClause[Op.or] = [
        { action: { [Op.like]: `%${search}%` } },
        { entity: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'auditUser',
          attributes: ['id', 'full_name', 'email', 'role_id'],
          include: [
            {
              model: require('../../models').Role,
              as: 'role',
              attributes: ['name']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      auditLogs,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    };
  }

  /**
   * Get system statistics
   */
  static async getSystemStats(dateFrom = null, dateTo = null) {
    const whereClause = {};
    
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) {
        whereClause.created_at[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.created_at[Op.lte] = new Date(dateTo);
      }
    }

    // Get total actions count
    const totalActions = await AuditLog.count({ where: whereClause });

    // Get actions by type
    const actionsByType = await AuditLog.findAll({
      attributes: [
        'action',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['action'],
      order: [[AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'DESC']]
    });

    // Get actions by resource type
    const actionsByResource = await AuditLog.findAll({
      attributes: [
        'entity',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['entity'],
      order: [[AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'DESC']]
    });

    // Get actions by status
    const actionsByStatus = await AuditLog.findAll({
      attributes: [
        'status',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'count']
      ],
      where: whereClause,
      group: ['status']
    });

    // Get most active users
    const mostActiveUsers = await AuditLog.findAll({
      attributes: [
        'user_id',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'action_count']
      ],
      where: {
        ...whereClause,
        user_id: { [Op.ne]: null }
      },
      include: [
        {
          model: User,
          as: 'auditUser',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      group: ['user_id', 'auditUser.id', 'auditUser.full_name', 'auditUser.email'],
      order: [[AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('id')), 'DESC']],
      limit: 10
    });

    // Get recent activity (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const recentActivity = await AuditLog.count({
      where: {
        ...whereClause,
        created_at: { [Op.gte]: yesterday }
      }
    });

    return {
      total_actions: totalActions,
      recent_activity_24h: recentActivity,
      actions_by_type: actionsByType,
      actions_by_resource: actionsByResource,
      actions_by_status: actionsByStatus,
      most_active_users: mostActiveUsers,
      date_range: {
        from: dateFrom,
        to: dateTo
      }
    };
  }

  /**
   * Clean up old audit logs (for maintenance)
   */
  static async cleanupOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await AuditLog.destroy({
      where: {
        created_at: { [Op.lt]: cutoffDate }
      }
    });

    return deletedCount;
  }
}

module.exports = AuditService;

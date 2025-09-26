const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireAdminOrPadiri } = require('../middleware/auth');

// Test endpoint
router.get('/test', authenticate, requireAdminOrPadiri, adminController.testAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative functions for system management
 */

/**
 * @swagger
 * /api/admin/audit-logs:
 *   get:
 *     summary: Get comprehensive audit logs (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action type
 *       - in: query
 *         name: resource_type
 *         schema:
 *           type: string
 *         description: Filter by resource type
 *       - in: query
 *         name: resource_id
 *         schema:
 *           type: integer
 *         description: Filter by resource ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILED, PENDING]
 *         description: Filter by action status
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in action and resource type
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     auditLogs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           user_id:
 *                             type: integer
 *                           action:
 *                             type: string
 *                           resource_type:
 *                             type: string
 *                           resource_id:
 *                             type: integer
 *                           old_values:
 *                             type: object
 *                           new_values:
 *                             type: object
 *                           ip_address:
 *                             type: string
 *                           user_agent:
 *                             type: string
 *                           status:
 *                             type: string
 *                           error_message:
 *                             type: string
 *                           metadata:
 *                             type: object
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               full_name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               role:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *                         total_items:
 *                           type: integer
 *                         items_per_page:
 *                           type: integer
 *                 message:
 *                   type: string
 *                   example: Audit logs retrieved successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/audit-logs', authenticate, requireAdminOrPadiri, adminController.getAuditLogs);

/**
 * @swagger
 * /api/admin/system-configs:
 *   get:
 *     summary: Get all system configurations
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by configuration category
 *       - in: query
 *         name: is_editable
 *         schema:
 *           type: boolean
 *         description: Filter by editable configurations
 *     responses:
 *       200:
 *         description: System configurations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     configs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           key:
 *                             type: string
 *                           value:
 *                             type: string
 *                           type:
 *                             type: string
 *                           category:
 *                             type: string
 *                           description:
 *                             type: string
 *                           is_editable:
 *                             type: boolean
 *                           is_public:
 *                             type: boolean
 *                           validation_rules:
 *                             type: object
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Admin/Padiri access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/system-configs', authenticate, requireAdminOrPadiri, adminController.getSystemConfigs);

/**
 * @swagger
 * /api/admin/system-configs/{key}:
 *   get:
 *     summary: Get specific system configuration
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *     responses:
 *       200:
 *         description: System configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     config:
 *                       type: object
 *                       properties:
 *                         key:
 *                           type: string
 *                         value:
 *                           type: string
 *                         type:
 *                           type: string
 *                         category:
 *                           type: string
 *                         description:
 *                           type: string
 *                         is_editable:
 *                           type: boolean
 *                         is_public:
 *                           type: boolean
 *                         validation_rules:
 *                           type: object
 *       404:
 *         description: Configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/system-configs/:key', authenticate, requireAdminOrPadiri, adminController.getSystemConfig);

/**
 * @swagger
 * /api/admin/system-configs/{key}:
 *   put:
 *     summary: Update system configuration
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 description: New configuration value
 *               description:
 *                 type: string
 *                 description: Updated description
 *     responses:
 *       200:
 *         description: Configuration updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Configuration updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     config:
 *                       type: object
 *                       properties:
 *                         key:
 *                           type: string
 *                         value:
 *                           type: string
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - Invalid value or configuration not editable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Configuration not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/system-configs/:key', authenticate, requireAdminOrPadiri, adminController.updateSystemConfig);

/**
 * @swagger
 * /api/admin/system-stats:
 *   get:
 *     summary: Get system statistics and performance metrics (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (YYYY-MM-DD)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_actions:
 *                       type: integer
 *                       description: Total number of logged actions
 *                     recent_activity_24h:
 *                       type: integer
 *                       description: Actions in the last 24 hours
 *                     actions_by_type:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     actions_by_resource:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           resource_type:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     actions_by_status:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     most_active_users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user_id:
 *                             type: integer
 *                           action_count:
 *                             type: integer
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               full_name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                     system_metrics:
 *                       type: object
 *                       properties:
 *                         total_users:
 *                           type: integer
 *                         total_sites:
 *                           type: integer
 *                         total_materials:
 *                           type: integer
 *                         total_requests:
 *                           type: integer
 *                         total_stock_items:
 *                           type: integer
 *                         recent_requests_7d:
 *                           type: integer
 *                     requests_by_status:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           count:
 *                             type: integer
 *                     users_by_role:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           role_id:
 *                             type: integer
 *                           count:
 *                             type: integer
 *                           role:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                     system_health:
 *                       type: object
 *                       properties:
 *                         database_connection:
 *                           type: string
 *                         api_response_time:
 *                           type: string
 *                         error_rate:
 *                           type: string
 *                         uptime:
 *                           type: number
 *                 message:
 *                   type: string
 *                   example: System statistics retrieved successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/system-stats', authenticate, requireAdminOrPadiri, adminController.getSystemStats);

/**
 * @swagger
 * /api/admin/user-activity/{user_id}:
 *   get:
 *     summary: Get detailed activity for a specific user (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to get activity for
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of activities to retrieve
 *     responses:
 *       200:
 *         description: User activity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         full_name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         last_login:
 *                           type: string
 *                           format: date-time
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                     activity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           action:
 *                             type: string
 *                           resource_type:
 *                             type: string
 *                           resource_id:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *                         total_items:
 *                           type: integer
 *                         items_per_page:
 *                           type: integer
 *                 message:
 *                   type: string
 *                   example: User activity retrieved successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/user-activity/:user_id', authenticate, requireAdminOrPadiri, adminController.getUserActivity);

/**
 * @swagger
 * /api/admin/export-audit-logs:
 *   get:
 *     summary: Export audit logs in various formats (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, excel]
 *           default: json
 *         description: Export format
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for export (YYYY-MM-DD)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for export (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Audit logs exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *                   example: Audit logs exported successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/export-audit-logs', authenticate, requireAdminOrPadiri, adminController.exportAuditLogs);

/**
 * @swagger
 * /api/admin/cleanup-audit-logs:
 *   post:
 *     summary: Clean up old audit logs (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days_to_keep:
 *                 type: integer
 *                 default: 90
 *                 description: Number of days to keep audit logs
 *     responses:
 *       200:
 *         description: Audit logs cleaned up successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted_count:
 *                       type: integer
 *                     days_kept:
 *                       type: integer
 *                 message:
 *                   type: string
 *                   example: Cleaned up 150 old audit log entries
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/cleanup-audit-logs', authenticate, requireAdminOrPadiri, adminController.cleanupAuditLogs);

// System Configuration Management Routes
/**
 * @swagger
 * /api/admin/system-configs:
 *   get:
 *     summary: Get system configurations (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by configuration category
 *       - in: query
 *         name: is_public
 *         schema:
 *           type: boolean
 *         description: Filter by public visibility
 *     responses:
 *       200:
 *         description: System configurations retrieved successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/system-configs', authenticate, requireAdminOrPadiri, adminController.getSystemConfigs);

/**
 * @swagger
 * /api/admin/system-configs/{key}:
 *   get:
 *     summary: Get specific system configuration (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *     responses:
 *       200:
 *         description: System configuration retrieved successfully
 *       404:
 *         description: Configuration not found
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/system-configs/:key', authenticate, requireAdminOrPadiri, adminController.getSystemConfig);

/**
 * @swagger
 * /api/admin/system-configs/{key}:
 *   put:
 *     summary: Update system configuration (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 description: New configuration value
 *     responses:
 *       200:
 *         description: System configuration updated successfully
 *       400:
 *         description: Bad request - Invalid value or validation failed
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.put('/system-configs/:key', authenticate, requireAdminOrPadiri, adminController.updateSystemConfig);

// Database Maintenance Routes
/**
 * @swagger
 * /api/admin/database/stats:
 *   get:
 *     summary: Get database statistics (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database statistics retrieved successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/database/stats', authenticate, requireAdminOrPadiri, adminController.getDatabaseStats);

/**
 * @swagger
 * /api/admin/database/health:
 *   get:
 *     summary: Get database health status (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database health status retrieved successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/database/health', authenticate, requireAdminOrPadiri, adminController.getDatabaseHealth);

/**
 * @swagger
 * /api/admin/database/backup:
 *   post:
 *     summary: Create database backup (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               backup_name:
 *                 type: string
 *                 description: Custom backup filename
 *     responses:
 *       200:
 *         description: Database backup created successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.post('/database/backup', authenticate, requireAdminOrPadiri, adminController.createDatabaseBackup);

/**
 * @swagger
 * /api/admin/database/backups:
 *   get:
 *     summary: List database backups (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database backups retrieved successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/database/backups', authenticate, requireAdminOrPadiri, adminController.listDatabaseBackups);

/**
 * @swagger
 * /api/admin/database/restore:
 *   post:
 *     summary: Restore database from backup (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               backup_filename:
 *                 type: string
 *                 description: Backup filename to restore from
 *     responses:
 *       200:
 *         description: Database restored from backup successfully
 *       400:
 *         description: Bad request - Backup filename required
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.post('/database/restore', authenticate, requireAdminOrPadiri, adminController.restoreDatabaseBackup);

/**
 * @swagger
 * /api/admin/database/optimize:
 *   post:
 *     summary: Optimize database tables (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database optimization completed successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.post('/database/optimize', authenticate, requireAdminOrPadiri, adminController.optimizeDatabase);

/**
 * @swagger
 * /api/admin/database/cleanup:
 *   post:
 *     summary: Clean up old database data (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               audit_logs_days:
 *                 type: integer
 *                 default: 90
 *                 description: Days to retain audit logs
 *               old_backups_days:
 *                 type: integer
 *                 default: 30
 *                 description: Days to retain old backups
 *               empty_tables:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to clean empty tables
 *     responses:
 *       200:
 *         description: Database cleanup completed successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.post('/database/cleanup', authenticate, requireAdminOrPadiri, adminController.cleanupDatabase);

// Export Functionality Routes
/**
 * @swagger
 * /api/admin/export/users:
 *   get:
 *     summary: Export users data (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *         default: csv
 *         description: Export format
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: integer
 *         description: Filter by role ID
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Users exported successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/export/users', authenticate, requireAdminOrPadiri, adminController.exportUsers);

/**
 * @swagger
 * /api/admin/export/requests:
 *   get:
 *     summary: Export requests data (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *         default: csv
 *         description: Export format
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by request status
 *       - in: query
 *         name: site_id
 *         schema:
 *           type: integer
 *         description: Filter by site ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: Requests exported successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/export/requests', authenticate, requireAdminOrPadiri, adminController.exportRequests);

/**
 * @swagger
 * /api/admin/export/materials:
 *   get:
 *     summary: Export materials data (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *         default: csv
 *         description: Export format
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: unit_id
 *         schema:
 *           type: integer
 *         description: Filter by unit ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name or description
 *     responses:
 *       200:
 *         description: Materials exported successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/export/materials', authenticate, requireAdminOrPadiri, adminController.exportMaterials);

/**
 * @swagger
 * /api/admin/export/stock:
 *   get:
 *     summary: Export stock data (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *         default: csv
 *         description: Export format
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Filter by store ID
 *       - in: query
 *         name: material_id
 *         schema:
 *           type: integer
 *         description: Filter by material ID
 *       - in: query
 *         name: low_stock
 *         schema:
 *           type: boolean
 *         description: Filter low stock items only
 *     responses:
 *       200:
 *         description: Stock exported successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/export/stock', authenticate, requireAdminOrPadiri, adminController.exportStock);

/**
 * @swagger
 * /api/admin/export/audit-logs:
 *   get:
 *     summary: Export audit logs data (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *         default: csv
 *         description: Export format
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10000
 *         description: Maximum records to export
 *     responses:
 *       200:
 *         description: Audit logs exported successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/export/audit-logs', authenticate, requireAdminOrPadiri, adminController.exportAuditLogsData);

/**
 * @swagger
 * /api/admin/export/system-configs:
 *   get:
 *     summary: Export system configurations data (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *         default: csv
 *         description: Export format
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: is_public
 *         schema:
 *           type: boolean
 *         description: Filter by public visibility
 *     responses:
 *       200:
 *         description: System configurations exported successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/export/system-configs', authenticate, requireAdminOrPadiri, adminController.exportSystemConfigs);

/**
 * @swagger
 * /api/admin/export/system-report:
 *   get:
 *     summary: Generate comprehensive system report (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *         default: json
 *         description: Export format
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from date
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to date
 *     responses:
 *       200:
 *         description: System report generated successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/export/system-report', authenticate, requireAdminOrPadiri, adminController.generateSystemReport);

/**
 * @swagger
 * /api/admin/export/files:
 *   get:
 *     summary: List available export files (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Export files retrieved successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.get('/export/files', authenticate, requireAdminOrPadiri, adminController.listExports);

/**
 * @swagger
 * /api/admin/export/cleanup:
 *   post:
 *     summary: Clean up old export files (Admin/Padiri only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days_old:
 *                 type: integer
 *                 default: 7
 *                 description: Delete files older than this many days
 *     responses:
 *       200:
 *         description: Export cleanup completed successfully
 *       403:
 *         description: Forbidden - Admin or Padiri access required
 */
router.post('/export/cleanup', authenticate, requireAdminOrPadiri, adminController.cleanupExports);

module.exports = router;

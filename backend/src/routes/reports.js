const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: System reports and analytics
 */

/**
 * @swagger
 * /api/reports/requests:
 *   get:
 *     summary: Get request reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *       - in: query
 *         name: site_id
 *         schema:
 *           type: integer
 *         description: Filter by site
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, DSE_REVIEW, PADIRI_REVIEW, APPROVED, REJECTED, ISSUED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Request reports retrieved successfully
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_requests:
 *                           type: integer
 *                         approved_requests:
 *                           type: integer
 *                         rejected_requests:
 *                           type: integer
 *                         pending_requests:
 *                           type: integer
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Request'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/requests', authenticate, authorize('ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'), reportController.getRequestReports);

/**
 * @swagger
 * /api/reports/inventory:
 *   get:
 *     summary: Get inventory reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Filter by store
 *       - in: query
 *         name: low_stock
 *         schema:
 *           type: boolean
 *         description: Show only low stock items
 *     responses:
 *       200:
 *         description: Inventory reports retrieved successfully
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_items:
 *                           type: integer
 *                         low_stock_items:
 *                           type: integer
 *                         out_of_stock_items:
 *                           type: integer
 *                         total_value:
 *                           type: number
 *                     inventory:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Stock'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/inventory', authenticate, authorize('ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'), reportController.getInventoryReports);


/**
 * @swagger
 * /api/reports/stock-movements:
 *   get:
 *     summary: Get stock movement reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *       - in: query
 *         name: material_id
 *         schema:
 *           type: integer
 *         description: Filter by material
 *       - in: query
 *         name: movement_type
 *         schema:
 *           type: string
 *           enum: [IN, OUT, TRANSFER, ADJUSTMENT]
 *         description: Filter by movement type
 *     responses:
 *       200:
 *         description: Stock movement reports retrieved successfully
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_movements:
 *                           type: integer
 *                         total_in:
 *                           type: number
 *                         total_out:
 *                           type: number
 *                         net_movement:
 *                           type: number
 *                     movements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           material_id:
 *                             type: integer
 *                           movement_type:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           reference_type:
 *                             type: string
 *                           reference_id:
 *                             type: integer
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stock-movements', authenticate, authorize('ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'), reportController.getStockMovementReports);

/**
 * @swagger
 * /api/reports/procurement:
 *   get:
 *     summary: Get procurement reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *       - in: query
 *         name: supplier_id
 *         schema:
 *           type: integer
 *         description: Filter by supplier
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, SENT, RECEIVED, CANCELLED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Procurement reports retrieved successfully
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_orders:
 *                           type: integer
 *                         total_value:
 *                           type: number
 *                         pending_orders:
 *                           type: integer
 *                         completed_orders:
 *                           type: integer
 *                     purchase_orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PurchaseOrder'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/procurement', authenticate, authorize('ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'), reportController.getProcurementReports);

/**
 * @swagger
 * /api/reports/user-activity:
 *   get:
 *     summary: Get user activity reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *     responses:
 *       200:
 *         description: User activity reports retrieved successfully
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
 *                     userActivity:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           user_name:
 *                             type: string
 *                           total_requests:
 *                             type: integer
 *                           approved_requests:
 *                             type: integer
 *                           rejected_requests:
 *                             type: integer
 *                           pending_requests:
 *                             type: integer
 *                     total_users:
 *                       type: integer
 *                     total_requests:
 *                       type: integer
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/user-activity', authenticate, authorize('ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'), reportController.getUserActivityReports);

/**
 * @swagger
 * /api/reports/site-performance:
 *   get:
 *     summary: Get site performance reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: site_id
 *         schema:
 *           type: integer
 *         description: Filter by site
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for report
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for report
 *     responses:
 *       200:
 *         description: Site performance reports retrieved successfully
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
 *                     sitePerformance:
 *                       type: object
 *                       additionalProperties:
 *                         type: object
 *                         properties:
 *                           site_name:
 *                             type: string
 *                           total_requests:
 *                             type: integer
 *                           total_value:
 *                             type: number
 *                           approved_requests:
 *                             type: integer
 *                           rejected_requests:
 *                             type: integer
 *                           pending_requests:
 *                             type: integer
 *                     total_sites:
 *                       type: integer
 *                     total_requests:
 *                       type: integer
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/site-performance', authenticate, authorize('ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'), reportController.getSitePerformanceReports);

module.exports = router;

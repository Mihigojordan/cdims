const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Stock
 *   description: Stock management and inventory tracking
 */

/**
 * @swagger
 * /api/stock:
 *   get:
 *     summary: Get all stock levels
 *     tags: [Stock]
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
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Filter by store
 *       - in: query
 *         name: low_stock
 *         schema:
 *           type: boolean
 *         description: Filter low stock items
 *     responses:
 *       200:
 *         description: Stock levels retrieved successfully
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
 *                     stock:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Stock'
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
 */
router.get('/', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.getAllStock);

/**
 * @swagger
 * /api/stock/movements:
 *   get:
 *     summary: Get stock movements
 *     tags: [Stock]
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
 *           default: 10
 *         description: Items per page
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
 *         description: Stock movements retrieved successfully
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
 */
router.get('/movements', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.getStockMovements);

/**
 * @swagger
 * /api/stock/history:
 *   get:
 *     summary: Get stock history with date range filtering
 *     tags: [Stock]
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
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: stock_id
 *         schema:
 *           type: integer
 *         description: Filter by stock ID
 *       - in: query
 *         name: material_id
 *         schema:
 *           type: integer
 *         description: Filter by material ID
 *       - in: query
 *         name: store_id
 *         schema:
 *           type: integer
 *         description: Filter by store ID
 *       - in: query
 *         name: movement_type
 *         schema:
 *           type: string
 *           enum: [IN, OUT, ADJUSTMENT]
 *         description: Filter by movement type
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Stock history retrieved successfully
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
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           stock_id:
 *                             type: integer
 *                           material_id:
 *                             type: integer
 *                           store_id:
 *                             type: integer
 *                           movement_type:
 *                             type: string
 *                             enum: [IN, OUT, ADJUSTMENT]
 *                           source_type:
 *                             type: string
 *                             enum: [GRN, ISSUE, ADJUSTMENT, RECEIPT]
 *                           qty_before:
 *                             type: number
 *                           qty_change:
 *                             type: number
 *                           qty_after:
 *                             type: number
 *                           notes:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           material:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               code:
 *                                 type: string
 *                               unit:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                           store:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               code:
 *                                 type: string
 *                           createdBy:
 *                             type: object
 *                             properties:
 *                               full_name:
 *                                 type: string
 *                               email:
 *                                 type: string
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
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/history', authenticate, authorize('STOREKEEPER', 'ADMIN', 'PADIRI'), stockController.getStockHistory);

/**
 * @swagger
 * /api/stock/procurement-recommendations:
 *   get:
 *     summary: Get procurement recommendations
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [CRITICAL, HIGH, MEDIUM]
 *         description: Filter by priority level
 *     responses:
 *       200:
 *         description: Procurement recommendations retrieved successfully
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
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           material_id:
 *                             type: integer
 *                           material_name:
 *                             type: string
 *                           current_stock:
 *                             type: number
 *                           reorder_level:
 *                             type: number
 *                           priority:
 *                             type: string
 *                             enum: [CRITICAL, HIGH, MEDIUM]
 *                           suggested_qty:
 *                             type: number
 *                           reason:
 *                             type: string
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/procurement-recommendations', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.getProcurementRecommendations);

/**
 * @swagger
 * /api/stock/issuable-requests:
 *   get:
 *     summary: Get requests ready for material issuance
 *     tags: [Stock]
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
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: site_id
 *         schema:
 *           type: integer
 *         description: Filter by site
 *     responses:
 *       200:
 *         description: Issuable requests retrieved successfully
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
 *                     requests:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Request'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/issuable-requests', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.getIssuableRequests);

/**
 * @swagger
 * /api/stock/issued-materials:
 *   get:
 *     summary: Get issued materials history
 *     tags: [Stock]
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
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: request_id
 *         schema:
 *           type: integer
 *         description: Filter by request ID
 *       - in: query
 *         name: site_id
 *         schema:
 *           type: integer
 *         description: Filter by site
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
 *         description: Issued materials retrieved successfully
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
 *                     issued_materials:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StockMovement'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/issued-materials', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.getIssuedMaterials);

/**
 * @swagger
 * /api/stock/issue-materials:
 *   post:
 *     summary: Issue materials to site engineers with automatic remaining quantity updates
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - request_id
 *               - items
 *             properties:
 *               request_id:
 *                 type: integer
 *                 description: Request ID
 *                 example: 1
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - request_item_id
 *                     - qty_issued
 *                     - store_id
 *                   properties:
 *                     request_item_id:
 *                       type: integer
 *                       description: Request item ID
 *                       example: 1
 *                     qty_issued:
 *                       type: number
 *                       description: Quantity to issue (supports partial issues)
 *                       example: 10
 *                     store_id:
 *                       type: integer
 *                       description: Store ID
 *                       example: 1
 *                     notes:
 *                       type: string
 *                       description: Additional notes
 *                       example: Issued for urgent construction work
 *     responses:
 *       200:
 *         description: Materials issued successfully with automatic quantity updates
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
 *                   example: Materials issued successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     request_id:
 *                       type: integer
 *                     issued_items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           request_item_id:
 *                             type: integer
 *                           material_name:
 *                             type: string
 *                           qty_issued:
 *                             type: number
 *                           store_id:
 *                             type: integer
 *                     stock_movements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StockMovement'
 *                     request_status:
 *                       type: string
 *                       enum: [ISSUED, PARTIALLY_ISSUED]
 *                       description: PARTIALLY_ISSUED when some items issued, ISSUED when all items issued
 *       400:
 *         description: Bad request - Invalid data or insufficient stock
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/issue-materials', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.issueMaterials);





/**
 * @swagger
 * /api/stock/alerts/low-stock:
 *   get:
 *     summary: Get low stock alerts
 *     tags: [Stock]
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
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: acknowledged
 *         schema:
 *           type: boolean
 *         description: Filter by acknowledgment status
 *     responses:
 *       200:
 *         description: Low stock alerts retrieved successfully
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
 *                     alerts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Stock'
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
 */
router.get('/alerts/low-stock', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.getLowStockAlerts);

/**
 * @swagger
 * /api/stock:
 *   post:
 *     summary: Create new stock record
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - material_id
 *               - store_id
 *               - qty_on_hand
 *             properties:
 *               material_id:
 *                 type: integer
 *                 description: Material ID
 *                 example: 1
 *               store_id:
 *                 type: integer
 *                 description: Store ID
 *                 example: 1
 *               qty_on_hand:
 *                 type: number
 *                 description: Quantity on hand
 *                 example: 100
 *               reorder_level:
 *                 type: number
 *                 description: Reorder level
 *                 example: 20
 *               low_stock_threshold:
 *                 type: number
 *                 description: Low stock threshold
 *                 example: 10
 *     responses:
 *       201:
 *         description: Stock record created successfully
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
 *                   example: Stock record created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     stock:
 *                       $ref: '#/components/schemas/Stock'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.createStock);

/**
 * @swagger
 * /api/stock/{id}:
 *   get:
 *     summary: Get stock by ID
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stock ID
 *     responses:
 *       200:
 *         description: Stock retrieved successfully
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
 *                     stock:
 *                       $ref: '#/components/schemas/Stock'
 *       404:
 *         description: Stock not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.getStockById);
router.get('material/:id', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.getStockByMaterialId);

/**
 * @swagger
 * /api/stock/{id}:
 *   put:
 *     summary: Update stock level
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stock ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qty_on_hand:
 *                 type: number
 *                 example: 100
 *               reorder_level:
 *                 type: number
 *                 example: 20
 *               low_stock_threshold:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Stock updated successfully
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
 *                   example: Stock updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     stock:
 *                       $ref: '#/components/schemas/Stock'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Stock not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.updateStock);


/**
 * @swagger
 * /api/stock/{id}/threshold:
 *   put:
 *     summary: Set low stock threshold
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stock ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - low_stock_threshold
 *             properties:
 *               low_stock_threshold:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Threshold set successfully
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
 *                   example: Low stock threshold updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     stock:
 *                       $ref: '#/components/schemas/Stock'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Stock not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/threshold', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.setLowStockThreshold);

/**
 * @swagger
 * /api/stock/{id}/acknowledge-alert:
 *   put:
 *     summary: Acknowledge low stock alert
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stock ID
 *     responses:
 *       200:
 *         description: Alert acknowledged successfully
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
 *                   example: Low stock alert acknowledged
 *                 data:
 *                   type: object
 *                   properties:
 *                     stock:
 *                       $ref: '#/components/schemas/Stock'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Stock not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id/acknowledge-alert', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.acknowledgeLowStockAlert);

/**
 * @swagger
 * /api/stock/{id}/add-quantity:
 *   post:
 *     summary: Add quantity to stock (Storekeeper)
 *     tags: [Stock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Stock ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - qty_to_add
 *             properties:
 *               qty_to_add:
 *                 type: number
 *                 description: Quantity to add to existing stock
 *                 example: 50
 *               notes:
 *                 type: string
 *                 description: Notes about the stock addition
 *                 example: Received new shipment from supplier
 *     responses:
 *       200:
 *         description: Stock quantity added successfully
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
 *                   example: Stock quantity added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     stock:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         material_id:
 *                           type: integer
 *                         store_id:
 *                           type: integer
 *                         previous_qty:
 *                           type: number
 *                         added_qty:
 *                           type: number
 *                         new_qty:
 *                           type: number
 *                         low_stock_alert:
 *                           type: boolean
 *                     stock_movement:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         movement_type:
 *                           type: string
 *                           enum: [IN]
 *                         qty:
 *                           type: number
 *                         notes:
 *                           type: string
 *       400:
 *         description: Bad request - Invalid quantity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Stock not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:id/add-quantity', authenticate, authorize('STOREKEEPER', 'ADMIN','PADIRI'), stockController.addStockQuantity);

module.exports = router;

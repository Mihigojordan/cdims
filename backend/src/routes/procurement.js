const express = require('express');
const router = express.Router();
const procurementController = require('../controllers/procurementController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Procurement
 *   description: Procurement management including suppliers, purchase orders, and goods receipts
 */

/**
 * @swagger
 * /api/procurement/suppliers:
 *   get:
 *     summary: Get all suppliers
 *     tags: [Procurement]
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
 *     responses:
 *       200:
 *         description: Suppliers retrieved successfully
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
 *                     suppliers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           contact:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           email:
 *                             type: string
 *                           address:
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
 */
router.get('/suppliers', authenticate, procurementController.getSuppliers);

/**
 * @swagger
 * /api/procurement/suppliers:
 *   post:
 *     summary: Create new supplier
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contact
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: ABC Construction Supplies
 *               contact:
 *                 type: string
 *                 example: John Smith
 *               phone:
 *                 type: string
 *                 example: +250788123456
 *               email:
 *                 type: string
 *                 format: email
 *                 example: contact@abcconstruction.rw
 *               address:
 *                 type: string
 *                 example: Kigali, Rwanda
 *     responses:
 *       201:
 *         description: Supplier created successfully
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
 *                   example: Supplier created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     supplier:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         contact:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         email:
 *                           type: string
 *                         address:
 *                           type: string
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
router.post('/suppliers', authenticate, authorize('PROCUREMENT'), procurementController.createSupplier);

/**
 * @swagger
 * /api/procurement/purchase-orders:
 *   get:
 *     summary: Get all purchase orders
 *     tags: [Procurement]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, SENT, RECEIVED, CANCELLED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Purchase orders retrieved successfully
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
 *                     purchase_orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PurchaseOrder'
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
router.get('/purchase-orders', authenticate, procurementController.getPurchaseOrders);

/**
 * @swagger
 * /api/procurement/purchase-orders:
 *   post:
 *     summary: Create new purchase order
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplier_id
 *               - items
 *             properties:
 *               supplier_id:
 *                 type: integer
 *                 example: 1
 *               notes:
 *                 type: string
 *                 example: Urgent order for construction materials
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - material_id
 *                     - unit_id
 *                     - qty_ordered
 *                     - unit_price
 *                   properties:
 *                     material_id:
 *                       type: integer
 *                       example: 1
 *                     unit_id:
 *                       type: integer
 *                       example: 1
 *                     qty_ordered:
 *                       type: number
 *                       example: 100
 *                     unit_price:
 *                       type: number
 *                       example: 25.00
 *     responses:
 *       201:
 *         description: Purchase order created successfully
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
 *                   example: Purchase order created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchase_order:
 *                       $ref: '#/components/schemas/PurchaseOrder'
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
router.post('/purchase-orders', authenticate, authorize('PROCUREMENT'), procurementController.createPurchaseOrder);

/**
 * @swagger
 * /api/procurement/purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order by ID
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order retrieved successfully
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
 *                     purchase_order:
 *                       $ref: '#/components/schemas/PurchaseOrder'
 *       404:
 *         description: Purchase order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/purchase-orders/:id', authenticate, procurementController.getPurchaseOrderById);

/**
 * @swagger
 * /api/procurement/purchase-orders/{id}:
 *   put:
 *     summary: Update purchase order
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplier_id:
 *                 type: integer
 *                 example: 1
 *               notes:
 *                 type: string
 *                 example: Updated order notes
 *               status:
 *                 type: string
 *                 enum: [DRAFT, SENT, RECEIVED, CANCELLED]
 *                 example: SENT
 *     responses:
 *       200:
 *         description: Purchase order updated successfully
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
 *                   example: Purchase order updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchase_order:
 *                       $ref: '#/components/schemas/PurchaseOrder'
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
 *         description: Purchase order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/purchase-orders/:id', authenticate, authorize('PROCUREMENT'), procurementController.updatePurchaseOrder);

/**
 * @swagger
 * /api/procurement/purchase-orders/{id}/send:
 *   post:
 *     summary: Send purchase order to supplier
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Purchase order ID
 *     responses:
 *       200:
 *         description: Purchase order sent successfully
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
 *                   example: Purchase order sent to supplier
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchase_order:
 *                       $ref: '#/components/schemas/PurchaseOrder'
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
 *         description: Purchase order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/purchase-orders/:id/send', authenticate, authorize('PROCUREMENT'), procurementController.sendPurchaseOrder);

/**
 * @swagger
 * /api/procurement/goods-receipts:
 *   get:
 *     summary: Get all goods receipts
 *     tags: [Procurement]
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
 *     responses:
 *       200:
 *         description: Goods receipts retrieved successfully
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
 *                     goods_receipts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           purchase_order_id:
 *                             type: integer
 *                           received_by:
 *                             type: integer
 *                           received_at:
 *                             type: string
 *                             format: date-time
 *                           notes:
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
 */
router.get('/goods-receipts', authenticate, procurementController.getGoodsReceipts);

/**
 * @swagger
 * /api/procurement/goods-receipts:
 *   post:
 *     summary: Create goods receipt
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - purchase_order_id
 *               - items
 *             properties:
 *               purchase_order_id:
 *                 type: integer
 *                 example: 1
 *               notes:
 *                 type: string
 *                 example: All items received in good condition
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - material_id
 *                     - qty_received
 *                   properties:
 *                     material_id:
 *                       type: integer
 *                       example: 1
 *                     qty_received:
 *                       type: number
 *                       example: 100
 *                     condition:
 *                       type: string
 *                       example: Good
 *     responses:
 *       201:
 *         description: Goods receipt created successfully
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
 *                   example: Goods receipt created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     goods_receipt:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         purchase_order_id:
 *                           type: integer
 *                         received_by:
 *                           type: integer
 *                         received_at:
 *                           type: string
 *                           format: date-time
 *                         notes:
 *                           type: string
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
router.post('/goods-receipts', authenticate, authorize('STOREKEEPER'), procurementController.createGoodsReceipt);

/**
 * @swagger
 * /api/procurement/goods-receipts/{id}:
 *   get:
 *     summary: Get goods receipt by ID
 *     tags: [Procurement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Goods receipt ID
 *     responses:
 *       200:
 *         description: Goods receipt retrieved successfully
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
 *                     goods_receipt:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         purchase_order_id:
 *                           type: integer
 *                         received_by:
 *                           type: integer
 *                         received_at:
 *                           type: string
 *                           format: date-time
 *                         notes:
 *                           type: string
 *                         items:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               material_id:
 *                                 type: integer
 *                               qty_received:
 *                                 type: number
 *                               condition:
 *                                 type: string
 *       404:
 *         description: Goods receipt not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/goods-receipts/:id', authenticate, procurementController.getGoodsReceiptById);

module.exports = router;

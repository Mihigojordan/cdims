const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Material request management
 */

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get all requests
 *     tags: [Requests]
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
 *           enum: [PENDING, SUBMITTED, DSE_REVIEW, VERIFIED, WAITING_PADIRI_REVIEW, APPROVED, PARTIALLY_ISSUED, ISSUED, RECEIVED, REJECTED, CLOSED]
 *         description: Filter by request status
 *       - in: query
 *         name: site_id
 *         schema:
 *           type: integer
 *         description: Filter by site ID
 *       - in: query
 *         name: requested_by
 *         schema:
 *           type: integer
 *         description: Filter by user ID who created the request
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
 *         name: material_id
 *         schema:
 *           type: integer
 *         description: Filter by material ID
 *       - in: query
 *         name: ref_no
 *         schema:
 *           type: string
 *         description: Filter by reference number (partial match)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in request notes and reference number
 *     responses:
 *       200:
 *         description: Requests retrieved successfully
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
router.get('/', authenticate, requestController.getAllRequests);

/**
 * @swagger
 * /api/requests/my-requests:
 *   get:
 *     summary: Get my requests (SITE_ENGINEER only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SUBMITTED, DSE_REVIEW, WAITING_PADIRI_REVIEW, APPROVED, VERIFIED, ISSUED_FROM_APPROVED, PARTIALLY_ISSUED, ISSUED, RECEIVED, REJECTED, CLOSED]
 *     responses:
 *       200:
 *         description: My requests retrieved successfully
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
 */
router.get('/my-requests', authenticate, authorize('SITE_ENGINEER'), requestController.getMyRequests);

/**
 * @swagger
 * /api/requests/site-engineer:
 *   get:
 *     summary: Get requests with enhanced filtering for Site Engineers
 *     tags: [Requests]
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
 *           enum: [PENDING, SUBMITTED, DSE_REVIEW, VERIFIED, WAITING_PADIRI_REVIEW, APPROVED, PARTIALLY_ISSUED, ISSUED, RECEIVED, REJECTED, CLOSED]
 *         description: Filter by request status
 *       - in: query
 *         name: site_id
 *         schema:
 *           type: integer
 *         description: Filter by site ID
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
 *         name: material_id
 *         schema:
 *           type: integer
 *         description: Filter by material ID
 *       - in: query
 *         name: ref_no
 *         schema:
 *           type: string
 *         description: Filter by reference number (partial match)
 *     responses:
 *       200:
 *         description: Enhanced requests retrieved successfully
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           ref_no:
 *                             type: string
 *                           status:
 *                             type: string
 *                           site:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                           requestedBy:
 *                             type: object
 *                             properties:
 *                               full_name:
 *                                 type: string
 *                               role:
 *                                 type: object
 *                                 properties:
 *                                   name:
 *                                     type: string
 *                           items:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 material:
 *                                   type: object
 *                                   properties:
 *                                     id:
 *                                       type: integer
 *                                     name:
 *                                       type: string
 *                                     code:
 *                                       type: string
 *                                     specification:
 *                                       type: string
 *                                     unit:
 *                                       type: object
 *                                       properties:
 *                                         name:
 *                                           type: string
 *                                 unit:
 *                                   type: object
 *                                   properties:
 *                                     name:
 *                                       type: string
 *                                 qty_requested:
 *                                   type: number
 *                                 qty_approved:
 *                                   type: number
 *                                 qty_issued:
 *                                   type: number
 *                                 qty_received:
 *                                   type: number
 *                                 qty_remaining_to_issue:
 *                                   type: number
 *                                 qty_remaining_to_receive:
 *                                   type: number
 *                                 is_fully_issued:
 *                                   type: boolean
 *                                 is_fully_received:
 *                                   type: boolean
 *                                 issued_at:
 *                                   type: string
 *                                   format: date-time
 *                                 received_at:
 *                                   type: string
 *                                   format: date-time
 *                           summary:
 *                             type: object
 *                             properties:
 *                               total_items:
 *                                 type: integer
 *                               total_qty_requested:
 *                                 type: number
 *                               total_qty_approved:
 *                                 type: number
 *                               total_qty_issued:
 *                                 type: number
 *                               total_qty_received:
 *                                 type: number
 *                               fully_issued_items:
 *                                 type: integer
 *                               fully_received_items:
 *                                 type: integer
 *                               completion_percentage:
 *                                 type: integer
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
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
 *                     filters_applied:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                         site_id:
 *                           type: integer
 *                         date_from:
 *                           type: string
 *                         date_to:
 *                           type: string
 *                         material_id:
 *                           type: integer
 *                         ref_no:
 *                           type: string
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/site-engineer', authenticate, requestController.getSiteEngineerRequests);

/**
 * @swagger
 * /api/requests/available-sites:
 *   get:
 *     summary: Get available sites for user
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available sites retrieved successfully
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
 *                     $ref: '#/components/schemas/Site'
 */
router.get('/available-sites', authenticate, requestController.getAvailableSites);

/**
 * @swagger
 * /api/requests/site/{site_id}:
 *   get:
 *     summary: Get requests for specific site
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: site_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Site ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, SUBMITTED, DSE_REVIEW, WAITING_PADIRI_REVIEW, APPROVED, VERIFIED, ISSUED_FROM_APPROVED, PARTIALLY_ISSUED, ISSUED, RECEIVED, REJECTED, CLOSED]
 *     responses:
 *       200:
 *         description: Site requests retrieved successfully
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
 */
router.get('/site/:site_id', authenticate, requestController.getRequestsBySite);

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get request by ID
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request retrieved successfully
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
 *                     request:
 *                       $ref: '#/components/schemas/Request'
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticate, requestController.getRequestById);

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create new material request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - site_id
 *               - items
 *             properties:
 *               site_id:
 *                 type: integer
 *                 description: Site ID (must be assigned to SITE_ENGINEER)
 *                 example: 1
 *               notes:
 *                 type: string
 *                 description: Request notes
 *                 example: Materials for construction project
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - material_id
 *                     - unit_id
 *                     - qty_requested
 *                   properties:
 *                     material_id:
 *                       type: integer
 *                       example: 1
 *                     unit_id:
 *                       type: integer
 *                       example: 1
 *                     qty_requested:
 *                       type: number
 *                       example: 50
 *     responses:
 *       201:
 *         description: Request created successfully
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
 *                   example: Request created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       $ref: '#/components/schemas/Request'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Site not assigned to user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, authorize('SITE_ENGINEER', 'ADMIN'), requestController.createRequest);

/**
 * @swagger
 * /api/requests/{id}:
 *   put:
 *     summary: Update request (SITE_ENGINEER only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               site_id:
 *                 type: integer
 *                 description: Site ID (must be assigned to SITE_ENGINEER)
 *               notes:
 *                 type: string
 *                 description: Request notes
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Request item ID (for updates)
 *                     material_id:
 *                       type: integer
 *                     unit_id:
 *                       type: integer
 *                     qty_requested:
 *                       type: number
 *     responses:
 *       200:
 *         description: Request updated successfully
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
 *                   example: Request updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       $ref: '#/components/schemas/Request'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized or site not assigned
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
router.put('/:id', authenticate, authorize('SITE_ENGINEER'), requestController.updateRequest);


/**
 * @swagger
 * /api/requests/{id}/modify:
 *   put:
 *     summary: Modify request items and quantities (ADMIN, PADIRI, DIOCESAN_SITE_ENGINEER)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Modification notes
 *               modification_reason:
 *                 type: string
 *                 description: Reason for modification
 *               item_modifications:
 *                 type: array
 *                 description: Modify existing items (quantities, materials, units)
 *                 items:
 *                   type: object
 *                   properties:
 *                     request_item_id:
 *                       type: integer
 *                       description: Request item ID to modify
 *                     material_id:
 *                       type: integer
 *                       description: New material ID (optional)
 *                     unit_id:
 *                       type: integer
 *                       description: New unit ID (optional)
 *                     qty_requested:
 *                       type: number
 *                       description: New requested quantity (optional)
 *                     qty_approved:
 *                       type: number
 *                       description: New approved quantity (optional)
 *               items_to_add:
 *                 type: array
 *                 description: Add new items to the request
 *                 items:
 *                   type: object
 *                   required:
 *                     - material_id
 *                     - unit_id
 *                     - qty_requested
 *                   properties:
 *                     material_id:
 *                       type: integer
 *                       description: Material ID
 *                     unit_id:
 *                       type: integer
 *                       description: Unit ID
 *                     qty_requested:
 *                       type: number
 *                       description: Requested quantity
 *                     qty_approved:
 *                       type: number
 *                       description: Approved quantity (defaults to qty_requested)
 *               items_to_remove:
 *                 type: array
 *                 description: Remove items from the request
 *                 items:
 *                   type: integer
 *                   description: Request item IDs to remove
 *     responses:
 *       200:
 *         description: Request modified successfully
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
 *                   example: Request modified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       $ref: '#/components/schemas/Request'
 *                     modifications:
 *                       type: object
 *                       properties:
 *                         items_modified:
 *                           type: integer
 *                           description: Number of items modified
 *                         items_added:
 *                           type: integer
 *                           description: Number of items added
 *                         items_removed:
 *                           type: integer
 *                           description: Number of items removed
 *                         new_status:
 *                           type: string
 *                           description: New request status after modification
 *       400:
 *         description: Bad request - Invalid modification data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized or cannot modify at current status
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
router.put('/:id/modify', authenticate, authorize('ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'), requestController.modifyRequest);

/**
 * @swagger
 * /api/requests/{id}/approve:
 *   post:
 *     summary: Approve request with optional item modifications (DIOCESAN_SITE_ENGINEER or PADIRI)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [DSE, PADIRI]
 *                 description: Approval level
 *               comment:
 *                 type: string
 *                 description: Approval comments
 *                 example: Request approved for processing
 *               item_modifications:
 *                 type: array
 *                 description: Modify existing items (optional)
 *                 items:
 *                   type: object
 *                   required:
 *                     - request_item_id
 *                   properties:
 *                     request_item_id:
 *                       type: integer
 *                       description: ID of the request item to modify
 *                     qty_approved:
 *                       type: number
 *                       description: New approved quantity
 *                     material_id:
 *                       type: integer
 *                       description: Replace with different material
 *                     unit_id:
 *                       type: integer
 *                       description: Change unit of measurement
 *                     notes:
 *                       type: string
 *                       description: Updated notes for the item
 *               items_to_add:
 *                 type: array
 *                 description: Add new items to the request (optional)
 *                 items:
 *                   type: object
 *                   required:
 *                     - material_id
 *                     - unit_id
 *                     - qty_requested
 *                   properties:
 *                     material_id:
 *                       type: integer
 *                       description: Material ID to add
 *                     unit_id:
 *                       type: integer
 *                       description: Unit of measurement
 *                     qty_requested:
 *                       type: number
 *                       description: Quantity requested
 *                     qty_approved:
 *                       type: number
 *                       description: Approved quantity (defaults to qty_requested)
 *                     notes:
 *                       type: string
 *                       description: Notes for the new item
 *               items_to_remove:
 *                 type: array
 *                 description: Remove items from the request (optional)
 *                 items:
 *                   type: integer
 *                   description: Request item IDs to remove
 *               modification_reason:
 *                 type: string
 *                 description: Reason for item modifications (optional)
 *                 example: Updated quantities based on site requirements
 *     responses:
 *       200:
 *         description: Request approved successfully
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
 *                   example: Request approved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       $ref: '#/components/schemas/Request'
 *       400:
 *         description: Bad request - Request not in correct status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized
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
router.post('/:id/approve', authenticate, authorize('ADMIN', 'DIOCESAN_SITE_ENGINEER', 'PADIRI'), requestController.approveRequest);

router.post('/:id/close',authenticate,authorize('SITE_ENGINEER'),requestController.closeRequisition);


/**
 * @swagger
 * /api/requests/{id}/approve-storekeeper:
 *   post:
 *     summary: Approve request for storekeeper (PADIRI only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *                 description: Final approval comments
 *                 example: Approved for storekeeper processing
 *     responses:
 *       200:
 *         description: Request approved for storekeeper
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
 *                   example: Request approved for storekeeper
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       $ref: '#/components/schemas/Request'
 *       400:
 *         description: Bad request - Request not in correct status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized
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
router.post('/:id/approve-storekeeper', authenticate, authorize('PADIRI'), requestController.approveForStorekeeper);

/**
 * @swagger
 * /api/requests/{id}/reject:
 *   post:
 *     summary: Reject request (DIOCESAN_SITE_ENGINEER or PADIRI)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Rejection reason
 *                 example: Insufficient budget allocation
 *               comments:
 *                 type: string
 *                 description: Additional comments
 *                 example: Please revise quantities and resubmit
 *     responses:
 *       200:
 *         description: Request rejected successfully
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
 *                   example: Request rejected
 *                 data:
 *                   type: object
 *                   properties:
 *                     request:
 *                       $ref: '#/components/schemas/Request'
 *       400:
 *         description: Bad request - Missing rejection reason
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized
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
router.post('/:id/reject', authenticate, authorize('ADMIN','DIOCESAN_SITE_ENGINEER', 'PADIRI'), requestController.rejectRequest);

/**
 * @swagger
 * /api/requests/{id}/comments:
 *   get:
 *     summary: Get request comments
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
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
 *                     properties:
 *                       id:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       user_id:
 *                         type: integer
 *                       user:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Add comment to request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 description: Comment text
 *                 example: Please provide more details about the project timeline
 *     responses:
 *       201:
 *         description: Comment added successfully
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
 *                   example: Comment added successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     comment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         comment:
 *                           type: string
 *                         user_id:
 *                           type: integer
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - Missing comment
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
router.get('/:id/comments', authenticate, requestController.getRequestComments);
router.post('/:id/comments', authenticate, requestController.addComment);

/**
 * @swagger
 * /api/requests/{id}/attachments:
 *   get:
 *     summary: Get request attachments
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Attachments retrieved successfully
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
 *                     properties:
 *                       id:
 *                         type: integer
 *                       filename:
 *                         type: string
 *                       original_name:
 *                         type: string
 *                       file_path:
 *                         type: string
 *                       file_size:
 *                         type: integer
 *                       mime_type:
 *                         type: string
 *                       user_id:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Upload attachment to request
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               description:
 *                 type: string
 *                 description: File description
 *                 example: Project blueprint document
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
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
 *                   example: Attachment uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     attachment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         filename:
 *                           type: string
 *                         original_name:
 *                           type: string
 *                         file_size:
 *                           type: integer
 *                         mime_type:
 *                           type: string
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Bad request - No file provided
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
router.get('/:id/attachments', authenticate, requestController.getRequestAttachments);
router.post('/:id/attachments', authenticate, requestController.uploadAttachment);

/**
 * @swagger
 * /api/requests/{id}/receive:
 *   post:
 *     summary: Receive materials (Site Engineer)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - request_item_id
 *                     - qty_received
 *                   properties:
 *                     request_item_id:
 *                       type: integer
 *                       description: Request item ID
 *                     qty_received:
 *                       type: number
 *                       description: Quantity received
 *     responses:
 *       200:
 *         description: Materials received successfully
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
 *                   example: Materials received successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     request_id:
 *                       type: integer
 *                     received_items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           request_item_id:
 *                             type: integer
 *                           material_name:
 *                             type: string
 *                           qty_received:
 *                             type: number
 *                           total_received:
 *                             type: number
 *                     request_status:
 *                       type: string
 *                       enum: [RECEIVED, PARTIALLY_RECEIVED]
 *                     all_items_received:
 *                       type: boolean
 *       400:
 *         description: Bad request - Invalid data or request not in correct status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Not authorized
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
router.post('/:id/receive', authenticate, authorize('SITE_ENGINEER'), requestController.receiveMaterials);

module.exports = router;
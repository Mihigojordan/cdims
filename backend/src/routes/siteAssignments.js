const express = require('express');
const router = express.Router();
const siteAssignmentController = require('../controllers/siteAssignmentController');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Site Assignments
 *   description: Site assignment management for users
 */

/**
 * @swagger
 * /api/site-assignments:
 *   get:
 *     summary: Get all site assignments
 *     tags: [Site Assignments]
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
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user
 *       - in: query
 *         name: site_id
 *         schema:
 *           type: integer
 *         description: Filter by site
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Site assignments retrieved successfully
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
 *                     assignments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           site_id:
 *                             type: integer
 *                           user_id:
 *                             type: integer
 *                           assigned_by:
 *                             type: integer
 *                           assigned_at:
 *                             type: string
 *                             format: date-time
 *                           status:
 *                             type: string
 *                             enum: [ACTIVE, INACTIVE]
 *                           site:
 *                             $ref: '#/components/schemas/Site'
 *                           user:
 *                             $ref: '#/components/schemas/User'
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
router.get('/', authenticate, authorize('ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'), siteAssignmentController.getAllSiteAssignments);

/**
 * @swagger
 * /api/site-assignments/my-sites:
 *   get:
 *     summary: Get my assigned sites (SITE_ENGINEER only)
 *     tags: [Site Assignments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Assigned sites retrieved successfully
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
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my-sites', authenticate, authorize('SITE_ENGINEER'), siteAssignmentController.getUserAssignedSites);

/**
 * @swagger
 * /api/site-assignments:
 *   post:
 *     summary: Assign site to user
 *     tags: [Site Assignments]
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
 *               - user_id
 *             properties:
 *               site_id:
 *                 type: integer
 *                 example: 1
 *               user_id:
 *                 type: integer
 *                 example: 2
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 default: ACTIVE
 *                 example: ACTIVE
 *     responses:
 *       201:
 *         description: Site assigned successfully
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
 *                   example: Site assigned successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         site_id:
 *                           type: integer
 *                         user_id:
 *                           type: integer
 *                         assigned_by:
 *                           type: integer
 *                         assigned_at:
 *                           type: string
 *                           format: date-time
 *                         status:
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
router.post('/', authenticate, authorize('ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'), siteAssignmentController.assignSiteToUser);

/**
 * @swagger
 * /api/site-assignments/{id}:
 *   put:
 *     summary: Update site assignment
 *     tags: [Site Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 example: INACTIVE
 *     responses:
 *       200:
 *         description: Site assignment updated successfully
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
 *                   example: Site assignment updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         site_id:
 *                           type: integer
 *                         user_id:
 *                           type: integer
 *                         assigned_by:
 *                           type: integer
 *                         assigned_at:
 *                           type: string
 *                           format: date-time
 *                         status:
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
 *       404:
 *         description: Assignment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticate, authorize('ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'), siteAssignmentController.updateSiteAssignment);

/**
 * @swagger
 * /api/site-assignments/{id}:
 *   delete:
 *     summary: Remove site assignment
 *     tags: [Site Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Site assignment removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Assignment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, authorize('ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'), siteAssignmentController.removeSiteAssignment);

module.exports = router;

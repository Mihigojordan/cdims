const { Request, RequestItem, Material, Unit, Site, User, Role, SiteAssignment, Approval, StockHistory, StockMovement, Stock } = require('../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../src/config/database');

const getAllRequests = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      site_id, 
      requested_by,
      date_from,
      date_to,
      material_id,
      store_id,
      ref_no,
      search
    } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (site_id) whereClause.site_id = site_id;
    if (requested_by) whereClause.requested_by = requested_by;
    if (ref_no) whereClause.ref_no = { [Op.like]: `%${ref_no}%` };
    
    // Date range filtering
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) {
        whereClause.created_at[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        whereClause.created_at[Op.lte] = new Date(date_to);
      }
    }

    const { count, rows: requests } = await Request.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Site,
          as: 'site'
        },
        {
          model: User,
          as: 'requestedBy',
          include: [{
            model: Role,
            as: 'role'
          }]
        },
         {
model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'reviewer',
              include: [{
                model: Role,
                as: 'role'
              }]
            }
          ]
        },
        {
          model: RequestItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              include: [
                {
                  model: Unit,
                  as: 'unit'
                }
              ]
            },
            {
              model: Unit,
              as: 'unit'
            }
          ],
          // Filter by material if specified
          ...(material_id && {
            where: { material_id: material_id }
          })
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      site_id,
      date_from,
      date_to,
      material_id,
      ref_no
    } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const whereClause = { requested_by: userId };
    if (status) whereClause.status = status;
    if (site_id) whereClause.site_id = site_id;
    if (ref_no) whereClause.ref_no = { [Op.like]: `%${ref_no}%` };
    
    // Date range filtering
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) {
        whereClause.created_at[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        whereClause.created_at[Op.lte] = new Date(date_to);
      }
    }

    const { count, rows: requests } = await Request.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Site,
          as: 'site'
        },
        {
          model: User,
          as: 'requestedBy',
          include: [{
            model: Role,
            as: 'role'
          }]
        },
        {
          model: RequestItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material'
            },
            {
              model: Unit,
              as: 'unit'
            }
          ]
        },
        {
          model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'reviewer',
              include: [{
                model: Role,
                as: 'role'
              }]
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Enhanced function for Site Engineers with comprehensive filtering
const getSiteEngineerRequests = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      site_id, 
      date_from,
      date_to,
      material_id,
      ref_no,
      search
    } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;
    const userRole = req.user.role.name;

    // Build where clause based on user role
    let whereClause = {};
    
    if (userRole === 'SITE_ENGINEER') {
      // Site Engineers can only see their assigned sites
      const assignments = await SiteAssignment.findAll({
        where: { user_id: userId, status: 'ACTIVE' },
        attributes: ['site_id']
      });
      const assignedSiteIds = assignments.map(a => a.site_id);
      
      if (assignedSiteIds.length === 0) {
        return res.json({
          success: true,
          data: {
            requests: [],
            pagination: {
              current_page: parseInt(page),
              total_pages: 0,
              total_items: 0,
              items_per_page: parseInt(limit)
            }
          }
        });
      }
      
      whereClause.site_id = { [Op.in]: assignedSiteIds };
    } else {
      // Admin, Padiri, DSE can see all requests
      if (site_id) whereClause.site_id = site_id;
    }

    // Apply additional filters
    if (status) whereClause.status = status;
    if (ref_no) whereClause.ref_no = { [Op.like]: `%${ref_no}%` };
    
    // Date range filtering
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) {
        whereClause.created_at[Op.gte] = new Date(date_from);
      }
      if (date_to) {
        whereClause.created_at[Op.lte] = new Date(date_to);
      }
    }

    const { count, rows: requests } = await Request.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Site,
          as: 'site'
        },
        {
          model: User,
          as: 'requestedBy',
          include: [{
            model: Role,
            as: 'role'
          }]
        },
        {
          model: RequestItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material',
              include: [
                {
                  model: Unit,
                  as: 'unit'
                }
              ]
            },
            {
              model: Unit,
              as: 'unit'
            }
          ],
          // Filter by material if specified
          ...(material_id && {
            where: { material_id: material_id }
          })
        },
        {
          model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'reviewer',
              include: [{
                model: Role,
                as: 'role'
              }]
            }
          ],
          order: [['created_at', 'DESC']]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // Enhanced response with detailed item information
    const enhancedRequests = requests.map(request => {
      const enhancedItems = request.items.map(item => ({
        id: item.id,
        material: {
          id: item.material.id,
          name: item.material.name,
          code: item.material.code,
          specification: item.material.specification,
          unit: item.material.unit
        },
        unit: item.unit,
        qty_requested: parseFloat(item.qty_requested),
        qty_approved: parseFloat(item.qty_approved || 0),
        qty_issued: parseFloat(item.qty_issued || 0),
        qty_received: parseFloat(item.qty_received || 0),
        // Calculate remaining quantities
        qty_remaining_to_issue: Math.max(0, parseFloat(item.qty_approved || 0) - parseFloat(item.qty_issued || 0)),
        qty_remaining_to_receive: Math.max(0, parseFloat(item.qty_issued || 0) - parseFloat(item.qty_received || 0)),
        // Status indicators
        is_fully_issued: parseFloat(item.qty_issued || 0) >= parseFloat(item.qty_approved || 0),
        is_fully_received: parseFloat(item.qty_received || 0) >= parseFloat(item.qty_issued || 0),
        // Timestamps
        issued_at: item.issued_at,
        issued_by: item.issued_by,
        received_at: item.received_at,
        received_by: item.received_by
      }));

      return {
        ...request.toJSON(),
        items: enhancedItems,
        // Summary statistics
        summary: {
          total_items: enhancedItems.length,
          total_qty_requested: enhancedItems.reduce((sum, item) => sum + item.qty_requested, 0),
          total_qty_approved: enhancedItems.reduce((sum, item) => sum + item.qty_approved, 0),
          total_qty_issued: enhancedItems.reduce((sum, item) => sum + item.qty_issued, 0),
          total_qty_received: enhancedItems.reduce((sum, item) => sum + item.qty_received, 0),
          fully_issued_items: enhancedItems.filter(item => item.is_fully_issued).length,
          fully_received_items: enhancedItems.filter(item => item.is_fully_received).length,
          completion_percentage: enhancedItems.length > 0 ? 
            Math.round((enhancedItems.filter(item => item.is_fully_received).length / enhancedItems.length) * 100) : 0
        }
      };
    });

    res.json({
      success: true,
      data: {
        requests: enhancedRequests,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        },
        filters_applied: {
          status,
          site_id,
          date_from,
          date_to,
          material_id,
          ref_no
        }
      }
    });
  } catch (error) {
    console.error('Get site engineer requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findByPk(id, {
      include: [
        {
          model: Site,
          as: 'site'
        },
        {
          model: User,
          as: 'requestedBy',
          include: [{
            model: Role,
            as: 'role'
          }]
        },
        {
model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'reviewer',
              include: [{
                model: Role,
                as: 'role'
              }]
            }
          ]
        },
        {
          model: RequestItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material'
            },
            {
              model: Unit,
              as: 'unit'
            }
          ]
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: { request }
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createRequest = async (req, res) => {
  try {
    const { site_id, notes, items } = req.body;
    const requested_by = req.user.id;
    const userRole = req.user.role.name;

    if (!site_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Site ID and items are required'
      });
    }

    // Validate site access for SITE_ENGINEER
    if (userRole === 'SITE_ENGINEER') {
      const siteAssignment = await SiteAssignment.findOne({
        where: { 
          user_id: requested_by, 
          site_id: site_id, 
          status: 'ACTIVE' 
        }
      });

      if (!siteAssignment) {
        return res.status(403).json({
          success: false,
          message: 'You are not assigned to this site. Please select a site you are assigned to.'
        });
      }
    }

    // Verify site exists
    const site = await Site.findByPk(site_id);
    if (!site) {
      return res.status(400).json({
        success: false,
        message: 'Invalid site ID'
      });
    }

    const request = await Request.create({
      site_id,
      requested_by,
      notes,
      status: 'PENDING'
    });

    // Create request items
    const requestItems = await Promise.all(
      items.map(async item => {
        // Get material to get default unit_id if not provided
        const material = await Material.findByPk(item.material_id);
        if (!material) {
          throw new Error(`Material with ID ${item.material_id} not found`);
        }
        
        return RequestItem.create({
          request_id: request.id,
          material_id: item.material_id,
          unit_id: item.unit_id || material.unit_id,
          qty_requested: item.qty_requested,
          notes: item.notes || null
        });
      })
    );

    // Fetch complete request with items
    const completeRequest = await Request.findByPk(request.id, {
      include: [
        {
          model: Site,
          as: 'site'
        },
        {
          model: User,
          as: 'requestedBy',
          include: [{
            model: Role,
            as: 'role'
          }]
        },
        {
          model: RequestItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material'
            },
            {
              model: Unit,
              as: 'unit'
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: { request: completeRequest },
      message: 'Request created successfully'
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { site_id, notes, items } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role.name;

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user can modify this request
    if (userRole === 'SITE_ENGINEER' && request.requested_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only modify your own requests'
      });
    }

    // Validate site access if site_id is being updated
    if (site_id && site_id !== request.site_id) {
      if (userRole === 'SITE_ENGINEER') {
        const siteAssignment = await SiteAssignment.findOne({
          where: { 
            user_id: userId, 
            site_id: site_id, 
            status: 'ACTIVE' 
          }
        });

        if (!siteAssignment) {
          return res.status(403).json({
            success: false,
            message: 'You are not assigned to this site. Please select a site you are assigned to.'
          });
        }
      }

      // Verify site exists
      const site = await Site.findByPk(site_id);
      if (!site) {
        return res.status(400).json({
          success: false,
          message: 'Invalid site ID'
        });
      }

      request.site_id = site_id;
    }

    // Update request fields
    if (notes !== undefined) request.notes = notes;
    await request.save();

    // Update items if provided
    if (items) {
      // Delete existing items
      await RequestItem.destroy({ where: { request_id: id } });
      
      // Create new items
      await Promise.all(
        items.map(item => 
          RequestItem.create({
            request_id: id,
            material_id: item.material_id,
            unit_id: item.unit_id,
            qty_requested: item.qty_requested
          })
        )
      );
    }

    // Fetch updated request
    const updatedRequest = await Request.findByPk(id, {
      include: [
        {
          model: Site,
          as: 'site'
        },
        {
          model: User,
          as: 'requestedBy',
          include: [{
            model: Role,
            as: 'role'
          }]
        },
                        {
model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'reviewer',
              include: [{
                model: Role,
                as: 'role'
              }]
            }
          ]
        },
        {
          model: RequestItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material'
            },
            {
              model: Unit,
              as: 'unit'
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: { request: updatedRequest },
      message: 'Request updated successfully'
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const submitRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Only PENDING requests can be submitted'
      });
    }

    request.status = 'DSE_REVIEW';
    await request.save();

    res.json({
      success: true,
      message: 'Request submitted successfully'
    });
  } catch (error) {
    console.error('Submit request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      level, 
      comment, 
      item_modifications, 
      items_to_add, 
      items_to_remove, 
      modification_reason 
    } = req.body;
    const reviewer_id = req.user.id;

    const request = await Request.findByPk(id, {
      include: [
        {
          model: RequestItem,
          as: 'items',
          include: [
            { model: Material, as: 'material' },
            { model: Unit, as: 'unit' }
          ]
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

  
    
    // Check if user has permission to modify items
    const canModifyItems = ['ADMIN', 'PADIRI', 'DIOCESAN_SITE_ENGINEER'].includes(req.user.role.name);
    
    if (canModifyItems && (item_modifications || items_to_add || items_to_remove)) {
      // Start transaction for item modifications
      const transaction = await sequelize.transaction();

   
      
      try {
        // Remove items if specified
        if (items_to_remove && items_to_remove.length > 0) {
          await RequestItem.destroy({
            where: { id: items_to_remove },
            transaction
          });
        }

        // Add new items if specified
        if (items_to_add && items_to_add.length > 0) {
          for (const item of items_to_add) {
            await RequestItem.create({
              request_id: id,
              material_id: item.material_id,
              qty_requested: item.qty_requested,
              qty_approved: item.qty_approved || item.qty_requested,
              notes: item.notes,
              unit_id: item.unit_id
            }, { transaction });
          }
        }

        // Modify existing items if specified
        if (item_modifications && item_modifications.length > 0) {
        for (const modification of item_modifications) {
  const updateData = {};

  if (modification.qty_approved != null) updateData.qty_approved = modification.qty_approved;
  if (modification.material_id != null) updateData.material_id = modification.material_id;
  if (modification.notes != null) updateData.notes = modification.notes;
  if (modification.unit_id != null) updateData.unit_id = modification.unit_id;

 

  if (Object.keys(updateData).length === 0) continue; // skip empty

  const [updatedRows] = await RequestItem.update(updateData, {
    where: { id: modification.request_item_id },
    transaction
  });


}

        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } else if (level === 'PADIRI' && request.items) {
      // Default behavior: set qty_approved to qty_requested if not already set
      for (const item of request.items) {
        if (item.qty_approved === null || item.qty_approved === undefined) {
          await RequestItem.update(
            { qty_approved: item.qty_requested },
            { where: { id: item.id } }
          );
        }
      }
    }

    // Prevent duplicate approvals by same user & level
    const existingApproval = await Approval.findOne({
      where: { request_id: id, level, reviewer_id }
    });

    if (!existingApproval) {
      await Approval.create({
        request_id: id,
        level,
        reviewer_id,
        action: 'APPROVED',
        comment
      });
    }

    // Update request status
    if (req.user.role.name === 'DIOCESAN_SITE_ENGINEER') {
      request.status = 'VERIFIED'; // DSE changes APPROVED → VERIFIED
    } else if (req.user.role.name === 'PADIRI' || req.user.role.name === 'ADMIN') {
      request.status = 'APPROVED'; // PADIRI approves VERIFIED → APPROVED
    }

    await request.save();

    const updatedRequest = await Request.findByPk(request.id, {
      include: [
        { model: Site, as: 'site' },
        {
          model: User,
          as: 'requestedBy',
          include: [{ model: Role, as: 'role' }]
        },
                {
model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'reviewer',
              include: [{
                model: Role,
                as: 'role'
              }]
            }
          ]
        },
        {
          model: RequestItem,
          as: 'items',
          include: [
            { model: Material, as: 'material' },
            { model: Unit, as: 'unit' }
          ]
        }
      ]
    });

    res.json({
      success: true,
      data: { request: updatedRequest },
      message: `Request approved by ${level} and forwarded to next level`
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { level, comment } = req.body;
    const reviewer_id = req.user.id;

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Create rejection record
    await Approval.create({
      request_id: id,
      level: level,
      reviewer_id: reviewer_id,
      action: 'REJECTED',
      comment: comment
    });

    // Update request status to rejected
    request.status = 'REJECTED';
    await request.save();

    const updatedRequest = await Request.findByPk(request.id, {
      include: [
        { model: Site, as: 'site' },
        {
          model: User,
          as: 'requestedBy',
          include: [{ model: Role, as: 'role' }]
        },
                {
model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'reviewer',
              include: [{
                model: Role,
                as: 'role'
              }]
            }
          ]
        },
        {
          model: RequestItem,
          as: 'items',
          include: [
            { model: Material, as: 'material' },
            { model: Unit, as: 'unit' }
          ]
        }
      ]
    });


    res.json({
      success: true,
     
      data: { request: updatedRequest },
      message: `Request rejected by ${level}. Site Engineer and Diocesan Site Engineer will be notified.`
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Placeholder methods for comments and attachments
const getRequestComments = async (req, res) => {
  res.json({
    success: true,
    data: { comments: [] },
    message: 'Comments feature coming soon'
  });
};

const addComment = async (req, res) => {
  res.json({
    success: true,
    message: 'Comments feature coming soon'
  });
};

const getRequestAttachments = async (req, res) => {
  res.json({
    success: true,
    data: { attachments: [] },
    message: 'Attachments feature coming soon'
  });
};

const uploadAttachment = async (req, res) => {
  res.json({
    success: true,
    message: 'File upload feature coming soon'
  });
};

const modifyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      notes, 
      item_modifications, 
      items_to_add, 
      items_to_remove,
      modification_reason 
    } = req.body;
    const modifier_id = req.user.id;
    const userRole = req.user.role.name;

    const request = await Request.findByPk(id, {
      include: [
        {
          model: RequestItem,
          as: 'items',
          include: [
            { model: Material, as: 'material' },
            { model: Unit, as: 'unit' }
          ]
        }
      ]
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user can modify this request based on status and role
    const canModify = checkModificationPermissions(request.status, userRole);
    if (!canModify.allowed) {
      return res.status(403).json({
        success: false,
        message: canModify.reason
      });
    }

    // Start transaction for data consistency
    const transaction = await sequelize.transaction();

    try {
      // Update request notes if provided
      if (notes !== undefined) {
        request.notes = notes;
      }

      // 1. Modify existing items (quantities, materials)
      if (item_modifications && item_modifications.length > 0) {
        for (const modification of item_modifications) {
          const updateData = {};
          
          if (modification.qty_requested !== undefined) {
            updateData.qty_requested = modification.qty_requested;
          }
          
          if (modification.qty_approved !== undefined) {
            updateData.qty_approved = modification.qty_approved;
          }
          
          if (modification.material_id !== undefined) {
            updateData.material_id = modification.material_id;
          }
          
          if (modification.unit_id !== undefined) {
            updateData.unit_id = modification.unit_id;
          }

          await RequestItem.update(updateData, {
            where: { id: modification.request_item_id },
            transaction
          });
        }
      }

      // 2. Add new items
      if (items_to_add && items_to_add.length > 0) {
        for (const newItem of items_to_add) {
          await RequestItem.create({
            request_id: id,
            material_id: newItem.material_id,
            unit_id: newItem.unit_id,
            qty_requested: newItem.qty_requested,
            qty_approved: newItem.qty_approved || newItem.qty_requested,
            qty_issued: 0,
            qty_received: 0
          }, { transaction });
        }
      }

      // 3. Remove items
      if (items_to_remove && items_to_remove.length > 0) {
        await RequestItem.destroy({
          where: {
            id: { [Op.in]: items_to_remove },
            request_id: id
          },
          transaction
        });
      }

      // 4. Update request status based on who modified it
      let newStatus = request.status;
      let level = 'DSE';
      
      if (userRole === 'ADMIN' || userRole === 'PADIRI') {
        // Admin/Padiri can modify at any stage and reset to appropriate status
        if (request.status === 'VERIFIED' || request.status === 'APPROVED') {
          newStatus = 'VERIFIED'; // Reset to DSE review
        }
        level = userRole;
      } else if (userRole === 'DIOCESAN_SITE_ENGINEER') {
        // DSE can modify during review
        newStatus = 'DSE_REVIEW';
        level = 'DSE';
      }

      request.status = newStatus;
      await request.save({ transaction });

      // 5. Create modification record
      await Approval.create({
        request_id: id,
        level: level,
        reviewer_id: modifier_id,
        action: 'MODIFIED',
        comment: modification_reason || `Request modified by ${userRole}`
      }, { transaction });

      await transaction.commit();

      // Fetch updated request with all details
      const updatedRequest = await Request.findByPk(id, {
        include: [
          { model: Site, as: 'site' },
          {
            model: User,
            as: 'requestedBy',
            include: [{ model: Role, as: 'role' }]
          },
          {
            model: RequestItem,
            as: 'items',
            include: [
              { model: Material, as: 'material' },
              { model: Unit, as: 'unit' }
            ]
          },
          {
            model: Approval,
            as: 'approvals',
            include: [
              {
                model: User,
                as: 'reviewer',
                include: [{ model: Role, as: 'role' }]
              }
            ],
            order: [['created_at', 'DESC']]
          }
        ]
      });

      res.json({
        success: true,
        message: 'Request modified successfully',
        data: {
          request: updatedRequest,
          modifications: {
            items_modified: item_modifications?.length || 0,
            items_added: items_to_add?.length || 0,
            items_removed: items_to_remove?.length || 0,
            new_status: newStatus
          }
        }
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Modify request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Helper function to check modification permissions
const checkModificationPermissions = (requestStatus, userRole) => {
  // Admin and Padiri can modify at any stage
  if (userRole === 'ADMIN' || userRole === 'PADIRI') {
    return { allowed: true };
  }
  
  // DSE can modify during review stages
  if (userRole === 'DIOCESAN_SITE_ENGINEER') {
    const allowedStatuses = ['DSE_REVIEW', 'VERIFIED', 'WAITING_PADIRI_REVIEW','PENDING'];
    if (allowedStatuses.includes(requestStatus)) {
      return { allowed: true };
    }
    return { 
      allowed: false, 
      reason: 'DSE can only modify requests during review stages' 
    };
  }
  
  return { 
    allowed: false, 
    reason: 'Insufficient permissions to modify this request' 
  };
};

const approveForStorekeeper = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const approver_id = req.user.id;

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'WAITING_PADIRI_REVIEW') {
      return res.status(400).json({
        success: false,
        message: 'Only requests in WAITING_PADIRI_REVIEW status can be approved for storekeeper'
      });
    }

    // Create approval record
    await Approval.create({
      request_id: id,
      level: 'PADIRI',
      reviewer_id: approver_id,
      action: 'APPROVED',
      comment: comment
    });

    // Update request status to approved (ready for storekeeper)
    request.status = 'APPROVED';
    await request.save();

    res.json({
      success: true,
      message: 'Request approved and sent to storekeeper for material issuance'
    });
  } catch (error) {
    console.error('Approve for storekeeper error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getRequestsBySite = async (req, res) => {
  try {
    const { site_id } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { site_id };
    if (status) whereClause.status = status;

    const { count, rows: requests } = await Request.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Site,
          as: 'site'
        },
        {
          model: User,
          as: 'requestedBy',
          include: [{
            model: Role,
            as: 'role'
          }]
        },
        {
          model: RequestItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material'
            },
            {
              model: Unit,
              as: 'unit'
            }
          ]
        },
        {
          model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'reviewer',
              include: [{
                model: Role,
                as: 'role'
              }]
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get requests by site error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getAvailableSites = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role.name;

    let sites;

    if (userRole === 'SITE_ENGINEER') {
      // Get only assigned sites for SITE_ENGINEER
      const assignments = await SiteAssignment.findAll({
        where: { user_id: userId, status: 'ACTIVE' },
        include: [
          {
            model: Site,
            as: 'site'
          }
        ]
      });
      sites = assignments.map(assignment => assignment.site);
    } else {
      // Get all sites for other roles
      sites = await Site.findAll({
        order: [['name', 'ASC']]
      });
    }

    res.json({
      success: true,
      data: sites
    });
  } catch (error) {
    console.error('Get available sites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const closeRequisition = async (req, res) => {
  try {
    const { id:request_id } = req.params;

    if (!request_id) {
      return res.status(400).json({ success: false, message: 'Request ID is required' });
    }

    // Load request
    const request = await Request.findByPk(request_id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

   
    

    // Only allow closing if status is ISSUED
    if (request.status !== 'ISSUED') {
      return res.status(400).json({
        success: false,
        message: 'Requisition must be in ISSUED status to be closed'
      });
    }

    // Update status to CLOSED
    await request.update({
      status: 'CLOSED',
      closed_by: req.user.id,
      closed_at: new Date()
    });

    return res.json({
      success: true,
      message: 'Requisition has been closed successfully',
      data: {
        request_id: request.id,
        status: request.status
      }
    });
  } catch (err) {
    console.error('Close requisition error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  }
};

// Site Engineer receive materials endpoint
// Site Engineer receive materials endpoint
const receiveMaterials = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;
    const received_by = req.user.id;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    // Load request with details
    const request = await Request.findByPk(id, {
      include: [
        {
          model: RequestItem,
          as: 'items',
          include: [
            { model: Material, as: 'material' },
            { model: Unit, as: 'unit' }
          ]
        },
        { model: User, as: 'requestedBy' },
        { model: Site, as: 'site' }
      ]
    });

    const stockMovement = await StockMovement.findAll({
  where: { source_id: id },
  include: [
    {
      model: Request,
      as: 'source', // make sure the alias matches your association
      
    }
  ]
});



    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }
    if (!stockMovement) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if request is in ISSUED status
    if (request.status !== 'ISSUED' && request.status !== 'PARTIALLY_ISSUED') {
      return res.status(400).json({
        success: false,
        message: 'Request must be issued before materials can be received'
      });
    }

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      const receivedItems = [];
      const stockHistoryRecords = [];

      for (const item of items) {
        const { request_item_id, qty_received } = item;

        
        // Find matching request item
        const requestItem = request.items.find(ri => ri.id === request_item_id);
        if (!requestItem) {
          throw new Error(`Request item ${request_item_id} not found`);
        }
        
        // Validate quantity
        if (qty_received > requestItem.qty_issued) {
          throw new Error(`Cannot receive more than issued for ${requestItem.material.name}. Issued: ${requestItem.qty_issued}, Received: ${qty_received}`);
        }
        
        if (qty_received <= 0) {
          throw new Error(`Received quantity must be greater than 0 for ${requestItem.material.name}`);
        }

        const foundMaterial = stockMovement.find(s=> s.material_id == requestItem.material_id);

        if(!foundMaterial){
            throw new Error(`Couldnt find the material for the stock`);
        }

          const stock = await Stock.findOne({
            where: { material_id: requestItem.material_id, store_id:foundMaterial.store_id },
            transaction,
            lock: transaction.LOCK.UPDATE
          });
 
          // Update request item with received quantity
        const newQtyReceived = (requestItem.qty_received || 0) + qty_received;
        await requestItem.update(
          {
            qty_received: newQtyReceived,
            received_at: new Date(),
            received_by: received_by
          },
          { transaction }
        );

        // 🔹 Log to StockHistory (no stock table update, just audit)
        const stockHistory = await StockHistory.create({
          stock_id: stock.id, // not tied to a store’s stock anymore
          material_id: requestItem.material_id,
          store_id: foundMaterial.store_id, // or keep the original store_id if you want traceability
          movement_type: 'IN', // "IN" at site (materials entering project site)
          source_type: 'RECEIVE',
          source_id: id, // request ID
          qty_before: 0, // site doesn’t track stock, so use 0
          qty_change: qty_received,
          qty_after: newQtyReceived, // cumulative received qty at request item level
          unit_price: null,
          notes: `Received by site engineer ${req.user.full_name} at ${request.site.name}`,
          created_by: received_by
        }, { transaction });

        receivedItems.push({
          request_item_id,
          material_name: requestItem.material.name,
          qty_received,
          total_received: newQtyReceived
        });

        stockHistoryRecords.push(stockHistory);
      }

      // Check if all items are fully received
      const allItemsReceived = request.items.every(item =>
        (Number(item.qty_received) || 0) >= (Number(item.qty_issued) || 0)
      );

      // Update request status
      if (allItemsReceived) {
        await request.update(
          {
            status: 'CLOSED', // Auto-close when all items received
            received_at: new Date(),
            received_by: received_by,
            closed_at: new Date(),
            closed_by: received_by
          },
          { transaction }
        );
      } else {
        await request.update(
          {
            status: 'RECEIVED', // Partially received
            received_at: new Date(),
            received_by: received_by
          },
          { transaction }
        );
      }

      // Commit transaction
      await transaction.commit();

      return res.json({
        success: true,
        message: 'Materials received successfully',
        data: {
          request_id: id,
          received_items: receivedItems,
          stock_history: stockHistoryRecords,
          request_status: allItemsReceived ? 'CLOSED' : 'RECEIVED',
          all_items_received: allItemsReceived
        }
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Receive materials error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};


module.exports = {
  getAllRequests,
  getMyRequests,
  getSiteEngineerRequests,
  getRequestById,
  createRequest,
  updateRequest,
  submitRequest,
  approveRequest,
  rejectRequest,
  modifyRequest,
  approveForStorekeeper,
  getRequestsBySite,
  getRequestComments,
  addComment,
  getRequestAttachments,
  uploadAttachment,
  getAvailableSites,
  closeRequisition,
  receiveMaterials
};

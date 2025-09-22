const { Request, RequestItem, Material, Unit, Site, User, Role, SiteAssignment, Approval } = require('../../models');

const getAllRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, site_id, requested_by } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (site_id) whereClause.site_id = site_id;
    if (requested_by) whereClause.requested_by = requested_by;

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
              as: 'material'
            },
            {
              model: Unit,
              as: 'unit'
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
    console.error('Get all requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const whereClause = { requested_by: userId };
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
    console.error('Get my requests error:', error);
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
      items.map(item => 
        RequestItem.create({
          request_id: request.id,
          material_id: item.material_id,
          unit_id: item.unit_id,
          qty_requested: item.qty_requested
        })
      )
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
    const { level, comment, item_modifications } = req.body;
    const reviewer_id = req.user.id;
    console.log(
    'items :', item_modifications
    );
    

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

    // Update item quantities
    if (level === 'DSE' && item_modifications) {
      for (const modification of item_modifications) {
        await RequestItem.update(
          { qty_approved: modification.qty_approved },
          { where: { id: modification.request_item_id } }
        );
      }
    } 

    else if(level === 'PADIRI' && request.items){
      for(const modification of request.items){
         await RequestItem.update(
          { qty_approved: modification.qty_approved ?? modification.qty_requested  },
          
          { where: { id: modification.id } }
        );
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
    if (level === 'DSE') {
      request.status = 'WAITING_PADIRI_REVIEW';
    } else if (level === 'PADIRI') {
      request.status = 'APPROVED';
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
    const { notes, item_modifications } = req.body;
    const modifier_id = req.user.id;

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'DSE_REVIEW') {
      return res.status(400).json({
        success: false,
        message: 'Only requests in DSE_REVIEW status can be modified'
      });
    }

    // Update request notes if provided
    if (notes !== undefined) {
      request.notes = notes;
    }

    // Update item quantities if modifications provided
    if (item_modifications) {
      for (const modification of item_modifications) {
        await RequestItem.update(
          { 
            qty_requested: modification.qty_requested,
            qty_approved: modification.qty_approved || modification.qty_requested
          },
          { where: { id: modification.request_item_id } }
        );
      }
    }

    await request.save();

    // Create modification record
    await Approval.create({
      request_id: id,
      level: 'DSE',
      reviewer_id: modifier_id,
      action: 'NEEDS_CHANGES',
      comment: 'Request modified by Diocesan Site Engineer'
    });

    res.json({
      success: true,
      message: 'Request modified successfully'
    });
  } catch (error) {
    console.error('Modify request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
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

    console.log(' **** ' + request.status);
    

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

module.exports = {
  getAllRequests,
  getMyRequests,
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
};

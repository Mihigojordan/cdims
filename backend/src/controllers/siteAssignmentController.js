const { SiteAssignment, Site, User, Role } = require('../../models');

const getAllSiteAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id, site_id, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (user_id) whereClause.user_id = user_id;
    if (site_id) whereClause.site_id = site_id;
    if (status) whereClause.status = status;

    const { count, rows: assignments } = await SiteAssignment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Site,
          as: 'site'
        },
        {
          model: User,
          as: 'user',
          include: [{
            model: Role,
            as: 'role'
          }]
        },
        {
          model: User,
          as: 'assignedBy',
          include: [{
            model: Role,
            as: 'role'
          }]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['assigned_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get site assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const assignSiteToUser = async (req, res) => {
  try {
    const { site_id, user_id } = req.body;
    const assigned_by = req.user.id;

    // Check if assignment already exists
    const existingAssignment = await SiteAssignment.findOne({
      where: { site_id, user_id, status: 'ACTIVE' }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'User is already assigned to this site'
      });
    }

    // Create new assignment
    const assignment = await SiteAssignment.create({
      site_id,
      user_id,
      assigned_by,
      status: 'ACTIVE'
    });

    // Fetch the assignment with related data
    const assignmentWithDetails = await SiteAssignment.findByPk(assignment.id, {
      include: [
        {
          model: Site,
          as: 'site'
        },
        {
          model: User,
          as: 'user',
          include: [{
            model: Role,
            as: 'role'
          }]
        },
        {
          model: User,
          as: 'assignedBy',
          include: [{
            model: Role,
            as: 'role'
          }]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Site assigned successfully',
      data: assignmentWithDetails
    });
  } catch (error) {
    console.error('Assign site error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateSiteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const assignment = await SiteAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Site assignment not found'
      });
    }

    await assignment.update({ status });

    res.json({
      success: true,
      message: 'Site assignment updated successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Update site assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const removeSiteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await SiteAssignment.findByPk(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Site assignment not found'
      });
    }

    await assignment.update({ status: 'INACTIVE' });

    res.json({
      success: true,
      message: 'Site assignment removed successfully'
    });
  } catch (error) {
    console.error('Remove site assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getUserAssignedSites = async (req, res) => {
  try {
    const userId = req.user.id;

    const assignments = await SiteAssignment.findAll({
      where: { user_id: userId, status: 'ACTIVE' },
      include: [
        {
          model: Site,
          as: 'site'
        }
      ],
      order: [['assigned_at', 'DESC']]
    });

    const sites = assignments.map(assignment => assignment.site);

    res.json({
      success: true,
      data: sites
    });
  } catch (error) {
    console.error('Get user assigned sites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllSiteAssignments,
  assignSiteToUser,
  updateSiteAssignment,
  removeSiteAssignment,
  getUserAssignedSites
};

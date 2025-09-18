const { Site } = require('../../models');
const { Op } = require('sequelize');

const getAllSites = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { code: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: sites } = await Site.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        sites,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all sites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getSiteById = async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.findByPk(id);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    res.json({
      success: true,
      data: { site }
    });
  } catch (error) {
    console.error('Get site by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createSite = async (req, res) => {
  try {
    const { code, name, location } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Site name is required'
      });
    }

    const site = await Site.create({
      code,
      name,
      location
    });

    res.status(201).json({
      success: true,
      data: { site },
      message: 'Site created successfully'
    });
  } catch (error) {
    console.error('Create site error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Site code must be unique'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, location } = req.body;

    const site = await Site.findByPk(id);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    // Update site fields
    if (code !== undefined) site.code = code;
    if (name !== undefined) site.name = name;
    if (location !== undefined) site.location = location;

    await site.save();

    res.json({
      success: true,
      message: 'Site updated successfully',
      data: { site }
    });
  } catch (error) {
    console.error('Update site error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Site code must be unique'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteSite = async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.findByPk(id);

    if (!site) {
      return res.status(404).json({
        success: false,
        message: 'Site not found'
      });
    }

    await site.destroy();

    res.json({
      success: true,
      message: 'Site deleted successfully'
    });
  } catch (error) {
    console.error('Delete site error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllSites,
  getSiteById,
  createSite,
  updateSite,
  deleteSite
};

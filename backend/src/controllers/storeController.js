const { Store } = require('../../models');
const { Op } = require('sequelize');

const getAllStores = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: stores } = await Store.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        stores,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error('Get store by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createStore = async (req, res) => {
  try {
    const { code, name, location, description, manager_name, contact_phone, contact_email } = req.body;

    // Generate code if not provided
    let storeCode = code;
    if (!storeCode) {
      // Get the last store to generate next code
      const lastStore = await Store.findOne({
        order: [['id', 'DESC']]
      });
      
      if (lastStore && lastStore.code) {
        // Extract number from last code and increment
        const lastNumber = parseInt(lastStore.code.split('-')[1]) || 0;
        storeCode = `STORE-${String(lastNumber + 1).padStart(3, '0')}`;
      } else {
        storeCode = 'STORE-001';
      }
    }

    // Check if code already exists
    const existingStore = await Store.findOne({
      where: { code: storeCode }
    });

    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: 'Store code already exists'
      });
    }

    const store = await Store.create({
      code: storeCode,
      name,
      location,
      description,
      manager_name,
      contact_phone,
      contact_email
    });

    res.status(201).json({
      success: true,
      message: 'Store created successfully',
      data: store
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, location, description, manager_name, contact_phone, contact_email } = req.body;

    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Check if code is being updated and if it already exists
    if (code && code !== store.code) {
      const existingStore = await Store.findOne({
        where: { code: code }
      });

      if (existingStore) {
        return res.status(400).json({
          success: false,
          message: 'Store code already exists'
        });
      }
    }

    await store.update({
      code: code || store.code,
      name,
      location,
      description,
      manager_name,
      contact_phone,
      contact_email
    });

    res.json({
      success: true,
      message: 'Store updated successfully',
      data: store
    });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    const store = await Store.findByPk(id);
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    await store.destroy();

    res.json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
};

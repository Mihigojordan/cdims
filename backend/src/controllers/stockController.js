const { Stock, Store, Material, Unit, Category, StockMovement, Request, RequestItem, User, Site, Role } = require('../../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../src/config/database');
const { asyncHandler, NotFoundError, ValidationError } = require('../middleware/errorHandler');

const getAllStock = async (req, res) => {
  try {
    const { page = 1, limit = 10, store_id, material_id, low_stock } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (store_id) whereClause.store_id = store_id;
    if (material_id) whereClause.material_id = material_id;
    if (low_stock === 'true') {
      whereClause.low_stock_alert = true;
    }

    const { count, rows: stock } = await Stock.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Store,
          as: 'store'
        },
        {
          model: Material,
          as: 'material',
          include: [
            {
              model: Category,
              as: 'category'
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
      order: [['updated_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        stock,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createStock = async (req, res) => {
  try {
    const { material_id, store_id, qty_on_hand, reorder_level, low_stock_threshold } = req.body;

    // Check if stock record already exists for this material and store
    const existingStock = await Stock.findOne({
      where: { material_id, store_id }
    });

    if (existingStock) {
      return res.status(400).json({
        success: false,
        message: 'Stock record already exists for this material in this store'
      });
    }

    // Check if stock is going low
    let shouldAlert = false;
    if (low_stock_threshold && qty_on_hand <= low_stock_threshold) {
      shouldAlert = true;
    }

    const stock = await Stock.create({
      material_id,
      store_id,
      qty_on_hand,
      reorder_level: reorder_level || 0,
      low_stock_threshold: low_stock_threshold || 0,
      low_stock_alert: shouldAlert
    });

    // Fetch the created stock with associations
    const createdStock = await Stock.findByPk(stock.id, {
      include: [
        {
          model: Store,
          as: 'store'
        },
        {
          model: Material,
          as: 'material',
          include: [
            {
              model: Category,
              as: 'category'
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
      message: 'Stock record created successfully',
      data: createdStock
    });
  } catch (error) {
    console.error('Create stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getStockById = async (req, res) => {
  try {
    const { id } = req.params;

    const stock = await Stock.findByPk(id, {
      include: [
        {
          model: Store,
          as: 'store'
        },
        {
          model: Material,
          as: 'material',
          include: [
            {
              model: Category,
              as: 'category'
            },
            {
              model: Unit,
              as: 'unit'
            }
          ]
        }
      ]
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }

    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Get stock by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
const getStockByMaterialId = async (req, res) => {
  try {
    const { id: material_id } = req.params;

    const stock = await Stock.findOne({
      where: { material_id },
      include: [
        {
          model: Store,
          as: 'store'
        },
        {
          model: Material,
          as: 'material',
          include: [
            {
              model: Category,
              as: 'category'
            },
            {
              model: Unit,
              as: 'unit'
            }
          ]
        }
      ]
    });

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }

    res.json({
      success: true,
      data: stock
    });
  } catch (error) {
    console.error('Get stock by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { qty_on_hand, reorder_level, low_stock_threshold, low_stock_alert } = req.body;

    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }

    // Check if stock is going low
    let shouldAlert = false;
    if (low_stock_threshold && qty_on_hand <= low_stock_threshold) {
      shouldAlert = true;
    }

    await stock.update({
      qty_on_hand,
      reorder_level,
      low_stock_threshold,
      low_stock_alert: shouldAlert || low_stock_alert
    });

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: stock
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getLowStockAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 10, store_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { low_stock_alert: true };
    if (store_id) whereClause.store_id = store_id;

    const { count, rows: lowStockItems } = await Stock.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Store,
          as: 'store'
        },
        {
          model: Material,
          as: 'material',
          include: [
            {
              model: Category,
              as: 'category'
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
      order: [['updated_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        lowStockItems,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const setLowStockThreshold = async (req, res) => {
  try {
    const { id } = req.params;
    const { low_stock_threshold } = req.body;

    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }

    // Check if current stock is below threshold
    const shouldAlert = stock.qty_on_hand <= low_stock_threshold;

    await stock.update({
      low_stock_threshold,
      low_stock_alert: shouldAlert
    });

    res.json({
      success: true,
      message: 'Low stock threshold set successfully',
      data: stock
    });
  } catch (error) {
    console.error('Set low stock threshold error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const acknowledgeLowStockAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock record not found'
      });
    }

    await stock.update({ low_stock_alert: false });

    res.json({
      success: true,
      message: 'Low stock alert acknowledged',
      data: stock
    });
  } catch (error) {
    console.error('Acknowledge low stock alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getStockMovements = async (req, res) => {
  try {
    const { page = 1, limit = 10, store_id, material_id, type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (store_id) whereClause.store_id = store_id;
    if (material_id) whereClause.material_id = material_id;
    if (type) whereClause.type = type;

    const { count, rows: movements } = await StockMovement.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Store,
          as: 'store'
        },
        {
           model: Request,
          as: 'source'
        },
         {
                  model: User,
                  as: 'createdBy',
                  include: [{
                    model: Role,
                    as: 'role'
                  }]
                },
        {
          model: Material,
          as: 'material',
          include: [
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
        movements,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getProcurementRecommendations = async (req, res) => {
  try {
    const { page = 1, limit = 10, store_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { low_stock_alert: true },
        { qty_on_hand: { [Op.lte]: sequelize.col('reorder_level') } },
        { qty_on_hand: 0 }
      ]
    };

    if (store_id) whereClause.store_id = store_id;

    const { count, rows: recommendations } = await Stock.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Store,
          as: 'store'
        },
        {
          model: Material,
          as: 'material',
          include: [
            {
              model: Category,
              as: 'category'
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
      order: [
        ['low_stock_alert', 'DESC'],
        ['qty_on_hand', 'ASC']
      ]
    });

    // Add procurement recommendations
    const recommendationsWithSuggestions = recommendations.map(stock => {
      const material = stock.material;
      const currentStock = parseFloat(stock.qty_on_hand);
      const reorderLevel = parseFloat(stock.reorder_level) || 0;
      const lowStockThreshold = parseFloat(stock.low_stock_threshold) || 0;

      let priority = 'LOW';
      let suggestedQty = 0;
      let reason = '';

      if (currentStock === 0) {
        priority = 'CRITICAL';
        suggestedQty = Math.max(reorderLevel * 2, 100); // Suggest 2x reorder level or minimum 100
        reason = 'Out of stock - immediate purchase required';
      } else if (stock.low_stock_alert || currentStock <= lowStockThreshold) {
        priority = 'HIGH';
        suggestedQty = Math.max(reorderLevel - currentStock, reorderLevel);
        reason = 'Below low stock threshold';
      } else if (currentStock <= reorderLevel) {
        priority = 'MEDIUM';
        suggestedQty = reorderLevel * 1.5 - currentStock;
        reason = 'At or below reorder level';
      }

      return {
        ...stock.toJSON(),
        procurementRecommendation: {
          priority,
          suggestedQty: Math.ceil(suggestedQty),
          reason,
          currentStock,
          reorderLevel,
          lowStockThreshold
        }
      };
    });

    res.json({
      success: true,
      data: {
        recommendations: recommendationsWithSuggestions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get procurement recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
const issueMaterials = async (req, res) => {
  try {
    const { request_id, items } = req.body;

    // 1. Validate input
    if (!request_id || !items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Request ID and items array are required'
      });
    }

    // 2. Load request with details
    const request = await Request.findByPk(request_id, {
      include: [
        {
          model: RequestItem,
          as: 'items',
          include: [{ model: Material, as: 'material' }]
        },
        { model: User, as: 'requestedBy' },
        { model: Site, as: 'site' }
      ]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Request must be approved before issuing materials' });
    }

    // 3. Start transaction
    const transaction = await sequelize.transaction();

    try {
      const issuedItems = [];
      const stockMovements = [];

      for (const item of items) {
        const { request_item_id, qty_issued, store_id, notes } = item;

        // Find matching request item
        const requestItem = request.items.find(ri => ri.id === request_item_id);
        if (!requestItem) {
          throw new Error(`Request item ${request_item_id} not found`);
        }

        // Prevent double issuing
        if (requestItem.qty_issued > 0) {
          throw new Error(`Item ${requestItem.material.name} has already been issued`);
        }

        // Ensure not issuing more than requested
        if (qty_issued > requestItem.qty_requested) {
          throw new Error(`Cannot issue more than requested for ${requestItem.material.name}`);
        }

        // Fetch stock with row-level lock (for concurrency safety)
        const stock = await Stock.findOne({
          where: { material_id: requestItem.material_id, store_id },
          transaction,
          lock: transaction.LOCK.UPDATE
        });

        if (!stock) {
          throw new Error(`Stock not found for material ${requestItem.material.name} in store`);
        }

        if (stock.qty_on_hand < qty_issued) {
          throw new Error(`Insufficient stock for ${requestItem.material.name}. Available: ${stock.qty_on_hand}, Requested: ${qty_issued}`);
        }

        // Update request item
        await requestItem.update(
          {
            qty_issued,
            issued_at: new Date(),
            issued_by: req.user.id
          },
          { transaction }
        );

        // Update stock
        const newQtyOnHand = stock.qty_on_hand - qty_issued;
        const shouldAlert = newQtyOnHand <= stock.low_stock_threshold;

        await stock.update(
          { qty_on_hand: newQtyOnHand, low_stock_alert: shouldAlert },
          { transaction }
        );

        // Create stock movement record
        const stockMovement = await StockMovement.create({
          material_id: requestItem.material_id,
          store_id: store_id,
          movement_type: 'OUT',         // ✅ matches model
          source_type: 'ISSUE',         // ✅ matches model ENUM
          source_id: request_id,        // ✅ matches model
          qty: qty_issued,              // ✅ matches model
          unit_price: null,             // optional
          notes: notes || `Issued to ${request.requestedBy.full_name} for ${request.site.name}`,
          created_by: req.user.id
        }, { transaction });


        issuedItems.push({
          request_item_id,
          material_name: requestItem.material.name,
          qty_issued,
          store_id
        });

        stockMovements.push(stockMovement);
      }

      // 4. Update overall request status
      const allItemsIssued = request.items.every(item => item.qty_issued > 0);
      if (allItemsIssued) {
        await request.update(
          { status: 'ISSUED', issued_at: new Date(), issued_by: req.user.id },
          { transaction }
        );
      }

      // 5. Commit transaction
      await transaction.commit();

      return res.json({
        success: true,
        message: 'Materials issued successfully',
        data: {
          request_id,
          issued_items: issuedItems,
          stock_movements: stockMovements,
          request_status: allItemsIssued ? 'ISSUED' : 'PARTIALLY_ISSUED'
        }
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Issue materials error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

const getIssuableRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, site_id, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { status: 'APPROVED' };
    if (site_id) whereClause.site_id = site_id;

    const { count, rows: requests } = await Request.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: RequestItem,
          as: 'items',
          where: {
            qty_issued: 0 // Only items not yet issued
          },
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
            }
          ]
        },
        {
          model: User,
          as: 'requestedBy'
        },
        {
          model: Site,
          as: 'site'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'ASC']]
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
    console.error('Get issuable requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getIssuedMaterials = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, request_id, site_id, date_from, date_to } = req.query;
  const offset = (page - 1) * limit;

  // Validate query parameters
  if (page < 1 || limit < 1 || limit > 100) {
    throw new ValidationError('Invalid pagination parameters');
  }

  const whereClause = { movement_type: 'OUT' };
  if (request_id) whereClause.source_id = request_id;
  if (date_from || date_to) {
    whereClause.created_at = {};
    if (date_from) {
      const fromDate = new Date(date_from);
      if (isNaN(fromDate.getTime())) {
        throw new ValidationError('Invalid date_from format');
      }
      whereClause.created_at[Op.gte] = fromDate;
    }
    if (date_to) {
      const toDate = new Date(date_to);
      if (isNaN(toDate.getTime())) {
        throw new ValidationError('Invalid date_to format');
      }
      whereClause.created_at[Op.lte] = toDate;
    }
  }

  const { count, rows: movements } = await StockMovement.findAndCountAll({
    where: whereClause,
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
        model: Store,
        as: 'store'
      },
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'full_name', 'email']
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['created_at', 'DESC']]
  });

  // If site_id is provided, filter by site through the request
  let filteredMovements = movements;
  let filteredCount = count;

  if (site_id) {
    const requestIds = movements.map(m => m.source_id).filter(id => id);
    if (requestIds.length > 0) {
      const requests = await Request.findAll({
        where: {
          id: { [Op.in]: requestIds },
          site_id: site_id
        },
        attributes: ['id']
      });
      const validRequestIds = requests.map(r => r.id);
      filteredMovements = movements.filter(m => validRequestIds.includes(m.source_id));
      filteredCount = filteredMovements.length;
    } else {
      filteredMovements = [];
      filteredCount = 0;
    }
  }

  res.json({
    success: true,
    data: {
      issued_materials: filteredMovements,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(filteredCount / limit),
        total_items: filteredCount,
        items_per_page: parseInt(limit)
      }
    }
  });
});

module.exports = {
  getAllStock,
  createStock,
  getStockById,
  updateStock,
  getLowStockAlerts,
  setLowStockThreshold,
  acknowledgeLowStockAlert,
  getStockMovements,
  getProcurementRecommendations,
  issueMaterials,
  getIssuableRequests,
  getStockByMaterialId,
  getIssuedMaterials
};




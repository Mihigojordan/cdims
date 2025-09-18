const { Request, RequestItem, Material, Stock, StockMovement, PurchaseOrder, PurchaseOrderItem, Issue, User, Site, Store } = require('../../models');
const { Op } = require('sequelize');

const getRequestReports = async (req, res) => {
  try {
    const { site_id, status, date_from, date_to, format = 'json' } = req.query;

    const whereClause = {};
    if (site_id) whereClause.site_id = site_id;
    if (status) whereClause.status = status;
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }

    const requests = await Request.findAll({
      where: whereClause,
      include: [
        {
          model: RequestItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material'
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate summary statistics
    const summary = {
      total_requests: requests.length,
      total_value: requests.reduce((sum, req) => {
        return sum + req.items.reduce((itemSum, item) => {
          return itemSum + (item.qty_requested * (item.material?.unit_price || 0));
        }, 0);
      }, 0),
      status_breakdown: requests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        requests,
        summary
      }
    });
  } catch (error) {
    console.error('Get request reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getInventoryReports = async (req, res) => {
  try {
    const { store_id, low_stock_only } = req.query;

    const whereClause = {};
    if (store_id) whereClause.store_id = store_id;

    const stock = await Stock.findAll({
      where: whereClause,
      include: [
        {
          model: Material,
          as: 'material'
        }
      ],
      order: [['qty_on_hand', 'ASC']]
    });

    // Filter low stock items if requested
    let filteredStock = stock;
    if (low_stock_only === 'true') {
      filteredStock = stock.filter(item => 
        item.qty_on_hand <= item.reorder_level
      );
    }

    // Calculate summary statistics
    const summary = {
      total_items: filteredStock.length,
      total_value: filteredStock.reduce((sum, item) => {
        return sum + (item.qty_on_hand * (item.material?.unit_price || 0));
      }, 0),
      low_stock_items: filteredStock.filter(item => 
        item.qty_on_hand <= item.reorder_level
      ).length,
      out_of_stock_items: filteredStock.filter(item => 
        item.qty_on_hand === 0
      ).length
    };

    res.json({
      success: true,
      data: {
        stock: filteredStock,
        summary
      }
    });
  } catch (error) {
    console.error('Get inventory reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const getStockMovementReports = async (req, res) => {
  try {
    const { store_id, material_id, movement_type, date_from, date_to } = req.query;

    const whereClause = {};
    if (store_id) whereClause.store_id = store_id;
    if (material_id) whereClause.material_id = material_id;
    if (movement_type) whereClause.movement_type = movement_type;
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }

    const movements = await StockMovement.findAll({
      where: whereClause,
      include: [
        {
          model: Material,
          as: 'material'
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate summary statistics
    const summary = {
      total_movements: movements.length,
      total_in: movements.filter(m => m.movement_type === 'IN').length,
      total_out: movements.filter(m => m.movement_type === 'OUT').length,
      total_adjustments: movements.filter(m => m.movement_type === 'ADJUSTMENT').length
    };

    res.json({
      success: true,
      data: {
        movements,
        summary
      }
    });
  } catch (error) {
    console.error('Get stock movement reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getProcurementReports = async (req, res) => {
  try {
    const { supplier_id, status, date_from, date_to } = req.query;

    const whereClause = {};
    if (supplier_id) whereClause.supplier_id = supplier_id;
    if (status) whereClause.status = status;
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }

    const purchaseOrders = await PurchaseOrder.findAll({
      where: whereClause,
      include: [
        {
          model: PurchaseOrderItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material'
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate summary statistics
    const summary = {
      total_orders: purchaseOrders.length,
      total_value: purchaseOrders.reduce((sum, po) => {
        return sum + po.items.reduce((itemSum, item) => {
          return itemSum + (item.qty_ordered * item.unit_price);
        }, 0);
      }, 0),
      status_breakdown: purchaseOrders.reduce((acc, po) => {
        acc[po.status] = (acc[po.status] || 0) + 1;
        return acc;
      }, {})
    };

    res.json({
      success: true,
      data: {
        purchaseOrders,
        summary
      }
    });
  } catch (error) {
    console.error('Get procurement reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getUserActivityReports = async (req, res) => {
  try {
    const { user_id, date_from, date_to } = req.query;

    const whereClause = {};
    if (user_id) whereClause.user_id = user_id;
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }

    // Get user activity from requests
    const requests = await Request.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requestedBy',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate user activity summary
    const userActivity = requests.reduce((acc, req) => {
      const userId = req.requested_by;
      const userName = req.requestedBy?.full_name || 'Unknown User';
      
      if (!acc[userId]) {
        acc[userId] = {
          user_name: userName,
          total_requests: 0,
          approved_requests: 0,
          rejected_requests: 0,
          pending_requests: 0
        };
      }

      acc[userId].total_requests += 1;
      
      if (req.status === 'APPROVED') acc[userId].approved_requests += 1;
      else if (req.status === 'REJECTED') acc[userId].rejected_requests += 1;
      else acc[userId].pending_requests += 1;

      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        userActivity,
        total_users: Object.keys(userActivity).length,
        total_requests: requests.length
      }
    });
  } catch (error) {
    console.error('Get user activity reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getSitePerformanceReports = async (req, res) => {
  try {
    const { site_id, date_from, date_to } = req.query;

    const whereClause = {};
    if (site_id) whereClause.site_id = site_id;
    if (date_from || date_to) {
      whereClause.created_at = {};
      if (date_from) whereClause.created_at[Op.gte] = new Date(date_from);
      if (date_to) whereClause.created_at[Op.lte] = new Date(date_to);
    }

    const requests = await Request.findAll({
      where: whereClause,
      include: [
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'location']
        },
        {
          model: RequestItem,
          as: 'items',
          include: [
            {
              model: Material,
              as: 'material'
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Calculate site performance
    const sitePerformance = requests.reduce((acc, req) => {
      const siteId = req.site_id;
      const siteName = req.site?.name || 'Unknown Site';
      
      if (!acc[siteId]) {
        acc[siteId] = {
          site_name: siteName,
          total_requests: 0,
          total_value: 0,
          approved_requests: 0,
          rejected_requests: 0,
          pending_requests: 0,
          average_processing_time: 0
        };
      }

      acc[siteId].total_requests += 1;
      
      if (req.status === 'APPROVED') acc[siteId].approved_requests += 1;
      else if (req.status === 'REJECTED') acc[siteId].rejected_requests += 1;
      else acc[siteId].pending_requests += 1;

      // Calculate total value
      req.items.forEach(item => {
        const unitPrice = item.material?.unit_price || 0;
        acc[siteId].total_value += item.qty_requested * unitPrice;
      });

      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        sitePerformance,
        total_sites: Object.keys(sitePerformance).length,
        total_requests: requests.length
      }
    });
  } catch (error) {
    console.error('Get site performance reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getRequestReports,
  getInventoryReports,
  getStockMovementReports,
  getProcurementReports,
  getUserActivityReports,
  getSitePerformanceReports
};

const { Supplier, PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem, Material, Unit, Store, User } = require('../../models');

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: { suppliers }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, contact, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Supplier name is required'
      });
    }

    const supplier = await Supplier.create({
      name,
      contact,
      phone,
      email
    });

    res.status(201).json({
      success: true,
      data: { supplier },
      message: 'Supplier created successfully'
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getPurchaseOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, supplier_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (supplier_id) whereClause.supplier_id = supplier_id;

    const { count, rows: purchaseOrders } = await PurchaseOrder.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Supplier,
          as: 'supplier'
        },
        {
          model: User,
          as: 'createdBy'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        purchaseOrders,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier_id, items } = req.body;
    const created_by = req.user.id;

    if (!supplier_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Supplier ID and items are required'
      });
    }

    const purchaseOrder = await PurchaseOrder.create({
      supplier_id,
      created_by,
      status: 'DRAFT'
    });

    // Create purchase order items
    const purchaseOrderItems = await Promise.all(
      items.map(item => 
        PurchaseOrderItem.create({
          purchase_order_id: purchaseOrder.id,
          material_id: item.material_id,
          unit_id: item.unit_id,
          qty_ordered: item.qty_ordered,
          unit_price: item.unit_price
        })
      )
    );

    // Fetch complete purchase order with items
    const completePO = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [
        {
          model: Supplier,
          as: 'supplier'
        },
        {
          model: User,
          as: 'createdBy'
        },
        {
          model: PurchaseOrderItem,
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
      data: { purchaseOrder: completePO },
      message: 'Purchase order created successfully'
    });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier'
        },
        {
          model: User,
          as: 'createdBy'
        },
        {
          model: PurchaseOrderItem,
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

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    res.json({
      success: true,
      data: { purchaseOrder }
    });
  } catch (error) {
    console.error('Get purchase order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, items } = req.body;

    const purchaseOrder = await PurchaseOrder.findByPk(id);
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    // Update purchase order fields
    if (status) purchaseOrder.status = status;
    await purchaseOrder.save();

    // Update items if provided
    if (items) {
      // Delete existing items
      await PurchaseOrderItem.destroy({ where: { purchase_order_id: id } });
      
      // Create new items
      await Promise.all(
        items.map(item => 
          PurchaseOrderItem.create({
            purchase_order_id: id,
            material_id: item.material_id,
            unit_id: item.unit_id,
            qty_ordered: item.qty_ordered,
            unit_price: item.unit_price
          })
        )
      );
    }

    // Fetch updated purchase order
    const updatedPO = await PurchaseOrder.findByPk(id, {
      include: [
        {
          model: Supplier,
          as: 'supplier'
        },
        {
          model: User,
          as: 'createdBy'
        },
        {
          model: PurchaseOrderItem,
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
      data: { purchaseOrder: updatedPO },
      message: 'Purchase order updated successfully'
    });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const sendPurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await PurchaseOrder.findByPk(id);
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    if (purchaseOrder.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Only draft purchase orders can be sent'
      });
    }

    purchaseOrder.status = 'SENT';
    await purchaseOrder.save();

    res.json({
      success: true,
      message: 'Purchase order sent successfully'
    });
  } catch (error) {
    console.error('Send purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getGoodsReceipts = async (req, res) => {
  try {
    const { page = 1, limit = 10, store_id } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (store_id) whereClause.store_id = store_id;

    const { count, rows: goodsReceipts } = await GoodsReceipt.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrder'
        },
        {
          model: Store,
          as: 'store'
        },
        {
          model: User,
          as: 'receivedBy'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['received_at', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        goodsReceipts,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get goods receipts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const createGoodsReceipt = async (req, res) => {
  try {
    const { purchase_order_id, store_id, items } = req.body;
    const received_by = req.user.id;

    if (!store_id || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Store ID and items are required'
      });
    }

    const goodsReceipt = await GoodsReceipt.create({
      purchase_order_id,
      store_id,
      received_by
    });

    // Create goods receipt items
    const goodsReceiptItems = await Promise.all(
      items.map(item => 
        GoodsReceiptItem.create({
          goods_receipt_id: goodsReceipt.id,
          material_id: item.material_id,
          unit_id: item.unit_id,
          qty_received: item.qty_received,
          unit_price: item.unit_price
        })
      )
    );

    res.status(201).json({
      success: true,
      data: { goodsReceipt },
      message: 'Goods receipt created successfully'
    });
  } catch (error) {
    console.error('Create goods receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getGoodsReceiptById = async (req, res) => {
  try {
    const { id } = req.params;

    const goodsReceipt = await GoodsReceipt.findByPk(id, {
      include: [
        {
          model: PurchaseOrder,
          as: 'purchaseOrder'
        },
        {
          model: Store,
          as: 'store'
        },
        {
          model: User,
          as: 'receivedBy'
        },
        {
          model: GoodsReceiptItem,
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

    if (!goodsReceipt) {
      return res.status(404).json({
        success: false,
        message: 'Goods receipt not found'
      });
    }

    res.json({
      success: true,
      data: { goodsReceipt }
    });
  } catch (error) {
    console.error('Get goods receipt by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  getPurchaseOrderById,
  updatePurchaseOrder,
  sendPurchaseOrder,
  getGoodsReceipts,
  createGoodsReceipt,
  getGoodsReceiptById
};

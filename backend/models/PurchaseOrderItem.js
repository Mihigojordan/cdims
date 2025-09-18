const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  purchase_order_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'purchase_orders',
      key: 'id'
    }
  },
  material_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'materials',
      key: 'id'
    }
  },
  unit_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'units',
      key: 'id'
    }
  },
  qty_ordered: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'purchase_order_items'
});

module.exports = PurchaseOrderItem;

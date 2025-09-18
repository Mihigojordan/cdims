const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const GoodsReceiptItem = sequelize.define('GoodsReceiptItem', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  goods_receipt_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'goods_receipts',
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
  qty_received: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  }
}, {
  tableName: 'goods_receipt_items'
});

module.exports = GoodsReceiptItem;

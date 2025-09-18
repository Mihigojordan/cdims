const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const GoodsReceipt = sequelize.define('GoodsReceipt', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  grn_no: {
    type: DataTypes.STRING(50),
    unique: true
  },
  purchase_order_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'purchase_orders',
      key: 'id'
    }
  },
  store_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id'
    }
  },
  received_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'goods_receipts',
  hooks: {
    beforeCreate: async (gr) => {
      if (!gr.grn_no) {
        const year = new Date().getFullYear();
        const count = await GoodsReceipt.count();
        gr.grn_no = `GRN-${year}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

module.exports = GoodsReceipt;

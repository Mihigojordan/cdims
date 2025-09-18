const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  po_no: {
    type: DataTypes.STRING(50),
    unique: true
  },
  supplier_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'suppliers',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'DRAFT'
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'purchase_orders',
  hooks: {
    beforeCreate: async (po) => {
      if (!po.po_no) {
        const year = new Date().getFullYear();
        const count = await PurchaseOrder.count();
        po.po_no = `PO-${year}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

module.exports = PurchaseOrder;

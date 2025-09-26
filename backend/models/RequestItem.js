const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const RequestItem = sequelize.define('RequestItem', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  request_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'requests',
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
  qty_requested: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false
  },
  qty_approved: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: true
  },
  qty_issued: {
    type: DataTypes.DECIMAL(12, 3),
    defaultValue: 0
  },
  qty_received: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: true,
    defaultValue: 0,
    comment: 'Quantity received by Site Engineer'
  },
  received_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when materials were received'
  },
  received_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who received the materials'
  },
  issued_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when materials were issued'
  },
  issued_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who issued the materials'
  }
}, {
  tableName: 'request_items',
  timestamps: true,              // ✅ enables Sequelize timestamps
  createdAt: 'created_at',       // ✅ custom field name
  updatedAt: 'updated_at',       // ✅ custom field name
  indexes: [
    { fields: ['request_id'] }
  ]
});

module.exports = RequestItem;

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
}, {
  tableName: 'request_items',
  indexes: [
    {
      fields: ['request_id']
    }
  ]
});

module.exports = RequestItem;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Stock = sequelize.define('Stock', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  store_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'stores',
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
  qty_on_hand: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false,
    defaultValue: 0
  },
  reorder_level: {
    type: DataTypes.DECIMAL(12, 3),
    defaultValue: 0
  },
  low_stock_threshold: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: true,
    comment: 'Minimum stock level before alert'
  },
  low_stock_alert: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether low stock alert is active'
  }
}, {
  tableName: 'stock',
  indexes: [
    {
      unique: true,
      fields: ['store_id', 'material_id']
    }
  ]
});

module.exports = Stock;

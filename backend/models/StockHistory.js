const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const StockHistory = sequelize.define('StockHistory', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  stock_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'stock',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  material_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'materials',
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
  movement_type: {
    type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'),
    allowNull: false
  },
  source_type: {
    type: DataTypes.ENUM('GRN', 'ISSUE', 'ADJUSTMENT', 'RECEIPT'),
    allowNull: false
  },
  source_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: 'ID of the source record (request, purchase order, etc.)'
  },
  qty_before: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false,
    comment: 'Quantity before the movement'
  },
  qty_change: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false,
    comment: 'Quantity change (positive for IN, negative for OUT)'
  },
  qty_after: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false,
    comment: 'Quantity after the movement'
  },
  unit_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    comment: 'Unit price at the time of movement'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Additional notes about the movement'
  },
  created_by: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'stock_history',
  timestamps: false,
  indexes: [
    {
      fields: ['stock_id', 'created_at']
    },
    {
      fields: ['material_id', 'store_id', 'created_at']
    },
    {
      fields: ['movement_type', 'created_at']
    }
  ]
});

module.exports = StockHistory;

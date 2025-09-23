const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const StockMovement = sequelize.define('StockMovement', {
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
  movement_type: {
    type: DataTypes.ENUM('IN', 'OUT', 'ADJUSTMENT'),
    allowNull: false
  },
  source_type: {
    type: DataTypes.ENUM('GRN', 'ISSUE', 'ADJUSTMENT'),
    allowNull: false
  },
  source_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'requests',   // ✅ foreign key to requests table
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  qty: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'stock_movements',
  timestamps: false,
  indexes: [
    {
      fields: ['store_id', 'material_id', 'created_at']
    }
  ]
});

module.exports = StockMovement;

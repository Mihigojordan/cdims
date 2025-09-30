// Material.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Material = sequelize.define('Material', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  specification: {
    type: DataTypes.TEXT
  },
  category_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  unit_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'units',
      key: 'id'
    },
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Unit price of the material'
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'materials',
  timestamps: true,  // ✅ adds createdAt & updatedAt automatically
  underscored: true  // ✅ makes them snake_case (created_at, updated_at)
});

module.exports = Material;

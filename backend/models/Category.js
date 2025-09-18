const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  parent_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'categories'
});

module.exports = Category;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  contact: {
    type: DataTypes.STRING(150)
  },
  phone: {
    type: DataTypes.STRING(50)
  },
  email: {
    type: DataTypes.STRING(150)
  }
}, {
  tableName: 'suppliers'
});

module.exports = Supplier;

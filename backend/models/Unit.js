const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Unit = sequelize.define('Unit', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'units'
});

module.exports = Unit;

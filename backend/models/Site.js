const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Site = sequelize.define('Site', {
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
    type: DataTypes.STRING(150),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'sites'
});

module.exports = Site;

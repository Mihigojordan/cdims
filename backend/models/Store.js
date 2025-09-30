const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  manager_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  contact_email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  }
}, {
  tableName: 'stores',
  timestamps: true,   // ✅ Sequelize manages createdAt & updatedAt
  underscored: true   // ✅ names them created_at, updated_at
});

module.exports = Store;

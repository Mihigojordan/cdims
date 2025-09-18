const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  entity: {
    type: DataTypes.STRING(50)
  },
  entity_id: {
    type: DataTypes.BIGINT
  },
  action: {
    type: DataTypes.STRING(50)
  },
  details: {
    type: DataTypes.JSON
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'audit_logs',
  timestamps: false,
  indexes: [
    {
      fields: ['entity', 'entity_id']
    }
  ]
});

module.exports = AuditLog;

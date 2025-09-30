const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Approval = sequelize.define('Approval', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  request_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'requests',
      key: 'id'
    }
  },
  level: {
    type: DataTypes.ENUM('DSE', 'PADIRI'),
    allowNull: false
  },
  reviewer_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('APPROVED', 'REJECTED', 'VERIFIED','MODIFIED'),
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'approvals',
  timestamps: false,
  indexes: [
    {
      fields: ['request_id', 'level']
    }
  ]
});

module.exports = Approval;

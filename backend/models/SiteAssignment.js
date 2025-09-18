const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const SiteAssignment = sequelize.define('SiteAssignment', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  site_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'sites',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigned_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE'
  }
}, {
  tableName: 'site_assignments',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['site_id', 'user_id'],
      name: 'unique_site_user_assignment'
    }
  ]
});

module.exports = SiteAssignment;

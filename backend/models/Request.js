const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Request = sequelize.define('Request', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  ref_no: {
    type: DataTypes.STRING(50),
    unique: true
  },
  site_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'sites',
      key: 'id'
    }
  },
  requested_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM(
      'DRAFT',
      'SUBMITTED',
      'DSE_REVIEW',
      'PADIRI_REVIEW',
      'APPROVED',
      'PARTIALLY_ISSUED',
      'ISSUED',
      'REJECTED',
      'CLOSED'
    ),
    allowNull: false,
    defaultValue: 'DRAFT'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'requests',
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['site_id']
    }
  ],
  hooks: {
    beforeCreate: async (request) => {
      if (!request.ref_no) {
        const year = new Date().getFullYear();
        const count = await Request.count();
        request.ref_no = `REQ-${year}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

module.exports = Request;

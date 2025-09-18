const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Issue = sequelize.define('Issue', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  issue_no: {
    type: DataTypes.STRING(50),
    unique: true
  },
  request_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'requests',
      key: 'id'
    }
  },
  store_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id'
    }
  },
  issued_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  issued_to: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'issues',
  hooks: {
    beforeCreate: async (issue) => {
      if (!issue.issue_no) {
        const year = new Date().getFullYear();
        const count = await Issue.count();
        issue.issue_no = `ISS-${year}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

module.exports = Issue;

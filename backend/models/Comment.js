const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Comment = sequelize.define('Comment', {
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
  author_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'comments',
  timestamps: false
});

module.exports = Comment;

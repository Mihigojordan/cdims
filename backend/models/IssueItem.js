const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const IssueItem = sequelize.define('IssueItem', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  issue_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'issues',
      key: 'id'
    }
  },
  request_item_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'request_items',
      key: 'id'
    }
  },
  material_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'materials',
      key: 'id'
    }
  },
  unit_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'units',
      key: 'id'
    }
  },
  qty_issued: {
    type: DataTypes.DECIMAL(12, 3),
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true
  }
}, {
  tableName: 'issue_items'
});

module.exports = IssueItem;

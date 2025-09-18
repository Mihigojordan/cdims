const { DataTypes } = require('sequelize');
const { sequelize } = require('../src/config/database');

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  request_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'requests',
      key: 'id'
    }
  },
  doc_type: {
    type: DataTypes.ENUM('BOQ', 'PHOTO', 'PO', 'INVOICE', 'DELIVERY_NOTE', 'OTHER'),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  uploaded_by: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'attachments',
  timestamps: false
});

module.exports = Attachment;

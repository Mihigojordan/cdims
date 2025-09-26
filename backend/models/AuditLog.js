const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who performed the action'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Action performed (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.)'
    },
    entity: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Type of resource affected (REQUEST, MATERIAL, USER, etc.)'
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the affected resource'
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional details about the action'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP address of the user'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent string'
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Session identifier'
    },
    status: {
      type: DataTypes.ENUM('SUCCESS', 'FAILED', 'PENDING'),
      allowNull: false,
      defaultValue: 'SUCCESS',
      comment: 'Status of the action'
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if action failed'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Additional metadata about the action'
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['action']
      },
      {
        fields: ['resource_type']
      },
      {
        fields: ['resource_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['user_id', 'created_at']
      },
      {
        fields: ['resource_type', 'resource_id']
      }
    ]
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return AuditLog;
};
'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // First, let's check if audit_logs table exists and enhance it
    const tableInfo = await queryInterface.describeTable('audit_logs').catch(() => null);
    
    if (!tableInfo) {
      // Create the audit_logs table if it doesn't exist
      await queryInterface.createTable('audit_logs', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        action: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: 'Action performed (CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.)'
        },
        resource_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: 'Type of resource affected (REQUEST, MATERIAL, USER, etc.)'
        },
        resource_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'ID of the affected resource'
        },
        old_values: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Previous values before change'
        },
        new_values: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'New values after change'
        },
        ip_address: {
          type: Sequelize.STRING(45),
          allowNull: true,
          comment: 'IP address of the user'
        },
        user_agent: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'User agent string'
        },
        session_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Session identifier'
        },
        status: {
          type: Sequelize.ENUM('SUCCESS', 'FAILED', 'PENDING'),
          allowNull: false,
          defaultValue: 'SUCCESS',
          comment: 'Status of the action'
        },
        error_message: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Error message if action failed'
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Additional metadata about the action'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });

      // Add indexes for better performance
      await queryInterface.addIndex('audit_logs', ['user_id']);
      await queryInterface.addIndex('audit_logs', ['action']);
      await queryInterface.addIndex('audit_logs', ['resource_type']);
      await queryInterface.addIndex('audit_logs', ['resource_id']);
      await queryInterface.addIndex('audit_logs', ['status']);
      await queryInterface.addIndex('audit_logs', ['created_at']);
      await queryInterface.addIndex('audit_logs', ['user_id', 'created_at']);
      await queryInterface.addIndex('audit_logs', ['resource_type', 'resource_id']);
    } else {
      // Table exists, let's check if we need to add any missing columns
      const columns = Object.keys(tableInfo);
      
      if (!columns.includes('ip_address')) {
        await queryInterface.addColumn('audit_logs', 'ip_address', {
          type: Sequelize.STRING(45),
          allowNull: true,
          comment: 'IP address of the user'
        });
      }
      
      if (!columns.includes('user_agent')) {
        await queryInterface.addColumn('audit_logs', 'user_agent', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'User agent string'
        });
      }
      
      if (!columns.includes('session_id')) {
        await queryInterface.addColumn('audit_logs', 'session_id', {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: 'Session identifier'
        });
      }
      
      if (!columns.includes('status')) {
        await queryInterface.addColumn('audit_logs', 'status', {
          type: Sequelize.ENUM('SUCCESS', 'FAILED', 'PENDING'),
          allowNull: false,
          defaultValue: 'SUCCESS',
          comment: 'Status of the action'
        });
      }
      
      if (!columns.includes('error_message')) {
        await queryInterface.addColumn('audit_logs', 'error_message', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Error message if action failed'
        });
      }
      
      if (!columns.includes('metadata')) {
        await queryInterface.addColumn('audit_logs', 'metadata', {
          type: Sequelize.JSON,
          allowNull: true,
          comment: 'Additional metadata about the action'
        });
      }
    }
  },

  async down (queryInterface, Sequelize) {
    // Remove the enhanced columns if they exist
    const tableInfo = await queryInterface.describeTable('audit_logs').catch(() => null);
    
    if (tableInfo) {
      const columns = Object.keys(tableInfo);
      
      if (columns.includes('ip_address')) {
        await queryInterface.removeColumn('audit_logs', 'ip_address');
      }
      
      if (columns.includes('user_agent')) {
        await queryInterface.removeColumn('audit_logs', 'user_agent');
      }
      
      if (columns.includes('session_id')) {
        await queryInterface.removeColumn('audit_logs', 'session_id');
      }
      
      if (columns.includes('status')) {
        await queryInterface.removeColumn('audit_logs', 'status');
      }
      
      if (columns.includes('error_message')) {
        await queryInterface.removeColumn('audit_logs', 'error_message');
      }
      
      if (columns.includes('metadata')) {
        await queryInterface.removeColumn('audit_logs', 'metadata');
      }
    }
  }
};

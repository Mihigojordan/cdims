'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('system_configs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Configuration key'
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Configuration value (JSON or string)'
      },
      type: {
        type: Sequelize.ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ARRAY'),
        allowNull: false,
        defaultValue: 'STRING',
        comment: 'Data type of the configuration value'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'GENERAL',
        comment: 'Configuration category'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Description of what this configuration does'
      },
      is_editable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether this configuration can be edited via API'
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this configuration is visible to non-admin users'
      },
      validation_rules: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Validation rules for the configuration value'
      },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      updated_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    // Add indexes
    await queryInterface.addIndex('system_configs', ['key']);
    await queryInterface.addIndex('system_configs', ['category']);
    await queryInterface.addIndex('system_configs', ['is_public']);
    await queryInterface.addIndex('system_configs', ['is_editable']);

    // Insert default system configurations
    await queryInterface.bulkInsert('system_configs', [
      {
        key: 'system_name',
        value: 'CDIMS - Construction Digital Inventory Management System',
        type: 'STRING',
        category: 'GENERAL',
        description: 'Name of the system',
        is_editable: true,
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'system_version',
        value: '1.0.0',
        type: 'STRING',
        category: 'GENERAL',
        description: 'Current system version',
        is_editable: false,
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'max_login_attempts',
        value: '5',
        type: 'NUMBER',
        category: 'SECURITY',
        description: 'Maximum login attempts before account lockout',
        is_editable: true,
        is_public: false,
        validation_rules: JSON.stringify({ min: 1, max: 10 }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'session_timeout_minutes',
        value: '480',
        type: 'NUMBER',
        category: 'SECURITY',
        description: 'Session timeout in minutes (8 hours default)',
        is_editable: true,
        is_public: false,
        validation_rules: JSON.stringify({ min: 30, max: 1440 }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'password_min_length',
        value: '6',
        type: 'NUMBER',
        category: 'SECURITY',
        description: 'Minimum password length',
        is_editable: true,
        is_public: false,
        validation_rules: JSON.stringify({ min: 4, max: 20 }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'audit_log_retention_days',
        value: '90',
        type: 'NUMBER',
        category: 'MAINTENANCE',
        description: 'Number of days to retain audit logs',
        is_editable: true,
        is_public: false,
        validation_rules: JSON.stringify({ min: 30, max: 365 }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'backup_retention_days',
        value: '30',
        type: 'NUMBER',
        category: 'MAINTENANCE',
        description: 'Number of days to retain database backups',
        is_editable: true,
        is_public: false,
        validation_rules: JSON.stringify({ min: 7, max: 90 }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'email_notifications_enabled',
        value: 'true',
        type: 'BOOLEAN',
        category: 'NOTIFICATIONS',
        description: 'Enable email notifications',
        is_editable: true,
        is_public: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'low_stock_threshold',
        value: '10',
        type: 'NUMBER',
        category: 'INVENTORY',
        description: 'Default low stock threshold percentage',
        is_editable: true,
        is_public: false,
        validation_rules: JSON.stringify({ min: 1, max: 50 }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'request_auto_approval_limit',
        value: '1000',
        type: 'NUMBER',
        category: 'WORKFLOW',
        description: 'Auto-approve requests under this amount (in system currency)',
        is_editable: true,
        is_public: false,
        validation_rules: JSON.stringify({ min: 0, max: 10000 }),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'supported_file_types',
        value: JSON.stringify(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png']),
        type: 'ARRAY',
        category: 'UPLOADS',
        description: 'Supported file types for uploads',
        is_editable: true,
        is_public: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        key: 'max_file_size_mb',
        value: '10',
        type: 'NUMBER',
        category: 'UPLOADS',
        description: 'Maximum file size in MB',
        is_editable: true,
        is_public: false,
        validation_rules: JSON.stringify({ min: 1, max: 100 }),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('system_configs');
  }
};

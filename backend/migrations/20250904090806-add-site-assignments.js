'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create site_assignments table
    await queryInterface.createTable('site_assignments', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      site_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'sites',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assigned_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assigned_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('site_assignments', ['site_id', 'user_id'], {
      unique: true,
      name: 'unique_site_user_assignment'
    });

    await queryInterface.addIndex('site_assignments', ['user_id']);
    await queryInterface.addIndex('site_assignments', ['assigned_by']);

    // Add low_stock_threshold to stock table
    await queryInterface.addColumn('stock', 'low_stock_threshold', {
      type: Sequelize.DECIMAL(12, 3),
      allowNull: true,
      comment: 'Minimum stock level before alert'
    });

    // Add low_stock_alert to stock table
    await queryInterface.addColumn('stock', 'low_stock_alert', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether low stock alert is active'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove low stock columns from stock table
    await queryInterface.removeColumn('stock', 'low_stock_alert');
    await queryInterface.removeColumn('stock', 'low_stock_threshold');

    // Drop site_assignments table
    await queryInterface.dropTable('site_assignments');
  }
};

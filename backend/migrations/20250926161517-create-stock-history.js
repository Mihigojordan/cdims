'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('stock_history', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      stock_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'stock',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      material_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'materials',
          key: 'id'
        }
      },
      store_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id'
        }
      },
      movement_type: {
        type: Sequelize.ENUM('IN', 'OUT', 'ADJUSTMENT'),
        allowNull: false
      },
      source_type: {
        type: Sequelize.ENUM('GRN', 'ISSUE', 'ADJUSTMENT', 'RECEIPT'),
        allowNull: false
      },
      source_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        comment: 'ID of the source record (request, purchase order, etc.)'
      },
      qty_before: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false,
        comment: 'Quantity before the movement'
      },
      qty_change: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false,
        comment: 'Quantity change (positive for IN, negative for OUT)'
      },
      qty_after: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false,
        comment: 'Quantity after the movement'
      },
      unit_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Unit price at the time of movement'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional notes about the movement'
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
       updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('stock_history', ['stock_id', 'created_at']);
    await queryInterface.addIndex('stock_history', ['material_id', 'store_id', 'created_at']);
    await queryInterface.addIndex('stock_history', ['movement_type', 'created_at']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('stock_history');
  }
};

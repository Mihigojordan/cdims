'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('purchase_order_items', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      purchase_order_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'purchase_orders',
          key: 'id'
        }
      },
      material_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'materials',
          key: 'id'
        }
      },
      unit_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'units',
          key: 'id'
        }
      },
      qty_ordered: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('purchase_order_items');
  }
};

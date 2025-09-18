'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('goods_receipts', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      grn_no: {
        type: Sequelize.STRING(50),
        unique: true
      },
      purchase_order_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'purchase_orders',
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
      received_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      received_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('goods_receipts');
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('goods_receipt_items', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      goods_receipt_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'goods_receipts',
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
      qty_received: {
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
    await queryInterface.dropTable('goods_receipt_items');
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_movements', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      store_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'stores',
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
      movement_type: {
        type: Sequelize.ENUM('IN', 'OUT', 'ADJUSTMENT'),
        allowNull: false
      },
      source_type: {
        type: Sequelize.ENUM('GRN', 'ISSUE', 'ADJUSTMENT'),
        allowNull: false
      },
      source_id: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      qty: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false
      },
      unit_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('stock_movements', ['store_id', 'material_id', 'created_at'], {
      name: 'idx_sm_store_mat'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock_movements');
  }
};

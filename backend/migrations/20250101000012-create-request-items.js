'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('request_items', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      request_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'requests',
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
      qty_requested: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false
      },
      qty_approved: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: true
      },
      qty_issued: {
        type: Sequelize.DECIMAL(12, 3),
        defaultValue: 0
      },
      est_unit_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
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

    await queryInterface.addIndex('request_items', ['request_id'], {
      name: 'idx_ri_request'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('request_items');
  }
};

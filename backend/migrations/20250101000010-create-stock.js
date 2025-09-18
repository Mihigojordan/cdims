'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock', {
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
      qty_on_hand: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0
      },
      reorder_level: {
        type: Sequelize.DECIMAL(12, 3),
        defaultValue: 0
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

    await queryInterface.addIndex('stock', ['store_id', 'material_id'], {
      unique: true,
      name: 'uk_store_material'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock');
  }
};

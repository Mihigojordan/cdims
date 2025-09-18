'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('material_prices', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      material_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'materials',
          key: 'id'
        }
      },
      unit_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      effective_from: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      effective_to: {
        type: Sequelize.DATEONLY,
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

    await queryInterface.addIndex('material_prices', ['material_id', 'effective_from', 'effective_to'], {
      name: 'idx_price_effective'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('material_prices');
  }
};

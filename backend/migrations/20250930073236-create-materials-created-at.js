'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('materials', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: Sequelize.STRING(50),
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      specification: {
        type: Sequelize.TEXT
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      unit_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'units',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Unit price of the material'
      },
      active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {          // ✅ timestamps
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('materials');
  }
};

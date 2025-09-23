'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_movements', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      store_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'stores', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      material_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: 'materials', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
        allowNull: false,
        references: { model: 'requests', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      qty: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false
      },
      unit_price: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_by: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await queryInterface.addIndex('stock_movements', ['store_id', 'material_id', 'created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('stock_movements', ['store_id', 'material_id', 'created_at']);
    await queryInterface.dropTable('stock_movements');
  }
};

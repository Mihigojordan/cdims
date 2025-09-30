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
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      qty_on_hand: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0
      },
      reorder_level: {
        type: Sequelize.DECIMAL(12, 3),
        defaultValue: 0,
      },
      low_stock_threshold: {
        type: Sequelize.DECIMAL(12, 3),
        allowNull: true,
        comment: 'Minimum stock level before alert'
      },
      low_stock_alert: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether low stock alert is active'
      },
      created_at: {      // ✅ timestamps
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

    // Add unique index on (store_id, material_id)
    await queryInterface.addIndex('stock', ['store_id', 'material_id'], {
      unique: true,
      name: 'stock_store_material_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('stock');
  }
};

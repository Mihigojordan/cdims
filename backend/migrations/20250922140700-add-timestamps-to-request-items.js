'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if created_at column already exists
    const tableDescription = await queryInterface.describeTable('request_items');
    
    if (!tableDescription.created_at) {
      await queryInterface.addColumn('request_items', 'created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }

    if (!tableDescription.updated_at) {
      await queryInterface.addColumn('request_items', 'updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Only remove columns if they exist
    const tableDescription = await queryInterface.describeTable('request_items');
    
    if (tableDescription.created_at) {
      await queryInterface.removeColumn('request_items', 'created_at');
    }
    
    if (tableDescription.updated_at) {
      await queryInterface.removeColumn('request_items', 'updated_at');
    }
  }
};

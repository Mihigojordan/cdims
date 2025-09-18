'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if notes column exists, if not add it
    const tableDescription = await queryInterface.describeTable('stock_movements');
    if (!tableDescription.notes) {
      await queryInterface.addColumn('stock_movements', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }

    // Check if created_by column exists, if not add it
    if (!tableDescription.created_by) {
      await queryInterface.addColumn('stock_movements', 'created_by', {
        type: Sequelize.BIGINT,
        allowNull: true
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('stock_movements', 'notes');
    await queryInterface.removeColumn('stock_movements', 'created_by');
  }
};

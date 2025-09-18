'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the est_unit_price column from request_items table
    await queryInterface.removeColumn('request_items', 'est_unit_price');
  },

  async down(queryInterface, Sequelize) {
    // Re-add the est_unit_price column if needed to rollback
    await queryInterface.addColumn('request_items', 'est_unit_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Estimated unit price for the request item'
    });
  }
};

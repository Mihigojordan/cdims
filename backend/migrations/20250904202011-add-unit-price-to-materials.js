'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add unit_price column to materials table
    await queryInterface.addColumn('materials', 'unit_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Unit price of the material'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove unit_price column from materials table
    await queryInterface.removeColumn('materials', 'unit_price');
  }
};

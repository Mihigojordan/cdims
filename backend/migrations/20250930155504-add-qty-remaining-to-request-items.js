'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('request_items', 'qty_remaining', {
      type: Sequelize.DECIMAL(12, 3),
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('request_items', 'qty_remaining');
  }
};

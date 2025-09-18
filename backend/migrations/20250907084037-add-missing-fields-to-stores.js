'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add missing columns to stores table
    await queryInterface.addColumn('stores', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('stores', 'manager_name', {
      type: Sequelize.STRING(100),
      allowNull: true
    });

    await queryInterface.addColumn('stores', 'contact_phone', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('stores', 'contact_email', {
      type: Sequelize.STRING(100),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('stores', 'description');
    await queryInterface.removeColumn('stores', 'manager_name');
    await queryInterface.removeColumn('stores', 'contact_phone');
    await queryInterface.removeColumn('stores', 'contact_email');
  }
};

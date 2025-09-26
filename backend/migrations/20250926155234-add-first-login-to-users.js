'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'first_login', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Flag to track if user needs to change password on first login'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'first_login');
  }
};

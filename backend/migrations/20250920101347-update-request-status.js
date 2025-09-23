'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Update the ENUM values for `status` in `requests` table
    await queryInterface.changeColumn('requests', 'status', {
      type: Sequelize.ENUM(
        'PENDING',
        'SUBMITTED',
        'DSE_REVIEW',
        'WAITING_PADIRI_REVIEW',
        'APPROVED',
        'PARTIALLY_ISSUED',
        'ISSUED',
        'REJECTED',
        'CLOSED'
      ),
      allowNull: false,
      defaultValue: 'PENDING'
    });
  },

  async down (queryInterface, Sequelize) {
    // Rollback to the old ENUM (adjust to your previous state)
    await queryInterface.changeColumn('requests', 'status', {
      type: Sequelize.ENUM(
            'DRAFT',
      'SUBMITTED',
      'DSE_REVIEW',
      'PADIRI_REVIEW',
      'APPROVED',
      'PARTIALLY_ISSUED',
      'ISSUED',
      'REJECTED',
      'CLOSED'
        // add only the values you had originally, or fewer if that was your old state
      ),
      allowNull: false,
      defaultValue: 'DRAFT'
    });
  }
};

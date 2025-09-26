'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Update the ENUM values for `status` in `requests` table to include missing statuses
    await queryInterface.changeColumn('requests', 'status', {
      type: Sequelize.ENUM(
        'PENDING',
        'SUBMITTED',
        'DSE_REVIEW',
        'WAITING_PADIRI_REVIEW',
        'APPROVED',
        'VERIFIED',                    // DSE changes APPROVED → VERIFIED
        'ISSUED_FROM_APPROVED',        // Intermediate status between APPROVED and ISSUED
        'PARTIALLY_ISSUED',
        'ISSUED',
        'RECEIVED',                    // Site Engineer receives materials
        'REJECTED',
        'CLOSED'                       // Auto-close when all items received
      ),
      allowNull: false,
      defaultValue: 'PENDING'
    });
  },

  async down (queryInterface, Sequelize) {
    // Rollback to the previous ENUM values
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
  }
};

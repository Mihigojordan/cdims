'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add fields for tracking received quantities
    await queryInterface.addColumn('request_items', 'qty_received', {
      type: Sequelize.DECIMAL(12, 3),
      allowNull: true,
      defaultValue: 0,
      comment: 'Quantity received by Site Engineer'
    });

    await queryInterface.addColumn('request_items', 'received_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when materials were received'
    });

    await queryInterface.addColumn('request_items', 'received_by', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who received the materials'
    });

    await queryInterface.addColumn('request_items', 'issued_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when materials were issued'
    });

    await queryInterface.addColumn('request_items', 'issued_by', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who issued the materials'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('request_items', 'qty_received');
    await queryInterface.removeColumn('request_items', 'received_at');
    await queryInterface.removeColumn('request_items', 'received_by');
    await queryInterface.removeColumn('request_items', 'issued_at');
    await queryInterface.removeColumn('request_items', 'issued_by');
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add fields for tracking received and closed status
    await queryInterface.addColumn('requests', 'received_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when materials were received by Site Engineer'
    });

    await queryInterface.addColumn('requests', 'received_by', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who received the materials'
    });

    await queryInterface.addColumn('requests', 'closed_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when request was closed'
    });

    await queryInterface.addColumn('requests', 'closed_by', {
      type: Sequelize.BIGINT,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      comment: 'User who closed the request'
    });

    await queryInterface.addColumn('requests', 'issued_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when materials were issued by Storekeeper'
    });

    await queryInterface.addColumn('requests', 'issued_by', {
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
    await queryInterface.removeColumn('requests', 'received_at');
    await queryInterface.removeColumn('requests', 'received_by');
    await queryInterface.removeColumn('requests', 'closed_at');
    await queryInterface.removeColumn('requests', 'closed_by');
    await queryInterface.removeColumn('requests', 'issued_at');
    await queryInterface.removeColumn('requests', 'issued_by');
  }
};

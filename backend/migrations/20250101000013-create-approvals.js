'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('approvals', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      request_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'requests',
          key: 'id'
        }
      },
      level: {
        type: Sequelize.ENUM('DSE', 'PADIRI'),
        allowNull: false
      },
      reviewer_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      action: {
        type: Sequelize.ENUM('APPROVED', 'REJECTED', 'NEEDS_CHANGES'),
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('approvals', ['request_id', 'level'], {
      name: 'idx_appr_request'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('approvals');
  }
};

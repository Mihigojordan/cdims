'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('requests', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      ref_no: {
        type: Sequelize.STRING(50),
        unique: true
      },
      site_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'sites',
          key: 'id'
        }
      },
      budget_line_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'budget_lines',
          key: 'id'
        }
      },
      requested_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      status: {
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
        ),
        allowNull: false,
        defaultValue: 'DRAFT'
      },
      notes: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('requests', ['status'], {
      name: 'idx_req_status'
    });

    await queryInterface.addIndex('requests', ['site_id'], {
      name: 'idx_req_site'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('requests');
  }
};

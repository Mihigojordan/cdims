'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attachments', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      request_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'requests',
          key: 'id'
        }
      },
      doc_type: {
        type: Sequelize.ENUM('BOQ', 'PHOTO', 'PO', 'INVOICE', 'DELIVERY_NOTE', 'OTHER'),
        allowNull: false
      },
      file_path: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      uploaded_by: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('attachments');
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      entity: {
        type: Sequelize.STRING(50)
      },
      entity_id: {
        type: Sequelize.BIGINT
      },
      action: {
        type: Sequelize.STRING(50)
      },
      details: {
        type: Sequelize.JSON
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('audit_logs', ['entity', 'entity_id'], {
      name: 'idx_audit_entity'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('audit_logs');
  }
};

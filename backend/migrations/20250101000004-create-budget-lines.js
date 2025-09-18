'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('budget_lines', {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: Sequelize.STRING(50),
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      fiscal_year: {
        type: Sequelize.INTEGER,
        allowNull: false
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('budget_lines');
  }
};

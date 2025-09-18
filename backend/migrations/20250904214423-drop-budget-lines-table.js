'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, remove the foreign key constraint from requests table
    await queryInterface.removeColumn('requests', 'budget_line_id');
    
    // Then drop the budget_lines table
    await queryInterface.dropTable('budget_lines');
  },

  async down(queryInterface, Sequelize) {
    // Recreate the budget_lines table if needed to rollback
    await queryInterface.createTable('budget_lines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
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
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Re-add the foreign key column to requests table
    await queryInterface.addColumn('requests', 'budget_line_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'budget_lines',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  }
};

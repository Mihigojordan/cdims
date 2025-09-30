'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      // Postgres: extend enum type with raw SQL
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_approvals_action" ADD VALUE IF NOT EXISTS 'VERIFIED';
      `);
    } else if (dialect === 'mysql') {
      // MySQL: redefine column with new ENUM values
      await queryInterface.changeColumn('approvals', 'action', {
        type: Sequelize.ENUM('APPROVED', 'REJECTED', 'VERIFIED','MODIFIED'),
        allowNull: false,
      });
    } else {
      console.warn(`Dialect ${dialect} not specifically handled, skipping...`);
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === 'postgres') {
      // ⚠️ Postgres can't drop enum values directly
      console.warn('Down migration not supported for PostgreSQL ENUM removal');
    } else if (dialect === 'mysql') {
      // MySQL: revert to original ENUM
      await queryInterface.changeColumn('approvals', 'action', {
        type: Sequelize.ENUM('APPROVED', 'REJECTED','NEEDS_CHANGES'),
        allowNull: false,
      });
    }
  }
};

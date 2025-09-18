'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Only fix timestamps for tables that we know exist and have the columns
    const tablesToFix = [
      'sites', 'users', 'categories', 'units', 
      'materials', 'stores', 'stock', 
      'requests', 'request_items', 'suppliers', 'purchase_orders', 'purchase_order_items'
    ];

    for (const tableName of tablesToFix) {
      try {
        // Check if table exists
        const [results] = await queryInterface.sequelize.query(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = '${tableName}'`
        );
        
        if (results[0].count > 0) {
          // Check if created_at column exists
          const [createdAtResults] = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = '${tableName}' AND column_name = 'created_at'`
          );
          
          if (createdAtResults[0].count > 0) {
            await queryInterface.changeColumn(tableName, 'created_at', {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            });
          }

          // Check if updated_at column exists
          const [updatedAtResults] = await queryInterface.sequelize.query(
            `SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = '${tableName}' AND column_name = 'updated_at'`
          );
          
          if (updatedAtResults[0].count > 0) {
            await queryInterface.changeColumn(tableName, 'updated_at', {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            });
          }
        }
      } catch (error) {
        console.log(`Skipping ${tableName} due to error:`, error.message);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert changes if needed
    console.log('Reverting timestamp changes...');
  }
};

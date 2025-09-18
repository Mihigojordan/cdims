'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Update existing records with proper timestamps
    const tablesToUpdate = [
      'sites', 'users', 'categories', 'units', 
      'materials', 'stores', 'stock', 
      'requests', 'request_items', 'suppliers', 'purchase_orders', 'purchase_order_items'
    ];

    for (const tableName of tablesToUpdate) {
      try {
        // Check if table exists
        const [results] = await queryInterface.sequelize.query(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = '${tableName}'`
        );
        
        if (results[0].count > 0) {
          console.log(`Updating timestamps for table: ${tableName}`);
          
          // Update created_at for records with '0000-00-00 00:00:00'
          await queryInterface.sequelize.query(
            `UPDATE "${tableName}" SET created_at = CURRENT_TIMESTAMP WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL`
          );
          
          // Update updated_at for records with '0000-00-00 00:00:00'
          await queryInterface.sequelize.query(
            `UPDATE "${tableName}" SET updated_at = CURRENT_TIMESTAMP WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL`
          );
          
          console.log(`✅ Updated timestamps for ${tableName}`);
        }
      } catch (error) {
        console.log(`❌ Error updating ${tableName}:`, error.message);
      }
    }

    // Also update the models that have custom created_at fields
    const customTimestampTables = ['approvals', 'comments', 'attachments', 'stock_movements', 'audit_logs'];
    
    for (const tableName of customTimestampTables) {
      try {
        // Check if table exists
        const [results] = await queryInterface.sequelize.query(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = '${tableName}'`
        );
        
        if (results[0].count > 0) {
          console.log(`Updating custom timestamps for table: ${tableName}`);
          
          // Update created_at for records with '0000-00-00 00:00:00'
          await queryInterface.sequelize.query(
            `UPDATE "${tableName}" SET created_at = CURRENT_TIMESTAMP WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL`
          );
          
          console.log(`✅ Updated custom timestamps for ${tableName}`);
        }
      } catch (error) {
        console.log(`❌ Error updating ${tableName}:`, error.message);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // This migration is not easily reversible as we're updating data
    console.log('This migration updates existing data and cannot be easily reversed.');
  }
};

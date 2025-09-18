'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insert roles (ignore duplicates)
    await queryInterface.bulkInsert('roles', [
      { id: 1, name: 'ADMIN' },
      { id: 2, name: 'SITE_ENGINEER' },
      { id: 3, name: 'DIOCESAN_SITE_ENGINEER' },
      { id: 4, name: 'PADIRI' },
      { id: 5, name: 'STOREKEEPER' },
      { id: 6, name: 'PROCUREMENT' }
    ], { ignoreDuplicates: true });

    // Insert units (ignore duplicates)
    await queryInterface.bulkInsert('units', [
      { id: 1, code: 'pcs', name: 'Pieces' },
      { id: 2, code: 'm', name: 'Meters' },
      { id: 3, code: 'm2', name: 'Square Meters' },
      { id: 4, code: 'm3', name: 'Cubic Meters' },
      { id: 5, code: 'kg', name: 'Kilograms' },
      { id: 6, code: 'l', name: 'Liters' },
      { id: 7, code: 'bag', name: 'Bags' },
      { id: 8, code: 'box', name: 'Boxes' }
    ], { ignoreDuplicates: true });

    // Insert categories (ignore duplicates)
    await queryInterface.bulkInsert('categories', [
      { id: 1, name: 'Construction Materials', parent_id: null },
      { id: 2, name: 'Cement & Concrete', parent_id: 1 },
      { id: 3, name: 'Steel & Metal', parent_id: 1 },
      { id: 4, name: 'Wood & Timber', parent_id: 1 },
      { id: 5, name: 'Electrical', parent_id: null },
      { id: 6, name: 'Plumbing', parent_id: null },
      { id: 7, name: 'Tools & Equipment', parent_id: null }
    ], { ignoreDuplicates: true });

    // Insert sites (ignore duplicates)
    await queryInterface.bulkInsert('sites', [
      { id: 1, code: 'SITE-001', name: 'Cathedral Construction', location: 'Cyangugu Center' },
      { id: 2, code: 'SITE-002', name: 'School Building', location: 'Gihundwe' },
      { id: 3, code: 'SITE-003', name: 'Health Center', location: 'Kamembe' },
      { id: 4, code: 'SITE-004', name: 'Parish Hall', location: 'Nyamasheke' }
    ], { ignoreDuplicates: true });

    // Budget lines table removed - no longer needed

    // Insert stores (ignore duplicates)
    await queryInterface.bulkInsert('stores', [
      { id: 1, code: 'STORE-001', name: 'Main Store', location: 'Diocese Office' },
      { id: 2, code: 'STORE-002', name: 'Construction Store', location: 'Cathedral Site' },
      { id: 3, code: 'STORE-003', name: 'Tools Store', location: 'Workshop' }
    ], { ignoreDuplicates: true });

    // Insert suppliers (ignore duplicates)
    await queryInterface.bulkInsert('suppliers', [
      { id: 1, name: 'ABC Construction Ltd', contact: 'John Smith', phone: '+250123456789', email: 'contact@abcconstruction.com' },
      { id: 2, name: 'Rwanda Cement Company', contact: 'Marie Uwimana', phone: '+250987654321', email: 'sales@rwandacement.rw' },
      { id: 3, name: 'Steel Works Ltd', contact: 'Peter Nkurunziza', phone: '+250555123456', email: 'info@steelworks.rw' },
      { id: 4, name: 'Electrical Supplies Co', contact: 'Grace Mukamana', phone: '+250777888999', email: 'orders@electrical.rw' }
    ], { ignoreDuplicates: true });

    // Insert materials with unit prices (material_prices table removed) (ignore duplicates)
    await queryInterface.bulkInsert('materials', [
      { id: 1, code: 'CEM-001', name: 'Portland Cement 50kg', specification: 'Portland cement, 50kg bag', category_id: 2, unit_id: 7, unit_price: 8500.00, active: true },
      { id: 2, code: 'STE-001', name: 'Reinforcement Steel 12mm', specification: 'Reinforcement steel bar, 12mm diameter', category_id: 3, unit_id: 2, unit_price: 12000.00, active: true },
      { id: 3, code: 'STE-002', name: 'Reinforcement Steel 16mm', specification: 'Reinforcement steel bar, 16mm diameter', category_id: 3, unit_id: 2, unit_price: 15000.00, active: true },
      { id: 4, code: 'AGG-001', name: 'Coarse Aggregate', specification: 'Crushed stone aggregate, 20mm', category_id: 2, unit_id: 4, unit_price: 25000.00, active: true },
      { id: 5, code: 'SAND-001', name: 'Fine Sand', specification: 'River sand for construction', category_id: 2, unit_id: 4, unit_price: 20000.00, active: true },
      { id: 6, code: 'WIR-001', name: 'Electrical Wire 2.5mm', specification: 'Copper electrical wire, 2.5mm²', category_id: 5, unit_id: 2, unit_price: 800.00, active: true },
      { id: 7, code: 'PIP-001', name: 'PVC Pipe 50mm', specification: 'PVC water pipe, 50mm diameter', category_id: 6, unit_id: 2, unit_price: 1500.00, active: true },
      { id: 8, code: 'TOOL-001', name: 'Hammer', specification: 'Construction hammer, 1kg', category_id: 7, unit_id: 1, unit_price: 5000.00, active: true }
    ], { ignoreDuplicates: true });

    // Material prices table removed - prices now stored in materials table

    // Insert initial stock (ignore duplicates)
    await queryInterface.bulkInsert('stock', [
      { id: 1, store_id: 1, material_id: 1, qty_on_hand: 100.000, reorder_level: 20.000 },
      { id: 2, store_id: 1, material_id: 2, qty_on_hand: 50.000, reorder_level: 10.000 },
      { id: 3, store_id: 1, material_id: 3, qty_on_hand: 30.000, reorder_level: 5.000 },
      { id: 4, store_id: 1, material_id: 4, qty_on_hand: 200.000, reorder_level: 50.000 },
      { id: 5, store_id: 1, material_id: 5, qty_on_hand: 150.000, reorder_level: 30.000 },
      { id: 6, store_id: 2, material_id: 1, qty_on_hand: 50.000, reorder_level: 10.000 },
      { id: 7, store_id: 2, material_id: 2, qty_on_hand: 25.000, reorder_level: 5.000 },
      { id: 8, store_id: 3, material_id: 8, qty_on_hand: 10.000, reorder_level: 2.000 }
    ], { ignoreDuplicates: true });

    // Insert default admin user (password: admin123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await queryInterface.bulkInsert('users', [
      { 
        id: 1, 
        role_id: 1, 
        full_name: 'System Administrator', 
        email: 'admin@cdims.rw', 
        phone: '+250123456789', 
        password_hash: hashedPassword, 
        active: true 
      }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    // Delete in reverse order due to foreign key constraints
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('stock', null, {});
    await queryInterface.bulkDelete('materials', null, {});
    await queryInterface.bulkDelete('suppliers', null, {});
    await queryInterface.bulkDelete('stores', null, {});
    await queryInterface.bulkDelete('sites', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('units', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};

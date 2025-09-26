const { User, Role } = require('./models');

async function createSecureTestUsers() {
  try {
    console.log('Creating secure test users with forced password change...');
    
    // Get roles
    const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
    const siteEngineerRole = await Role.findOne({ where: { name: 'SITE_ENGINEER' } });
    const dseRole = await Role.findOne({ where: { name: 'DIOCESAN_SITE_ENGINEER' } });
    const padiriRole = await Role.findOne({ where: { name: 'PADIRI' } });
    const storekeeperRole = await Role.findOne({ where: { name: 'STOREKEEPER' } });
    const reportsRole = await Role.findOne({ where: { name: 'PROCUREMENT' } });
    
    // Create test users with security considerations
    const testUsers = [
      {
        role_id: adminRole.id,
        full_name: 'System Administrator',
        email: 'admin@cdims.rw',
        phone: '+250123456789',
        password_hash: 'admin123',  // Plain password - will be hashed by model hook
        active: true,
        first_login: false  // ADMIN can login normally without password change
      },
      {
        role_id: padiriRole.id,
        full_name: 'Padiri User',
        email: 'padiri@cdims.rw',
        phone: '+250123456790',
        password_hash: 'password123',  // Plain password - will be hashed by model hook
        active: true,
        first_login: false  // PADIRI can login normally without password change
      },
      {
        role_id: dseRole.id,
        full_name: 'Diocesan Site Engineer',
        email: 'dse@cdims.rw',
        phone: '+250123456791',
        password_hash: 'password123',  // Plain password - will be hashed by model hook
        active: true,
        first_login: true  // DSE must change password on first login
      },
      {
        role_id: siteEngineerRole.id,
        full_name: 'Site Engineer',
        email: 'site.engineer@cdims.rw',
        phone: '+250123456792',
        password_hash: 'password123',  // Plain password - will be hashed by model hook
        active: true,
        first_login: true  // SITE_ENGINEER must change password on first login
      },
      {
        role_id: storekeeperRole.id,
        full_name: 'Storekeeper',
        email: 'storekeeper@cdims.rw',
        phone: '+250123456793',
        password_hash: 'password123',  // Plain password - will be hashed by model hook
        active: true,
        first_login: true  // STOREKEEPER must change password on first login
      },
      {
        role_id: reportsRole.id,
        full_name: 'Reports User',
        email: 'reports@cdims.rw',
        phone: '+250123456794',
        password_hash: 'password123',  // Plain password - will be hashed by model hook
        active: true,
        first_login: true  // REPORTS must change password on first login
      }
    ];
    
    for (const userData of testUsers) {
      // Check if user exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (existingUser) {
        // Update existing user
        await existingUser.update(userData);
        console.log(`Updated user: ${userData.email} (first_login: ${userData.first_login})`);
      } else {
        // Create new user
        await User.create(userData);
        console.log(`Created user: ${userData.email} (first_login: ${userData.first_login})`);
      }
    }
    
    console.log('\n✅ Secure test users created/updated successfully!');
    console.log('\n🔐 TESTING CREDENTIALS:');
    console.log('1. ✅ ADMIN: admin@cdims.rw / admin123 (LOGIN NORMALLY)');
    console.log('2. ✅ PADIRI: padiri@cdims.rw / password123 (LOGIN NORMALLY)');
    console.log('3. 🔒 DSE: dse@cdims.rw / password123 (MUST CHANGE PASSWORD)');
    console.log('4. 🔒 SITE_ENGINEER: site.engineer@cdims.rw / password123 (MUST CHANGE PASSWORD)');
    console.log('5. 🔒 STOREKEEPER: storekeeper@cdims.rw / password123 (MUST CHANGE PASSWORD)');
    console.log('6. 🔒 REPORTS: reports@cdims.rw / password123 (MUST CHANGE PASSWORD)');
    console.log('\n⚠️  IMPORTANT: DSE, SITE_ENGINEER, STOREKEEPER, and REPORTS users MUST change their password on first login!');
    console.log('   They will be blocked from accessing the system until password is changed.');
    console.log('\n📖 See API_DOCUMENTATION.md for complete workflow instructions.');
    
  } catch (error) {
    console.error('Error creating secure test users:', error);
  }
}

createSecureTestUsers().then(() => {
  console.log('\nScript completed');
  process.exit(0);
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});

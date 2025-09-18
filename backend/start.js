#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting CDIMS Backend Setup...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please update the database credentials.\n');
  } else {
    console.log('⚠️  No .env file found. Please create one with your database credentials.\n');
  }
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully.\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Check if database is configured
console.log('🔍 Checking database configuration...');
try {
  require('dotenv').config();
  
  if (!process.env.DB_NAME || !process.env.DB_USER) {
    console.log('⚠️  Database configuration incomplete. Please update your .env file.');
    console.log('Required variables: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT\n');
  } else {
    console.log('✅ Database configuration found.\n');
  }
} catch (error) {
  console.log('⚠️  Could not load .env file:', error.message, '\n');
}

console.log('🎯 Next steps:');
console.log('1. Update your .env file with correct database credentials');
console.log('2. Create the MySQL database: CREATE DATABASE cdims;');
console.log('3. Run migrations: npm run migrate');
console.log('4. Seed initial data: npm run seed');
console.log('5. Start the server: npm run dev\n');

console.log('📚 Available commands:');
console.log('  npm run dev        - Start development server');
console.log('  npm run migrate    - Run database migrations');
console.log('  npm run seed       - Seed initial data');
console.log('  npm start          - Start production server\n');

console.log('🌐 Once started, the API will be available at:');
console.log('  http://localhost:3000');
console.log('  Health check: http://localhost:3000/health\n');

console.log('👤 Default admin credentials:');
console.log('  Email: admin@cdims.rw');
console.log('  Password: admin123\n');

console.log('Happy coding! 🎉');

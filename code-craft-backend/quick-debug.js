// Quick debug without TypeScript
console.log('=== Environment Debug ===');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

// Load .env manually
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '.env');
  console.log('Looking for .env at:', envPath);
  
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file found');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('Env file content:');
    console.log(envContent);
  } else {
    console.log('❌ .env file not found');
  }
} catch (error) {
  console.log('Error reading .env:', error.message);
}

// Check environment variables
require('dotenv').config();
console.log('\n=== Environment Variables ===');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'MISSING');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? `SET (${process.env.JWT_SECRET.length} chars)` : 'MISSING');
console.log('PORT:', process.env.PORT || 'default');
console.log('NODE_ENV:', process.env.NODE_ENV || 'default');

// Test JWT secret length
if (process.env.JWT_SECRET) {
  if (process.env.JWT_SECRET.length >= 32) {
    console.log('✅ JWT_SECRET length OK');
  } else {
    console.log('❌ JWT_SECRET too short:', process.env.JWT_SECRET.length, 'chars');
  }
}

console.log('\n=== Testing MongoDB Connection ===');
const mongoose = require('mongoose');
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      process.exit(0);
    })
    .catch(error => {
      console.log('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    });
} else {
  console.log('❌ No MONGODB_URI to test');
  process.exit(1);
}
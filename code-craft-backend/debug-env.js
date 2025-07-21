// Debug environment variables
require('dotenv').config();

console.log('Environment Variables Check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? `✅ Set (${process.env.JWT_SECRET.length} chars)` : '❌ Missing');
console.log('PORT:', process.env.PORT || 'Using default 3001');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Using default development');

// Test JWT_SECRET length
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.log('❌ JWT_SECRET too short! Must be at least 32 characters');
  console.log('Current length:', process.env.JWT_SECRET.length);
} else if (process.env.JWT_SECRET) {
  console.log('✅ JWT_SECRET length is sufficient');
}

// Test MongoDB connection
const mongoose = require('mongoose');
if (process.env.MONGODB_URI) {
  console.log('\nTesting MongoDB connection...');
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connection successful');
      process.exit(0);
    })
    .catch((error) => {
      console.log('❌ MongoDB connection failed:', error.message);
      process.exit(1);
    });
} else {
  console.log('❌ Cannot test MongoDB - MONGODB_URI missing');
}
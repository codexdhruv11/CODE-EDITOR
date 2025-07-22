const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

// Define a simple snippet schema for testing
const snippetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  description: String,
  language: { type: String, required: true },
  code: { type: String, required: true },
  userName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Snippet = mongoose.model('Snippet', snippetSchema);

async function testConnection() {
  try {
    console.log('Connecting to MongoDB...');
    console.log('URI:', MONGODB_URI.substring(0, 30) + '...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    // Test creating a snippet
    console.log('\nTesting snippet creation...');
    
    const testSnippet = new Snippet({
      userId: new mongoose.Types.ObjectId(),
      title: 'Test Snippet',
      description: 'This is a test',
      language: 'javascript',
      code: 'console.log("Hello World");',
      userName: 'Test User'
    });
    
    console.log('Created snippet instance:', testSnippet);
    
    // Try to save it
    const saved = await testSnippet.save();
    console.log('✅ Snippet saved successfully:', saved._id);
    
    // Clean up - delete the test snippet
    await Snippet.deleteOne({ _id: saved._id });
    console.log('✅ Test snippet cleaned up');
    
    // Check if any snippets exist
    const count = await Snippet.countDocuments();
    console.log(`\nTotal snippets in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testConnection();

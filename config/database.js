const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️  MONGODB_URI not provided. Running without database connection.');
      console.warn('📝 To connect to MongoDB, add MONGODB_URI to your .env file');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are deprecated in newer versions but keeping for compatibility
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('⚠️  Database connection failed:', error.message);
    console.warn('📝 Please check your MONGODB_URI in the .env file');
    console.warn('🚀 Server will continue running without database connection');
  }
};

module.exports = connectDB;

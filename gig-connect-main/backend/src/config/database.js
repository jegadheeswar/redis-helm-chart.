import mongoose from 'mongoose';
import { MONGO_URI } from '../utils/config.js'; // Assuming you have a config file reading .env

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process if connection fails
  }
};

export default connectDB;
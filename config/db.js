const mongoose = require('mongoose');

/**
 * @function connectDB
 * @description Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
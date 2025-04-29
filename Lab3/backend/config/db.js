const mongoose = require('mongoose');

/**
 * @function connectDB
 * @description Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/animal_care_system', {
    });
    console.log('Connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
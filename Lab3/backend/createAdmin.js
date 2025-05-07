const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = new User({
      username: process.env.ADMIN_NAME,
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('Admin added successfully:', admin.username);
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
};

const ensureAdminExists = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('No admins found. Creating default admin...');
      await createAdmin();
    }
  } catch (err) {
    console.error('Error checking admin existence:', err.message);
  }
};

module.exports = ensureAdminExists;
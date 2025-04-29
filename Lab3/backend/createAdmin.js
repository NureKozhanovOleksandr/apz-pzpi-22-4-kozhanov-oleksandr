const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.username);
      return;
    }

    const hashedPassword = await bcrypt.hash('12345678', 10);

    const admin = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    });

    await admin.save();
    console.log('Admin created successfully:', admin.username);
  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
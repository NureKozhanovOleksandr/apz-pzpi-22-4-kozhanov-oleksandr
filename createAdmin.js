const bcrypt = require('bcryptjs');
const User = require('./Models/User');

const ensureAdminExists = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('No admins found. Creating default admin...');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const admin = new User({
        username: process.env.ADMIN_NAME,
        password: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log('Admin added successfully:', admin.username);
    }
  } catch (err) {
    console.error('Error checking admin existence:', err.message);
  }
};

module.exports = ensureAdminExists;
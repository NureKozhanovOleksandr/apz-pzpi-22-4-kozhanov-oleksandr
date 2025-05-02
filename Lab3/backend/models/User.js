const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'owner'], required: true },
  email: { type: String },
  ownerData: {
    address: { type: String },
    animals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Animal' }]
  },
  vetData: {
    specialization: { type: String },
    contactInfo: { type: String }
  }
});

UserSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  const userId = this._id;

  try {
    if (this.role === 'owner') {
      await mongoose.model('Animal').deleteMany({ ownerId: userId });
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', UserSchema);
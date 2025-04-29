const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String },
  animals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Animal' }]
});

ownerSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const Animal = mongoose.model('Animal');
    await Animal.deleteMany({ ownerId: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

const Owner = mongoose.model('Owner', ownerSchema);
module.exports = Owner;

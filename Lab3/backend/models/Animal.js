const mongoose = require('mongoose');
const Owner = require('./Owner');

const animalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  breed: { type: String },
  age: { type: Number },
  weight: { type: Number },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
  lastVisit: { type: Date }
});

animalSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const owner = await Owner.findById(this.ownerId);
    if (owner) {
      owner.animals.pull(this._id);
      await owner.save();
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Animal = mongoose.model('Animal', animalSchema);
module.exports = Animal;

const mongoose = require('mongoose');
const User = require('./User');
const HealthRecord = require('./HealthRecord');

const animalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  breed: { type: String },
  age: { type: Number },
  weight: { type: Number },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastVisit: { type: Date },
  code: { type: Number, unique: true }
});

animalSchema.pre('save', async function (next) {
  if (!this.code) {
    let isUnique = false;
    while (!isUnique) {
      const generatedCode = Math.floor(100000 + Math.random() * 900000);
      const existingAnimal = await mongoose.model('Animal').findOne({ code: generatedCode });
      if (!existingAnimal) {
        this.code = generatedCode;
        isUnique = true;
      }
    }
  }
  next();
});

animalSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const owner = await User.findById(this.ownerId);
    if (owner && owner.role === 'owner' && owner.ownerData && Array.isArray(owner.ownerData.animals)) {
      owner.ownerData.animals.pull(this._id);
      await owner.save();
    }

    await HealthRecord.deleteMany({ animalId: this._id });

    next();
  } catch (err) {
    next(err);
  }
});

const Animal = mongoose.model('Animal', animalSchema);
module.exports = Animal;

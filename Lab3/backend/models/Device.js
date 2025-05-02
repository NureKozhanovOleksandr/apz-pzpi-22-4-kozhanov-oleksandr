const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  secret: {
    type: String,
    required: true
  },
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
    required: true
  }
});

module.exports = mongoose.model('Device', DeviceSchema);
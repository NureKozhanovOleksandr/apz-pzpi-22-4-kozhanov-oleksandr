const mongoose = require('mongoose');

const vetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  contactInfo: { type: String, required: true },
});

const Vet = mongoose.model('Vet', vetSchema);
module.exports = Vet;

const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date: { type: Date, required: true },
  diagnosis: { type: String, },
  treatment: { type: String },
  notes: { type: String },
  vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vet' },
  temperature: { type: Number },
  pulse: { type: Number },
  bloodSugar: { type: Number }
});

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
module.exports = HealthRecord;

const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date: { type: Date, required: true },
  vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vet' },
  temperature: { type: Number }
});

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
module.exports = HealthRecord;

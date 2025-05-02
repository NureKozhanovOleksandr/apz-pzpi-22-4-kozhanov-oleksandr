const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  animalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  vetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  reason: { type: String, required: true },
  diagnosis: { type: String, },
  treatment: { type: String },
  notes: { type: String },
  status: { type: String, required: true }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;

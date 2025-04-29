const express = require('express');
const router = express.Router();
const Appointment = require('../Models/Appointment');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route GET /api/appointments/all
 * @desc Get all appointments
 * @access Private (owner, vet)
 */
router.get('/all', authMiddleware, roleMiddleware(['owner', 'vet']), async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/appointments/:id
 * @desc Get appointment by ID
 * @access Private (owner, vet)
 */
router.get('/:id', authMiddleware, roleMiddleware(['owner', 'vet']), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /api/appointments/add
 * @desc Create a new appointment
 * @access Private (vet)
 */
router.post('/add', authMiddleware, roleMiddleware(['vet']), async (req, res) => {
  const appointment = new Appointment({
    animalId: req.body.animalId,
    vetId: req.body.vetId,
    date: req.body.date,
    reason: req.body.reason,
    status: req.body.status
  });

  try {
    await appointment.save();
    res.status(201).json({ message: 'Appointment added successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route DELETE /api/appointments/:id
 * @desc Delete an appointment
 * @access Private (vet)
 */
router.delete('/:id', authMiddleware, roleMiddleware(['vet']), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

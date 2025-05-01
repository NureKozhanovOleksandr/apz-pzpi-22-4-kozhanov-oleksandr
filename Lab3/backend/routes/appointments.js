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
router.get('/all', authMiddleware, roleMiddleware(['owner', 'admin']), async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('animalId', 'name')
      .populate('vetId', 'username');

    const transformedAppointments = appointments.map((appointment) => ({
      _id: appointment._id,
      animalName: appointment.animalId?.name || 'Unknown Animal',
      vetName: appointment.vetId?.username || 'Unknown Vet',
      date: appointment.date,
      reason: appointment.reason,
      diagnosis: appointment.diagnosis || '',
      treatment: appointment.treatment || '',
      notes: appointment.notes || '',
      status: appointment.status,
    }));

    res.json(transformedAppointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/appointments/:id
 * @desc Get appointment by ID
 * @access Private (owner, vet)
 */
router.get('/:id', authMiddleware, roleMiddleware(['owner', 'admin']), async (req, res) => {
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
 * @access Private (admin)
 */
router.post('/add', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
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
 * @access Private (admin)
 */
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route PUT /api/appointments/:id
 * @desc Edit an appointment
 * @access Private (admin)
 */
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { vetId, animalId, date, ...updateData } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ message: 'Appointment updated successfully', appointment: updatedAppointment });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

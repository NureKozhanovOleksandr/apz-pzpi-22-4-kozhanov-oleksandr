const express = require('express');
const router = express.Router();
const HealthRecord = require('../Models/HealthRecord');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route GET /api/healthrecords/all
 * @desc Get all health records
 * @access Private (owner, vet)
 */
router.get('/all', authMiddleware, roleMiddleware(['owner', 'vet']), async (req, res) => {
  try {
    const healthRecords = await HealthRecord.find();
    res.json(healthRecords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/healthrecords/:id
 * @desc Get health record by ID
 * @access Private (owner, vet)
 */
router.get('/:id', authMiddleware, roleMiddleware(['owner', 'vet']), async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id);
    if (!healthRecord) return res.status(404).json({ message: 'Health record not found' });
    res.json(healthRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /api/healthrecords/add
 * @desc Create a new health record
 * @access Private (vet)
 */
router.post('/add', authMiddleware, roleMiddleware(['vet']), async (req, res) => {
  const healthRecord = new HealthRecord({
    animalId: req.body.animalId,
    date: req.body.date,
    diagnosis: req.body.diagnosis,
    treatment: req.body.treatment,
    notes: req.body.notes,
    vetId: req.body.vetId,
    temperature: req.body.temperature,
    pulse: req.body.pulse,
    bloodSugar: req.body.bloodSugar
  });

  try {
    await healthRecord.save();
    res.status(201).json({ message: 'Health record added successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route PUT /api/healthrecords/:id
 * @desc Update a health record
 * @access Private (vet)
 */
router.put('/:id', authMiddleware, roleMiddleware(['vet']), async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!healthRecord) return res.status(404).json({ message: 'Health record not found' });
    res.json({ message: 'Health record updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route DELETE /api/healthrecords/:id
 * @desc Delete a health record
 * @access Private (vet)
 */
router.delete('/:id', authMiddleware, roleMiddleware(['vet']), async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id);
    if (!healthRecord) return res.status(404).json({ message: 'Health record not found' });

    await healthRecord.deleteOne();

    res.json({ message: 'Health record deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/healthrecords/check-critical/:animalId
 * @desc Check a critical health messages
 * @access Private (vet)
 */
router.get('/check-critical/:animalId', authMiddleware, roleMiddleware('vet'), async (req, res) => {
  try {
    const healthRecords = await HealthRecord.find({ animalId: req.params.animalId });
    const criticalMessages = [];

    healthRecords.forEach(record => {
      if (record.temperature > 39 || record.temperature < 36) {
        criticalMessages.push(`Critical temperature: ${record.temperature}°C on ${record.date}`);
      }
      if (record.pulse > 120 || record.pulse < 60) {
        criticalMessages.push(`Critical pulse: ${record.pulse} bpm on ${record.date}`);
      }
      if (record.bloodSugar > 140 || record.bloodSugar < 70) {
        criticalMessages.push(`Critical blood sugar: ${record.bloodSugar} mg/dL on ${record.date}`);
      }
    });

    res.json({ messages: criticalMessages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/healthrecords/temperature/average/:animalId
 * @desc Get average temperature for an animal
 * @access Private (owner, vet)
 */
router.get('/temperature/average/:animalId', authMiddleware, roleMiddleware(['owner', 'vet']), async (req, res) => {
  try {
    const healthRecords = await HealthRecord.find({ animalId: req.params.animalId });
    const temperatures = healthRecords.map(record => record.temperature);
    const average = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    res.json({ average });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/healthrecords/temperature/variance/:animalId
 * @desc Get temperature variance for an animal
 * @access Private (owner, vet)
 */
router.get('/temperature/variance/:animalId', authMiddleware, roleMiddleware(['owner', 'vet']), async (req, res) => {
  try {
    const healthRecords = await HealthRecord.find({ animalId: req.params.animalId });
    const temperatures = healthRecords.map(record => record.temperature);
    const mean = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;
    const variance = temperatures.reduce((sum, temp) => sum + Math.pow(temp - mean, 2), 0) / temperatures.length;
    res.json({ variance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

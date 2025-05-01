const express = require('express');
const router = express.Router();
const HealthRecord = require('../Models/HealthRecord');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route GET /api/healthrecords/all
 * @desc Get all health records
 * @access Private (admin)
 */
router.get('/all', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const healthRecords = await HealthRecord.find().populate('animalId', 'name');

    const transformedRecords = healthRecords.map((record) => ({
      _id: record._id,
      animalName: record.animalId?.name || 'Unknown Animal',
      date: record.date,
      temperature: record.temperature,
    }));

    res.json(transformedRecords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/healthrecords/:id
 * @desc Get health record by ID
 * @access Private (owner, admin)
 */
router.get('/:id', authMiddleware, roleMiddleware(['owner', 'admin']), async (req, res) => {
  try {
    const healthRecord = await HealthRecord.findById(req.params.id);
    if (!healthRecord) return res.status(404).json({ message: 'Health record not found' });
    res.json(healthRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route PUT /api/healthrecords/:id
 * @desc Update a health record
 * @access Private (admin)
 */
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
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
 * @access Private (admin)
 */
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
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
 * @access Private (admin)
 */
router.get('/check-critical/:animalId', authMiddleware, roleMiddleware('admin'), async (req, res) => {
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
 * @access Private (owner, admin)
 */
router.get('/temperature/average/:animalId', authMiddleware, roleMiddleware(['owner', 'admin']), async (req, res) => {
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
 * @access Private (owner, admin)
 */
router.get('/temperature/variance/:animalId', authMiddleware, roleMiddleware(['owner', 'admin']), async (req, res) => {
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

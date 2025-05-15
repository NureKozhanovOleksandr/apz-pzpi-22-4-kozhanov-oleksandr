const express = require('express');
const router = express.Router();
const HealthRecord = require('../Models/HealthRecord');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route GET /api/healthrecords/all
 * @desc Get all health records
 * @access Private (vet, admin)
 */
router.get('/all', authMiddleware, roleMiddleware(['admin', 'vet']), async (req, res) => {
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
 * @access Private (vet, admin)
 */
router.get('/:id', authMiddleware, roleMiddleware(['vet', 'admin']), async (req, res) => {
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
 * @access Private (admin)
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
    });

    res.json({ messages: criticalMessages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

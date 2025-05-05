const express = require('express');
const router = express.Router();
const HealthRecord = require('../Models/HealthRecord');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route POST /api/iot/temperature
 * @desc Save or update temperature data for an animal
 * @access Private (iot)
 */
router.post('/temperature', authMiddleware, roleMiddleware(['vet']), async (req, res) => {
  const { temperature, animalId } = req.body;

  try {
    await HealthRecord.findOneAndUpdate(
      { animalId },
      { 
        animalId, 
        date: new Date(),
        temperature 
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ message: 'Temperature data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving temperature data', error });
  }
});

module.exports = router;
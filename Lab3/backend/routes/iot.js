const express = require('express');
const router = express.Router();
const HealthRecord = require('../Models/HealthRecord');
const Device = require('../Models/Device');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route POST /api/iot/bind
 * @desc Bind a device to an animal
 * @access Private (admin)
 */
router.post('/bind', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { secret, animalId } = req.body;

  try {
    if (!animalId) {
      return res.status(400).json({ message: 'Animal ID is required' });
    }

    const device = new Device({ secret, animalId });
    await device.save();
    res.status(201).json({ message: 'Device bound to animal successfully', deviceId: device._id });
  } catch (error) {
    res.status(500).json({ message: 'Error binding device to animal', error });
  }
});

/**
 * @route POST /api/iot/temperature
 * @desc Save or update temperature data for an animal
 * @access Private (iot)
 */
router.post('/temperature', async (req, res) => {
  const { temperature, secret } = req.body;

  try {
    const device = await Device.findOne({ secret });
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }

    const animalId = device.animalId;

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

/**
 * @route GET /api/iot/animalId
 * @desc Get binded animalId for a device
 * @access Private (iot)
 */
router.get('/animalId', async (req, res) => {
  const { secret } = req.query;

  try {
    const device = await Device.findOne({ secret });
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.status(200).json({ animalId: device.animalId });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving animal ID', error });
  }
});

module.exports = router;
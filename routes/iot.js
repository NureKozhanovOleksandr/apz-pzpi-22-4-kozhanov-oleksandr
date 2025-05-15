const express = require('express');
const router = express.Router();
const HealthRecord = require('../Models/HealthRecord');
const Animal = require('../Models/Animal');
const User = require('../Models/User');
const bcrypt = require('bcryptjs');

/**
 * @route POST /api/iot/temperature
 * @desc Save or update temperature data for an animal
 * @access Private (vet)
 */
router.post('/temperature', async (req, res) => {
  const { temperature, code, vet_username, vet_password } = req.body;

  try {
    const vet = await User.findOne({ username: vet_username, role: 'vet' });
    if (!vet) {
      return res.status(404).json({ message: 'Vet not found' });
    }

    const isPasswordValid = await bcrypt.compare(vet_password, vet.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid vet credentials' });
    }

    const animal = await Animal.findOne({ code });
    if (!animal) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    await HealthRecord.findOneAndUpdate(
      { animalId: animal._id },
      {
        animalId: animal._id,
        date: new Date(),
        temperature,
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ message: 'Temperature data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving temperature data', error });
  }
});

module.exports = router;
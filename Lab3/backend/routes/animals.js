const express = require('express');
const router = express.Router();
const Animal = require('../Models/Animal');
const User = require('../Models/User');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route GET /api/animals/all
 * @desc Get all animals with owner username
 * @access Private (admin)
 */
router.get('/all', authMiddleware, roleMiddleware(['admin', 'owner']), async (req, res) => {
  try {
    const animals = await Animal.find().populate('ownerId', 'username');
    const transformedAnimals = animals.map((animal) => ({
      ...animal.toObject(),
      ownerUsername: animal.ownerId?.username || null,
    }));
    res.json(transformedAnimals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/animals/:id
 * @desc Get animal by ID with owner username
 * @access Private (owner, admin)
 */
router.get('/:id', authMiddleware, roleMiddleware(['owner', 'admin']), async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id).populate('ownerId', 'username');
    if (!animal) return res.status(404).json({ message: 'Animal not found' });

    const transformedAnimal = {
      ...animal.toObject(),
      ownerUsername: animal.ownerId?.username || null,
    };

    res.json(transformedAnimal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /api/animals/add
 * @desc Create a new animal
 * @access Private (admin)
 */
router.post('/add', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const owner = await User.findOne({ _id: req.body.ownerId, role: 'owner' });
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    const animal = new Animal({
      name: req.body.name,
      species: req.body.species,
      breed: req.body.breed,
      age: req.body.age,
      weight: req.body.weight,
      ownerId: owner._id,
      healthRecordsIds: req.body.healthRecordsIds,
      lastVisit: req.body.lastVisit,
    });

    const newAnimal = await animal.save();

    owner.ownerData.animals.push(newAnimal._id);
    await owner.save();

    res.status(201).json({ message: 'Animal added successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route PUT /api/animals/:id
 * @desc Update an animal
 * @access Private (admin)
 */
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { ownerId, ...updateData } = req.body;

    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ message: 'Animal not found' });

    if (ownerId && ownerId !== String(animal.ownerId)) {
      const oldOwner = await User.findById(animal.ownerId);
      if (oldOwner && oldOwner.ownerData && Array.isArray(oldOwner.ownerData.animals)) {
        oldOwner.ownerData.animals.pull(animal._id);
        await oldOwner.save();
      }

      const newOwner = await User.findById(ownerId);
      if (!newOwner || newOwner.role !== 'owner') {
        return res.status(404).json({ message: 'New owner not found or invalid role' });
      }

      if (newOwner.ownerData && Array.isArray(newOwner.ownerData.animals)) {
        newOwner.ownerData.animals.push(animal._id);
        await newOwner.save();
      }

      updateData.ownerId = ownerId;
    }

    const updatedAnimal = await Animal.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedAnimal) return res.status(404).json({ message: 'Animal not found after update' });

    res.json({ message: 'Animal updated successfully', animal: updatedAnimal });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route DELETE /api/animals/:id
 * @desc Delete an animal
 * @access Private (admin)
 */
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ message: 'Animal not found' });

    await animal.deleteOne();

    res.json({ message: 'Animal deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
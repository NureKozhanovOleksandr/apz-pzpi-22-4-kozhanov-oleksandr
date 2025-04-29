const express = require('express');
const router = express.Router();
const Animal = require('../Models/Animal');
const User = require('../Models/User');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route GET /api/animals/all
 * @desc Get all animals
 * @access Private (owner, vet)
 */
router.get('/all', authMiddleware, roleMiddleware(['owner', 'vet']), async (req, res) => {
  try {
    const animals = await Animal.find();
    res.json(animals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/animals/:id
 * @desc Get animal by ID
 * @access Private (owner, vet)
 */
router.get('/:id', authMiddleware, roleMiddleware(['owner', 'vet']), async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ message: 'Animal not found' });
    res.json(animal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /api/animals/add
 * @desc Create a new animal
 * @access Private (vet)
 */
router.post('/add', authMiddleware, roleMiddleware(['vet']), async (req, res) => {
  const animal = new Animal({
    name: req.body.name,
    species: req.body.species,
    breed: req.body.breed,
    age: req.body.age,
    weight: req.body.weight,
    ownerId: req.body.ownerId,
    healthRecordsIds: req.body.healthRecordsIds,
    lastVisit: req.body.lastVisit
  });

  try {
    const newAnimal = await animal.save();

    const owner = await User.findOne({ _id: req.body.ownerId, role: 'owner' });
    if (owner) {
      owner.ownerData.animals.push(newAnimal._id);
      await owner.save();
    }

    res.status(201).json({ message: 'Animal added successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route PUT /api/animals/:id
 * @desc Update an animal
 * @access Private (vet)
 */
router.put('/:id', authMiddleware, roleMiddleware(['vet']), async (req, res) => {
  try {
    const animal = await Animal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!animal) return res.status(404).json({ message: 'Animal not found' });
    res.json({ message: 'Animal updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route DELETE /api/animals/:id
 * @desc Delete an animal
 * @access Private (vet)
 */
router.delete('/:id', authMiddleware, roleMiddleware(['vet']), async (req, res) => {
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
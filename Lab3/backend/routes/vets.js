const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../Models/User');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route GET /api/vets/all
 * @desc Get all vets
 * @access Private (admin)
 */
router.get('/all', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const vets = await User.find({ role: 'admin' });
    if (vets.length === 1 && vets[0].username === 'admin') {
      return res.status(200).json([]);
    }
    vets.forEach(vet => {
      vet.ownerData = undefined;
      vet.__v = undefined;
    });
    res.json(vets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/vets/:id
 * @desc Get vet by ID
 * @access Private (admin)
 */
router.get('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const vet = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!vet) return res.status(404).json({ message: 'Vet not found' });
    res.json(vet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /api/vets/add
 * @desc Add a new vet
 * @access Private (admin)
 */
router.post('/add', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const { username, password, email, specialization, contactInfo } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newVet = new User({
      username,
      password: hashedPassword,
      email,
      role: 'admin',
      vetData: { specialization, contactInfo }
    });

    await newVet.save();
    res.status(201).json({ message: 'Vet added successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route PUT /api/vets/:id
 * @desc Update a vet
 * @access Private (admin)
 */
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const updatedVet = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'vet' },
      { ...req.body },
      { new: true }
    );
    if (!updatedVet) return res.status(404).json({ message: 'Vet not found' });
    res.json({ message: 'Vet updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route DELETE /api/vets/:id
 * @desc Delete a vet
 * @access Private (admin)
 */
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const vet = await User.findOne({ _id: req.params.id, role: 'admin' });
    if (!vet) return res.status(404).json({ message: 'Vet not found' });

    await vet.deleteOne();

    res.json({ message: 'Vet deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

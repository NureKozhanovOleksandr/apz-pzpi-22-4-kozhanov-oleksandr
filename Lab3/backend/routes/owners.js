const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../Models/User');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route GET /api/owners/all
 * @desc Get all owners
 * @access Private (admin, vet)
 */
router.get('/all', authMiddleware, roleMiddleware(['admin', 'vet']), async (req, res) => {
  try {
    const owners = await User.find({ role: 'owner' });
    res.json(owners);
    owners.forEach(owner => {
      owner.vetData = undefined;
      owner.__v = undefined;
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route GET /api/owners/:id
 * @desc Get owner by ID
 * @access Private (admin, vet)
 */
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'vet']), async (req, res) => {
  try {
    const owner = await User.findOne({ _id: req.params.id, role: 'owner' });
    if (!owner) return res.status(404).json({ message: 'Owner not found' });
    res.json(owner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /api/owners/add
 * @desc Create a new owner
 * @access Private (admin, vet)
 */
router.post('/add', authMiddleware, roleMiddleware(['admin', 'vet']), async (req, res) => {
  const { username, password, email, address } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newOwner = new User({
      username,
      password: hashedPassword,
      email,
      role: 'owner',
      ownerData: { address, animals: [] }
    });

    await newOwner.save();
    res.status(201).json({ message: 'Owner added successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route PUT /api/owners/:id
 * @desc Update an owner
 * @access Private (admin, vet)
 */
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'vet']), async (req, res) => {
  try {
    const { username, email, address } = req.body;

    const updatedOwner = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'owner' },
      { username, email, ownerData: { address } },
      { new: true }
    );
    if (!updatedOwner) return res.status(404).json({ message: 'Owner not found' });
    res.json({ message: 'Owner updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route DELETE /api/owners/:id
 * @desc Delete an owner
 * @access Private (admin, vet)
 */
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'vet']), async (req, res) => {
  try {
    const owner = await User.findOne({ _id: req.params.id, role: 'owner' });
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    await owner.deleteOne();

    res.json({ message: 'Owner deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Owner = require('../Models/Owner');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route GET /api/owners/all
 * @desc Get all owners
 * @access Private (admin, vet)
 */
router.get('/all', authMiddleware, roleMiddleware(['admin', 'vet']), async (req, res) => {
  try {
    const owners = await Owner.find();
    res.json(owners);
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
    const owner = await Owner.findById(req.params.id);
    if (!owner) return res.status(404).json({ message: 'Owner not found' });
    res.json(owner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route POST /api/owners/add
 * @desc Create a new owner
 * @access Private (admin)
 */
router.post('/add', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  const owner = new Owner({
    name: req.body.name,
    email: req.body.email,
    address: req.body.address,
    animals: []
  });

  try {
    await owner.save();
    res.status(201).json({ message: 'Owner added successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route PUT /api/owners/:id
 * @desc Update an owner
 * @access Private (admin)
 */
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const owner = await Owner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!owner) return res.status(404).json({ message: 'Owner not found' });
    res.json({ message: 'Owner updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @route DELETE /api/owners/:id
 * @desc Delete an owner
 * @access Private (admin)
 */
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id);
    if (!owner) return res.status(404).json({ message: 'Owner not found' });

    await owner.deleteOne();

    res.json({ message: 'Owner deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

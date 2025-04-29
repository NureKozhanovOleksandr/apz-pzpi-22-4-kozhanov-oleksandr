const express = require('express');
const router = express.Router();
const Vet = require('../Models/Vet');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @route GET /api/vets/all
 * @desc Get all vets
 * @access Private (admin)
 */
router.get('/all', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const vets = await Vet.find();
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
router.get('/:id', authMiddleware, roleMiddleware(['admin']),  async (req, res) => {
  try {
    const vet = await Vet.findById(req.params.id);
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
router.post('/add', authMiddleware, roleMiddleware(['admin']),  async (req, res) => {
  const vet = new Vet({
    name: req.body.name,
    specialization: req.body.specialization,
    contactInfo: req.body.contactInfo
  });

  try {
    await vet.save();
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
router.put('/:id', authMiddleware, roleMiddleware(['admin']),  async (req, res) => {
  try {
    const vet = await Vet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vet) return res.status(404).json({ message: 'Vet not found' });
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
router.delete('/:id', authMiddleware, roleMiddleware(['admin']),  async (req, res) => {
  try {
    const vet = await Vet.findByIdAndDelete(req.params.id);
    if (!vet) return res.status(404).json({ message: 'Vet not found' });
    res.json({ message: 'Vet deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

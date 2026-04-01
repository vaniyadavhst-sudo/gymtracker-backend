const express = require('express');
const Workout = require('../models/Workout');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Sab workouts lao
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = { user: req.user._id };

    if (search) {
      query.exercise = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const workouts = await Workout.find(query).sort({ createdAt: -1 });
    res.json({ workouts });
  } catch (error) {
    res.status(500).json({ message: 'Workouts nahi mile', error: error.message });
  }
});

// Stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;
    const totalWorkouts = await Workout.countDocuments({ user: userId });
    const uniqueExercises = await Workout.distinct('exercise', { user: userId });

    const volumeResult = await Workout.aggregate([
      { $match: { user: userId } },
      { $group: {
          _id: null,
          totalVolume: { $sum: { $multiply: ['$sets', '$reps', '$weight'] } }
      }}
    ]);

    const categoryBreakdown = await Workout.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalWorkouts,
      uniqueExercises: uniqueExercises.length,
      totalVolume: Math.round(volumeResult[0]?.totalVolume || 0),
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: 'Stats nahi mile', error: error.message });
  }
});

// Naya workout add karo
router.post('/', async (req, res) => {
  try {
    const { exercise, sets, reps, weight, notes, category } = req.body;

    if (!exercise || !reps || weight === undefined) {
      return res.status(400).json({ message: 'Exercise, reps aur weight zaroori hain' });
    }

    const workout = await Workout.create({
      user: req.user._id,
      exercise,
      sets: sets || 1,
      reps,
      weight,
      notes: notes || '',
      category: category || 'Other',
    });

    res.status(201).json(workout);
  } catch (error) {
    res.status(400).json({ message: 'Workout save nahi hua', error: error.message });
  }
});

// Workout delete karo
router.delete('/:id', async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: 'Workout nahi mila' });
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Allowed nahi hai' });
    }

    await workout.deleteOne();
    res.json({ message: 'Workout delete ho gaya', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Delete nahi hua', error: error.message });
  }
});

module.exports = router;
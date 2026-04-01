const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exercise: {
    type: String,
    required: [true, 'Exercise ka naam zaroori hai'],
    trim: true,
  },
  sets: {
    type: Number,
    default: 1,
    min: 1,
  },
  reps: {
    type: Number,
    required: [true, 'Reps zaroori hain'],
    min: 1,
  },
  weight: {
    type: Number,
    required: [true, 'Weight zaroori hai'],
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  category: {
    type: String,
    enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Other'],
    default: 'Other',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Workout', workoutSchema);
const mongoose = require('mongoose');

const exerciseEntrySchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false },
);

const workoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    exercises: {
      type: [exerciseEntrySchema],
      default: [],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);

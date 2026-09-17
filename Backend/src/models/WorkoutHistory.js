const mongoose = require('mongoose');

const workoutExerciseEntrySchema = new mongoose.Schema(
  {
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      default: null,
    },
    exerciseName: {
      type: String,
      trim: true,
      default: '',
    },
    completed: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const workoutHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    workoutPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
      default: null,
    },
    workoutName: {
      type: String,
      required: [true, 'Workout name is required'],
      trim: true,
      maxlength: 200,
    },
    exercises: {
      type: [workoutExerciseEntrySchema],
      default: [],
    },
    totalExercises: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    completedExercises: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
);

workoutHistorySchema.index({ user: 1, completedAt: -1 });

module.exports = mongoose.model('WorkoutHistory', workoutHistorySchema);

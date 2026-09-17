const mongoose = require('mongoose');

const relatedExerciseSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const exerciseSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  cover: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  difficulty: {
    type: String,
    required: true,
    trim: true,
  },
  primaryMuscles: {
    type: [String],
    required: true,
  },
  secondaryMuscles: {
    type: [String],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  benefits: {
    type: [String],
    required: true,
  },
  commonMistakes: {
    type: [String],
    required: true,
  },
  instructions: {
    type: [String],
    required: true,
  },
  tips: {
    type: String,
    required: true,
    trim: true,
  },
  correctForm: {
    type: [String],
    required: true,
  },
  relatedExercises: {
    type: [relatedExerciseSchema],
    required: true,
  },
  video: {
    type: String,
    default: null,
  },
  model3D: {
    type: String,
    default: null,
  },
  audio: {
    type: String,
    default: null,
  },
  duration: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Exercise', exerciseSchema);

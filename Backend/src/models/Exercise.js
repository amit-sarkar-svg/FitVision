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

const mediaSchema = new mongoose.Schema(
  {
    coverImage: { type: String, default: null },
    targetMusclesImage: { type: String, default: null },
    videos: {
      front: { type: String, default: null },
      side: { type: String, default: null },
      top: { type: String, default: null },
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
  equipment: {
    type: String,
    default: '',
    trim: true,
  },
  primaryMuscles: {
    type: [String],
    default: [],
  },
  secondaryMuscles: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  benefits: {
    type: [String],
    default: [],
  },
  commonMistakes: {
    type: [String],
    default: [],
  },
  instructions: {
    type: [String],
    default: [],
  },
  tips: {
    type: String,
    default: '',
    trim: true,
  },
  correctForm: {
    type: [String],
    default: [],
  },
  relatedExercises: {
    type: [relatedExerciseSchema],
    default: [],
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
  media: {
    type: mediaSchema,
    default: () => ({}),
  },
  duration: {
    type: Number,
    default: 18,
  },
}, { timestamps: true });

module.exports = mongoose.model('Exercise', exerciseSchema);

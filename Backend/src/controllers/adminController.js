const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const { safeUser } = require('../utils/auth');

const uploadRoot = path.resolve(__dirname, '../../uploads/exercises');
const parseArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return String(value)
      .split(/\r?\n|\\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
};

const parseRelatedExercises = (value) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const slugify = (value) => String(value).toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const mediaFromFiles = (files, currentMedia = {}) => {
  const fileUrl = (field) => files?.[field]?.[0]?.url;
  return {
    coverImage: fileUrl('coverImage') || currentMedia.coverImage || null,
    targetMusclesImage: fileUrl('targetMusclesImage') || currentMedia.targetMusclesImage || null,
    videos: {
      front: fileUrl('frontVideo') || currentMedia.videos?.front || null,
      side: fileUrl('sideVideo') || currentMedia.videos?.side || null,
      top: fileUrl('topVideo') || currentMedia.videos?.top || null,
    },
  };
};

const exerciseDataFromRequest = (body, files, currentExercise) => {
  const media = mediaFromFiles(files, currentExercise?.media);
  const name = String(body.name || currentExercise?.name || '').trim();
  return {
    ...(currentExercise ? {} : { id: slugify(body.id || name) }),
    name,
    description: String(body.description || currentExercise?.description || '').trim(),
    category: String(body.category || currentExercise?.category || 'General').trim(),
    difficulty: String(body.difficulty || currentExercise?.difficulty || 'All Levels').trim(),
    equipment: String(body.equipment || currentExercise?.equipment || '').trim(),
    primaryMuscles: parseArray(body.primaryMuscles || currentExercise?.primaryMuscles),
    secondaryMuscles: parseArray(body.secondaryMuscles || currentExercise?.secondaryMuscles),
    instructions: parseArray(body.instructions || currentExercise?.instructions),
    tips: String(body.tips ?? currentExercise?.tips ?? '').trim(),
    benefits: parseArray(body.benefits || currentExercise?.benefits),
    commonMistakes: parseArray(body.commonMistakes || currentExercise?.commonMistakes),
    correctForm: parseArray(body.correctForm || currentExercise?.correctForm),
    relatedExercises: body.relatedExercises !== undefined
      ? parseRelatedExercises(body.relatedExercises)
      : currentExercise?.relatedExercises || [],
    duration: Number(body.duration || currentExercise?.duration || 18),
    media,
    cover: media.coverImage || currentExercise?.cover || null,
  };
};

const validateExercise = (exercise) => {
  if (!exercise.id || !exercise.name || !exercise.description) return 'Exercise name and description are required.';
  if (!Number.isFinite(exercise.duration) || exercise.duration <= 0) return 'Duration must be a positive number.';
  return null;
};

const listExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    return res.status(200).json({ success: true, data: exercises });
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to retrieve exercises.' });
  }
};

const createExercise = async (req, res) => {
  const exerciseData = exerciseDataFromRequest(req.body, req.files);
  const validationError = validateExercise(exerciseData);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  try {
    const exercise = await Exercise.create(exerciseData);
    return res.status(201).json({ success: true, data: exercise });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'An exercise with this identifier already exists.' });
    return res.status(400).json({ success: false, message: 'Unable to create exercise.' });
  }
};

const updateExercise = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid exercise ID.' });
  try {
    const exercise = await Exercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found.' });
    const exerciseData = exerciseDataFromRequest(req.body, req.files, exercise);
    const validationError = validateExercise({ ...exerciseData, id: exercise.id });
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    Object.assign(exercise, exerciseData);
    await exercise.save();
    return res.status(200).json({ success: true, data: exercise });
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to update exercise.' });
  }
};

const removeExerciseMedia = async (exercise) => {
  const urls = [
    exercise.media?.coverImage,
    exercise.media?.targetMusclesImage,
    ...Object.values(exercise.media?.videos || {}),
  ].filter(Boolean);
  const folders = new Set(urls.filter((url) => url.startsWith('/uploads/exercises/')).map((url) =>
    path.resolve(uploadRoot, path.dirname(url.replace('/uploads/exercises/', ''))),
  ));
  await Promise.all([...folders].map((folder) => {
    if (folder === uploadRoot || !folder.startsWith(`${uploadRoot}${path.sep}`)) return null;
    return fs.rm(folder, { recursive: true, force: true });
  }));
};

const deleteExercise = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid exercise ID.' });
  try {
    const exercise = await Exercise.findByIdAndDelete(req.params.id);
    if (!exercise) return res.status(404).json({ success: false, message: 'Exercise not found.' });
    await removeExerciseMedia(exercise);
    await Favorite.deleteMany({ exercise: exercise._id });
    return res.status(200).json({ success: true, message: 'Exercise deleted.' });
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to delete exercise.' });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users.map(safeUser) });
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to retrieve users.' });
  }
};

module.exports = { listExercises, createExercise, updateExercise, deleteExercise, listUsers };

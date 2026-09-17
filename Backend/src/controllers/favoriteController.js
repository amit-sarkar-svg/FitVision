const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Exercise = require('../models/Exercise');

/**
 * Helper: serialise a populated favorite document.
 */
function serialiseFavorite(favDoc) {
  const ex = favDoc.exercise;
  if (!ex) return null;

  return {
    _id: favDoc._id.toString(),
    user: favDoc.user.toString(),
    createdAt: favDoc.createdAt,
    updatedAt: favDoc.updatedAt,
    exercise: {
      _id: ex._id.toString(),
      id: ex.id || ex._id.toString(),
      name: ex.name,
      category: ex.category,
      difficulty: ex.difficulty,
      description: ex.description || '',
      cover: ex.cover || null,
      media: ex.media || {},
      primaryMuscles: ex.primaryMuscles || [],
      secondaryMuscles: ex.secondaryMuscles || [],
    },
  };
}

// GET /api/favorites
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('exercise');

    const validFavorites = favorites.map(serialiseFavorite).filter(Boolean);

    return res.json({ success: true, data: validFavorites });
  } catch (error) {
    return next(error);
  }
};

// POST /api/favorites/:exerciseId
const addFavorite = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;

    if (!exerciseId) {
      return res.status(400).json({ success: false, message: 'exerciseId is required.' });
    }

    // Resolve exercise by ObjectId or slug id
    let exercise = null;
    if (mongoose.isValidObjectId(exerciseId)) {
      exercise = await Exercise.findById(exerciseId);
    }
    if (!exercise) {
      exercise = await Exercise.findOne({ id: exerciseId });
    }

    if (!exercise) {
      return res.status(404).json({ success: false, message: 'Exercise not found.' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      user: req.user.id,
      exercise: exercise._id,
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Exercise is already in your favorites.' });
    }

    const favorite = await Favorite.create({
      user: req.user.id,
      exercise: exercise._id,
    });

    await favorite.populate('exercise');
    const serialised = serialiseFavorite(favorite);

    return res.status(201).json({ success: true, data: serialised });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Exercise is already in your favorites.' });
    }
    return next(error);
  }
};

// DELETE /api/favorites/:exerciseId
const removeFavorite = async (req, res, next) => {
  try {
    const { exerciseId } = req.params;

    if (!exerciseId) {
      return res.status(400).json({ success: false, message: 'exerciseId is required.' });
    }

    // Resolve exerciseId to an ObjectId
    let exerciseObjectId = exerciseId;
    if (!mongoose.isValidObjectId(exerciseId)) {
      const exercise = await Exercise.findOne({ id: exerciseId }).select('_id');
      if (!exercise) {
        return res.status(404).json({ success: false, message: 'Exercise not found.' });
      }
      exerciseObjectId = exercise._id;
    }

    const deleted = await Favorite.findOneAndDelete({
      user: req.user.id,
      exercise: exerciseObjectId,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Favorite not found.' });
    }

    return res.json({ success: true, message: 'Exercise removed from favorites.' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
};

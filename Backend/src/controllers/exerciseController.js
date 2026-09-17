const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');

const getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();

    res.status(200).json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve exercises.',
    });
  }
};

const getExerciseById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid exercise ID.',
    });
  }

  try {
    const exercise = await Exercise.findById(id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: exercise,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve exercise.',
    });
  }
};

module.exports = {
  getExercises,
  getExerciseById,
};

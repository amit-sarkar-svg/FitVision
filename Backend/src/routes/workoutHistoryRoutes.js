const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getWorkoutHistory,
  createWorkoutHistory,
  getWorkoutHistoryById,
  deleteWorkoutHistory,
} = require('../controllers/workoutHistoryController');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWorkoutHistory)
  .post(createWorkoutHistory);

router.route('/:id')
  .get(getWorkoutHistoryById)
  .delete(deleteWorkoutHistory);

module.exports = router;

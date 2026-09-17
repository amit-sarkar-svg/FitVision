const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getProgress } = require('../controllers/workoutHistoryController');

const router = express.Router();

router.use(protect);

router.get('/', getProgress);

module.exports = router;

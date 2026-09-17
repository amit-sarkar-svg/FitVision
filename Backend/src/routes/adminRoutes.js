const express = require('express');
const mongoose = require('mongoose');
const { listExercises, createExercise, updateExercise, deleteExercise, listUsers } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { exerciseUpload, attachUploadedUrls } = require('../middleware/uploadMiddleware');

const router = express.Router();
const validateExerciseId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid exercise ID.' });
  }
  return next();
};

router.use(protect, requireAdmin);
router.get('/exercises', listExercises);
router.post('/exercises', exerciseUpload, attachUploadedUrls, createExercise);
router.put('/exercises/:id', validateExerciseId, exerciseUpload, attachUploadedUrls, updateExercise);
router.delete('/exercises/:id', deleteExercise);
router.get('/users', listUsers);

module.exports = router;

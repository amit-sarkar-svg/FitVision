const express = require('express');
const cors = require('cors');
const multer = require('multer');
const exerciseRoutes = require('./routes/exerciseRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const workoutPlanRoutes = require('./routes/workoutPlanRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const workoutHistoryRoutes = require('./routes/workoutHistoryRoutes');
const progressRoutes = require('./routes/progressRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FitVision backend is running',
  });
});

app.use('/api/exercises', exerciseRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/workout-plans', workoutPlanRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/workout-history', workoutHistoryRoutes);
app.use('/api/progress', progressRoutes);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Each uploaded file must be 50 MB or smaller.'
      : 'Invalid upload. Use image files for cover and target muscles, and MP4, WebM, or MOV videos.';
    return res.status(400).json({ success: false, message });
  }
  return res.status(500).json({ success: false, message: 'An unexpected server error occurred.' });
});

module.exports = app;

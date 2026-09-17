const express = require('express');
const cors = require('cors');
const exerciseRoutes = require('./routes/exerciseRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FitVision backend is running',
  });
});

app.use('/api/exercises', exerciseRoutes);

module.exports = app;

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/favoriteController');

const router = express.Router();

// All favorites routes require authentication
router.use(protect);

router.get('/', getFavorites);
router.post('/:exerciseId', addFavorite);
router.delete('/:exerciseId', removeFavorite);

module.exports = router;

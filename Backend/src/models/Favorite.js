const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
  },
  { timestamps: true },
);

// Compound unique index ensuring a user cannot favorite the same exercise twice
favoriteSchema.index({ user: 1, exercise: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);

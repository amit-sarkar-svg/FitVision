const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getPlans,
  createPlan,
  getPlanById,
  updatePlan,
  deletePlan,
  addExerciseToPlan,
  removeExerciseFromPlan,
} = require('../controllers/workoutPlanController');

const router = express.Router();

// All workout-plan routes require authentication
router.use(protect);

router.get('/', getPlans);
router.post('/', createPlan);
router.get('/:id', getPlanById);
router.put('/:id', updatePlan);
router.delete('/:id', deletePlan);

router.post('/:id/exercises', addExerciseToPlan);
router.delete('/:id/exercises/:exerciseId', removeExerciseFromPlan);

module.exports = router;

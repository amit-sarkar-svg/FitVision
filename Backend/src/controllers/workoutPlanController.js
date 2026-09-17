const mongoose = require('mongoose');
const WorkoutPlan = require('../models/WorkoutPlan');
const Exercise = require('../models/Exercise');

/**
 * Helper: populate & serialise a plan document into the shape the
 * frontend expects.  exercise entries become flat objects identical to
 * what workoutStorage.js used to produce.
 */
async function populateAndSerialise(planDoc) {
  await planDoc.populate({
    path: 'exercises.exercise',
    model: 'Exercise',
    select: 'id name category difficulty cover primaryMuscles secondaryMuscles media',
  });

  return serialisePlan(planDoc);
}

function serialisePlan(planDoc) {
  const exercises = planDoc.exercises.map((entry) => {
    const ex = entry.exercise;
    if (!ex) return null;
    return {
      id: ex.id || ex._id.toString(),
      _id: ex._id.toString(),
      name: ex.name,
      category: ex.category,
      difficulty: ex.difficulty,
      cover: ex.cover || null,
      media: ex.media || {},
      primaryMuscles: ex.primaryMuscles || [],
      secondaryMuscles: ex.secondaryMuscles || [],
    };
  }).filter(Boolean);

  return {
    id: planDoc._id.toString(),
    _id: planDoc._id.toString(),
    name: planDoc.name,
    description: planDoc.description || '',
    exercises,
    createdAt: planDoc.createdAt,
    updatedAt: planDoc.updatedAt,
  };
}

// GET /api/workout-plans
const getPlans = async (req, res, next) => {
  try {
    const plans = await WorkoutPlan.find({ user: req.user.id }).sort({ createdAt: -1 });

    const populated = await Promise.all(plans.map((p) => populateAndSerialise(p)));

    return res.json({ success: true, data: populated });
  } catch (error) {
    return next(error);
  }
};

// POST /api/workout-plans
const createPlan = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Plan name is required.' });
    }

    const plan = await WorkoutPlan.create({
      user: req.user.id,
      name: name.trim(),
      description: (description || '').trim(),
    });

    const serialised = await populateAndSerialise(plan);

    return res.status(201).json({ success: true, data: serialised });
  } catch (error) {
    return next(error);
  }
};

// GET /api/workout-plans/:id
const getPlanById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    const plan = await WorkoutPlan.findOne({ _id: req.params.id, user: req.user.id });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    const serialised = await populateAndSerialise(plan);

    return res.json({ success: true, data: serialised });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/workout-plans/:id
const updatePlan = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    const plan = await WorkoutPlan.findOne({ _id: req.params.id, user: req.user.id });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    const { name, description } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: 'Plan name cannot be empty.' });
      }
      plan.name = name.trim();
    }

    if (description !== undefined) {
      plan.description = description.trim();
    }

    await plan.save();

    const serialised = await populateAndSerialise(plan);

    return res.json({ success: true, data: serialised });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/workout-plans/:id
const deletePlan = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    const plan = await WorkoutPlan.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    return res.json({ success: true, message: 'Workout plan deleted.' });
  } catch (error) {
    return next(error);
  }
};

// POST /api/workout-plans/:id/exercises
const addExerciseToPlan = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    const { exerciseId, exerciseIds } = req.body;
    const rawIds = Array.isArray(exerciseIds) ? exerciseIds : (exerciseId ? [exerciseId] : []);

    if (rawIds.length === 0) {
      return res.status(400).json({ success: false, message: 'exerciseId or exerciseIds is required.' });
    }

    const plan = await WorkoutPlan.findOne({ _id: req.params.id, user: req.user.id });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    // Single exercise mode: preserve strict 409 duplicate check
    if (!Array.isArray(exerciseIds)) {
      const singleId = rawIds[0];
      let exercise = null;
      if (mongoose.isValidObjectId(singleId)) {
        exercise = await Exercise.findById(singleId);
      }
      if (!exercise) {
        exercise = await Exercise.findOne({ id: singleId });
      }

      if (!exercise) {
        return res.status(404).json({ success: false, message: 'Exercise not found.' });
      }

      const alreadyAdded = plan.exercises.some(
        (entry) => entry.exercise.toString() === exercise._id.toString(),
      );
      if (alreadyAdded) {
        return res.status(409).json({ success: false, message: 'Exercise is already in this plan.' });
      }

      const order = plan.exercises.length;
      plan.exercises.push({ exercise: exercise._id, order });
      await plan.save();

      const serialised = await populateAndSerialise(plan);
      return res.status(201).json({ success: true, data: serialised });
    }

    // Batch mode: add multiple exercises in sequence
    let addedCount = 0;
    for (const exId of rawIds) {
      let exercise = null;
      if (mongoose.isValidObjectId(exId)) {
        exercise = await Exercise.findById(exId);
      }
      if (!exercise) {
        exercise = await Exercise.findOne({ id: exId });
      }
      if (!exercise) continue;

      const alreadyAdded = plan.exercises.some(
        (entry) => entry.exercise.toString() === exercise._id.toString(),
      );
      if (alreadyAdded) continue;

      plan.exercises.push({ exercise: exercise._id, order: plan.exercises.length });
      addedCount++;
    }

    if (addedCount > 0) {
      await plan.save();
    }

    const serialised = await populateAndSerialise(plan);
    return res.status(201).json({ success: true, data: serialised });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/workout-plans/:id/exercises/:exerciseId
const removeExerciseFromPlan = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    const plan = await WorkoutPlan.findOne({ _id: req.params.id, user: req.user.id });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found.' });
    }

    // exerciseId can be a Mongo _id OR the string `id` slug field
    const { exerciseId } = req.params;
    const beforeLength = plan.exercises.length;

    // Resolve the exerciseId: it might be an ObjectId string or a slug
    let resolvedObjectIds = [exerciseId];
    if (!mongoose.isValidObjectId(exerciseId)) {
      // It's a slug — look up the exercise to get its ObjectId
      const exercise = await Exercise.findOne({ id: exerciseId }).select('_id');
      if (exercise) {
        resolvedObjectIds = [exercise._id.toString()];
      }
    }

    plan.exercises = plan.exercises.filter(
      (entry) => !resolvedObjectIds.includes(entry.exercise.toString()),
    );

    if (plan.exercises.length === beforeLength) {
      return res.status(404).json({ success: false, message: 'Exercise not found in this plan.' });
    }

    // Re-index order
    plan.exercises.forEach((entry, i) => { entry.order = i; });

    await plan.save();

    const serialised = await populateAndSerialise(plan);

    return res.json({ success: true, data: serialised });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPlans,
  createPlan,
  getPlanById,
  updatePlan,
  deletePlan,
  addExerciseToPlan,
  removeExerciseFromPlan,
};

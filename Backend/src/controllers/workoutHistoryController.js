const mongoose = require('mongoose');
const WorkoutHistory = require('../models/WorkoutHistory');
const WorkoutPlan = require('../models/WorkoutPlan');
const Exercise = require('../models/Exercise');

/**
 * Helper: serialise a populated WorkoutHistory document.
 */
function serialiseHistory(historyDoc) {
  if (!historyDoc) return null;

  const planId = historyDoc.workoutPlan
    ? (historyDoc.workoutPlan._id ? historyDoc.workoutPlan._id.toString() : historyDoc.workoutPlan.toString())
    : null;

  const exercises = (historyDoc.exercises || []).map((entry) => {
    const ex = entry.exercise;
    return {
      exercise: ex && ex._id
        ? {
            _id: ex._id.toString(),
            id: ex.id || ex._id.toString(),
            name: ex.name,
            category: ex.category,
            difficulty: ex.difficulty,
            cover: ex.cover || null,
            media: ex.media || {},
          }
        : null,
      exerciseName: entry.exerciseName || (ex ? ex.name : ''),
      completed: Boolean(entry.completed),
    };
  });

  return {
    id: historyDoc._id.toString(),
    _id: historyDoc._id.toString(),
    user: historyDoc.user ? historyDoc.user.toString() : null,
    planId,
    planName: historyDoc.workoutName,
    workoutPlan: historyDoc.workoutPlan && historyDoc.workoutPlan.name
      ? {
          _id: historyDoc.workoutPlan._id.toString(),
          name: historyDoc.workoutPlan.name,
          description: historyDoc.workoutPlan.description || '',
        }
      : null,
    exercises,
    totalExercises: historyDoc.totalExercises,
    exercisesCompleted: historyDoc.completedExercises,
    completedExercises: historyDoc.completedExercises,
    duration: historyDoc.duration || 0,
    completedAt: historyDoc.completedAt,
    createdAt: historyDoc.createdAt,
    updatedAt: historyDoc.updatedAt,
  };
}

/**
 * Helper: compute Monday-Sunday week bounds.
 */
function getWeekBounds(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  // Monday is 1, Sunday is 0 -> diff to Monday:
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(d);
  startOfWeek.setDate(diffToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}

// GET /api/workout-history
const getWorkoutHistory = async (req, res, next) => {
  try {
    const historyDocs = await WorkoutHistory.find({ user: req.user.id })
      .sort({ completedAt: -1 })
      .populate('workoutPlan', 'name description')
      .populate('exercises.exercise', 'id name category difficulty cover media');

    const serialised = historyDocs.map(serialiseHistory);

    return res.json({ success: true, data: serialised });
  } catch (error) {
    return next(error);
  }
};

// POST /api/workout-history
const createWorkoutHistory = async (req, res, next) => {
  try {
    const {
      workoutPlanId,
      planId,
      workoutName,
      planName,
      exercises,
      duration,
      completedAt,
      exercisesCompleted,
      totalExercises,
    } = req.body;

    const targetPlanId = workoutPlanId || planId || null;
    let resolvedWorkoutName = (workoutName || planName || '').trim();
    let validatedPlanDoc = null;

    // Validate workout plan reference if provided
    if (targetPlanId) {
      if (!mongoose.isValidObjectId(targetPlanId)) {
        return res.status(400).json({ success: false, message: 'Invalid workout plan ID format.' });
      }

      validatedPlanDoc = await WorkoutPlan.findOne({ _id: targetPlanId, user: req.user.id });
      if (!validatedPlanDoc) {
        return res.status(404).json({ success: false, message: 'Workout plan not found.' });
      }

      if (!resolvedWorkoutName) {
        resolvedWorkoutName = validatedPlanDoc.name;
      }
    }

    if (!resolvedWorkoutName) {
      return res.status(400).json({ success: false, message: 'Workout name is required.' });
    }

    // Resolve exercises list if provided
    let parsedExercises = [];
    if (Array.isArray(exercises) && exercises.length > 0) {
      for (const item of exercises) {
        const rawExId = item.exerciseId || item.exercise || item.id || item._id;
        let exerciseDoc = null;

        if (rawExId) {
          if (mongoose.isValidObjectId(rawExId)) {
            exerciseDoc = await Exercise.findById(rawExId).select('_id id name');
          }
          if (!exerciseDoc) {
            exerciseDoc = await Exercise.findOne({ id: rawExId }).select('_id id name');
          }
        }

        parsedExercises.push({
          exercise: exerciseDoc ? exerciseDoc._id : null,
          exerciseName: item.exerciseName || (exerciseDoc ? exerciseDoc.name : ''),
          completed: item.completed !== false,
        });
      }
    }

    // Determine totals safely
    const computedTotal = parsedExercises.length > 0
      ? parsedExercises.length
      : Math.max(Number(totalExercises) || 0, Number(exercisesCompleted) || 0, 1);

    const computedCompleted = parsedExercises.length > 0
      ? parsedExercises.filter((e) => e.completed).length
      : Math.min(Number(exercisesCompleted) || 0, computedTotal);

    const workoutHistory = await WorkoutHistory.create({
      user: req.user.id,
      workoutPlan: validatedPlanDoc ? validatedPlanDoc._id : null,
      workoutName: resolvedWorkoutName,
      exercises: parsedExercises,
      totalExercises: computedTotal,
      completedExercises: computedCompleted,
      duration: Math.max(0, Math.round(Number(duration) || 0)),
      completedAt: completedAt ? new Date(completedAt) : new Date(),
    });

    await workoutHistory.populate('workoutPlan', 'name description');
    await workoutHistory.populate('exercises.exercise', 'id name category difficulty cover media');

    return res.status(201).json({
      success: true,
      data: serialiseHistory(workoutHistory),
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/workout-history/:id
const getWorkoutHistoryById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Workout history record not found.' });
    }

    const historyDoc = await WorkoutHistory.findOne({
      _id: req.params.id,
      user: req.user.id,
    })
      .populate('workoutPlan', 'name description')
      .populate('exercises.exercise', 'id name category difficulty cover media');

    if (!historyDoc) {
      return res.status(404).json({ success: false, message: 'Workout history record not found.' });
    }

    return res.json({ success: true, data: serialiseHistory(historyDoc) });
  } catch (error) {
    return next(error);
  }
};

// DELETE /api/workout-history/:id
const deleteWorkoutHistory = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: 'Workout history record not found.' });
    }

    const deleted = await WorkoutHistory.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Workout history record not found.' });
    }

    return res.json({ success: true, message: 'Workout history record deleted.' });
  } catch (error) {
    return next(error);
  }
};

// GET /api/progress
const getProgress = async (req, res, next) => {
  try {
    const historyDocs = await WorkoutHistory.find({ user: req.user.id })
      .sort({ completedAt: -1 })
      .populate('workoutPlan', 'name description')
      .populate('exercises.exercise', 'id name category difficulty cover media');

    const serialised = historyDocs.map(serialiseHistory);

    const totalWorkouts = serialised.length;
    const totalExercises = serialised.reduce(
      (sum, item) => sum + (Number(item.completedExercises) || 0),
      0,
    );

    const now = new Date();
    const { startOfWeek, endOfWeek } = getWeekBounds(now);

    const workoutsThisWeek = serialised.filter((item) => {
      const d = new Date(item.completedAt);
      return d >= startOfWeek && d <= endOfWeek;
    }).length;

    // Build 7-day weekly activity array (Monday to Sunday)
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const todayDateStr = now.toDateString();

    const weeklyActivity = daysOfWeek.map((dayName, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      const dayDateStr = dayDate.toDateString();

      const workoutsOnDay = serialised.filter((item) => {
        const itemDate = new Date(item.completedAt);
        return itemDate.toDateString() === dayDateStr;
      });

      return {
        dayName,
        date: dayDate.toISOString(),
        dateFormatted: dayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
        isToday: dayDateStr === todayDateStr,
        hasWorkout: workoutsOnDay.length > 0,
        workoutCount: workoutsOnDay.length,
        workouts: workoutsOnDay.map((w) => ({
          id: w.id,
          planName: w.planName,
          completedAt: w.completedAt,
          exercisesCompleted: w.completedExercises,
          totalExercises: w.totalExercises,
        })),
      };
    });

    return res.json({
      success: true,
      data: {
        stats: {
          totalWorkouts,
          totalExercises,
          workoutsThisWeek,
        },
        weeklyActivity,
        recentHistory: serialised.slice(0, 5),
        allHistory: serialised,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getWorkoutHistory,
  createWorkoutHistory,
  getWorkoutHistoryById,
  deleteWorkoutHistory,
  getProgress,
};

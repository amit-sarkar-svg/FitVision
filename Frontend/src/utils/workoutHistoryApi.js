/**
 * Workout History and Progress API service for FitVision.
 * Uses the `authorizedRequest` helper from AuthContext
 * where JWT is automatically attached and endpoint paths
 * are relative to API_BASE_URL (i.e. without redundant '/api').
 */

// GET /api/workout-history
export async function fetchWorkoutHistory(authorizedRequest) {
  const response = await authorizedRequest('/workout-history')
  return response.data || []
}

// GET /api/progress
export async function fetchProgress(authorizedRequest) {
  const response = await authorizedRequest('/progress')
  return (
    response.data || {
      stats: { totalWorkouts: 0, totalExercises: 0, workoutsThisWeek: 0 },
      weeklyActivity: [],
      recentHistory: [],
      allHistory: [],
    }
  )
}

// POST /api/workout-history
export async function createWorkoutHistoryApi(authorizedRequest, historyData) {
  const response = await authorizedRequest('/workout-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(historyData),
  })
  return response.data
}

// DELETE /api/workout-history/:id
export async function deleteWorkoutHistoryApi(authorizedRequest, historyId) {
  const response = await authorizedRequest(`/workout-history/${historyId}`, {
    method: 'DELETE',
  })
  return response
}

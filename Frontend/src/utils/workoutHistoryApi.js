/**
 * Workout History and Progress API service for FitVision.
 * Communicates with /api/workout-history and /api/progress.
 */

export async function fetchWorkoutHistory(authorizedRequest) {
  const res = await authorizedRequest('/api/workout-history');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch workout history.');
  }
  const result = await res.json();
  return result.data || [];
}

export async function fetchProgress(authorizedRequest) {
  const res = await authorizedRequest('/api/progress');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch workout progress.');
  }
  const result = await res.json();
  return result.data || {
    stats: { totalWorkouts: 0, totalExercises: 0, workoutsThisWeek: 0 },
    weeklyActivity: [],
    recentHistory: [],
    allHistory: [],
  };
}

export async function createWorkoutHistoryApi(authorizedRequest, historyData) {
  const res = await authorizedRequest('/api/workout-history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(historyData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to record workout history.');
  }
  const result = await res.json();
  return result.data;
}

export async function deleteWorkoutHistoryApi(authorizedRequest, historyId) {
  const res = await authorizedRequest(`/api/workout-history/${historyId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete workout history.');
  }
  return true;
}

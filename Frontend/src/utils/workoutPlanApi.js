/**
 * Frontend API client for Workout Plans.
 * Uses the same `authorizedRequest` helper from AuthContext
 * so that the JWT is automatically attached.
 */

/**
 * All functions accept an `authorizedRequest` function as the first
 * argument — this is the one exposed by AuthContext which attaches
 * the Bearer token automatically.
 */

// GET /api/workout-plans
export async function fetchPlans(authorizedRequest) {
  const response = await authorizedRequest('/workout-plans')
  return response.data
}

// POST /api/workout-plans
export async function createPlanApi(authorizedRequest, { name, description }) {
  const response = await authorizedRequest('/workout-plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  })
  return response.data
}

// GET /api/workout-plans/:id
export async function fetchPlanById(authorizedRequest, planId) {
  const response = await authorizedRequest(`/workout-plans/${planId}`)
  return response.data
}

// PUT /api/workout-plans/:id
export async function updatePlanApi(authorizedRequest, planId, data) {
  const response = await authorizedRequest(`/workout-plans/${planId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return response.data
}

// DELETE /api/workout-plans/:id
export async function deletePlanApi(authorizedRequest, planId) {
  await authorizedRequest(`/workout-plans/${planId}`, { method: 'DELETE' })
}

// POST /api/workout-plans/:id/exercises
export async function addExerciseApi(authorizedRequest, planId, exerciseId) {
  const response = await authorizedRequest(`/workout-plans/${planId}/exercises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exerciseId }),
  })
  return response.data
}

// POST /api/workout-plans/:id/exercises (batch mode)
export async function addExercisesBatchApi(authorizedRequest, planId, exerciseIds) {
  const response = await authorizedRequest(`/workout-plans/${planId}/exercises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exerciseIds }),
  })
  return response.data
}

// DELETE /api/workout-plans/:id/exercises/:exerciseId
export async function removeExerciseApi(authorizedRequest, planId, exerciseId) {
  const response = await authorizedRequest(`/workout-plans/${planId}/exercises/${exerciseId}`, {
    method: 'DELETE',
  })
  return response.data
}

const STORAGE_KEY = 'fitvision_favorite_exercises'

/**
 * Get all favorite exercise IDs from localStorage.
 */
export function getFavoriteExerciseIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to load favorite exercises from localStorage:', err)
    return []
  }
}

/**
 * Save an array of favorite exercise IDs to localStorage.
 */
export function saveFavoriteExerciseIds(ids) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    window.dispatchEvent(new CustomEvent('fitvision:favorites-updated', { detail: ids }))
    return true
  } catch (err) {
    console.error('Failed to save favorite exercises to localStorage:', err)
    return false
  }
}

/**
 * Check if an exercise ID is favorited.
 */
export function isExerciseFavorite(exerciseId) {
  if (!exerciseId) return false
  const ids = getFavoriteExerciseIds()
  return ids.includes(exerciseId)
}

/**
 * Add an exercise ID to favorites.
 */
export function addFavoriteExercise(exerciseId) {
  if (!exerciseId) return { success: false, error: 'Invalid exercise ID' }
  const ids = getFavoriteExerciseIds()
  if (ids.includes(exerciseId)) {
    return { success: true, isFavorite: true }
  }
  const updated = [exerciseId, ...ids]
  saveFavoriteExerciseIds(updated)
  return { success: true, isFavorite: true }
}

/**
 * Remove an exercise ID from favorites.
 */
export function removeFavoriteExercise(exerciseId) {
  if (!exerciseId) return { success: false, error: 'Invalid exercise ID' }
  const ids = getFavoriteExerciseIds()
  const updated = ids.filter((id) => id !== exerciseId)
  saveFavoriteExerciseIds(updated)
  return { success: true, isFavorite: false }
}

/**
 * Toggle an exercise ID in favorites.
 */
export function toggleFavoriteExercise(exerciseId) {
  if (!exerciseId) return { success: false, error: 'Invalid exercise ID' }
  const ids = getFavoriteExerciseIds()
  const exists = ids.includes(exerciseId)
  if (exists) {
    const updated = ids.filter((id) => id !== exerciseId)
    saveFavoriteExerciseIds(updated)
    return { success: true, isFavorite: false }
  } else {
    const updated = [exerciseId, ...ids]
    saveFavoriteExerciseIds(updated)
    return { success: true, isFavorite: true }
  }
}

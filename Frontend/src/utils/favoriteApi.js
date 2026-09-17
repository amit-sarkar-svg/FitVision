/**
 * Frontend API client for Favorites.
 * Uses the `authorizedRequest` helper from AuthContext
 * so that the JWT is automatically attached.
 */

// GET /api/favorites
export async function fetchFavoritesApi(authorizedRequest) {
  const response = await authorizedRequest('/favorites')
  return response.data || []
}

// POST /api/favorites/:exerciseId
export async function addFavoriteApi(authorizedRequest, exerciseId) {
  const response = await authorizedRequest(`/favorites/${exerciseId}`, {
    method: 'POST',
  })
  return response.data
}

// DELETE /api/favorites/:exerciseId
export async function removeFavoriteApi(authorizedRequest, exerciseId) {
  const response = await authorizedRequest(`/favorites/${exerciseId}`, {
    method: 'DELETE',
  })
  return response
}

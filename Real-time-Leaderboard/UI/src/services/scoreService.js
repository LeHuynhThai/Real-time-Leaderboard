import { http } from './http'

export async function submitScore(score) {
  try {
    const response = await http('/api/Score/submit-score', {
      method: 'POST',
      body: JSON.stringify({
        Score: score
      }),
    })
    return response
  } catch (error) {
    console.error('Error submitting score:', error)
    throw new Error(error.message || 'Error submitting score')
  }
}

export async function getAllScores() {
  try {
      const response = await http('/api/Score/all')
    return response
  } catch (error) {
    console.error('Error fetching scores:', error)
    throw new Error(error.message || 'Error fetching scores')
  }
}

export async function getMyScore() {
  try {
      const response = await http('/api/Score/me')
    return response
  } catch (error) {
    console.error('Error fetching my score:', error)
    throw new Error(error.message || 'Error fetching my score')
  }
}

// Fetch leaderboard with pagination (skip/take)
export async function getLeaderboard(skip = 0, take = 100) {
  try {
    const query = `?skip=${skip}&take=${take}`
    const response = await http(`/api/Score/all${query}`)
    return response
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    throw new Error(error.message || 'Error fetching leaderboard')
  }
}

// Search players by username
export async function searchPlayers(query) {
  try {
    const response = await http(`/api/Score/search?query=${encodeURIComponent(query)}`)
    return response
  } catch (error) {
    console.error('Error searching players:', error)
    throw new Error(error.message || 'Error searching players')
  }
}

export async function getMyRank() {
  try {
      const response = await http('/api/Score/my-rank')
    return response
  } catch (error) {
    console.error('Error fetching my rank:', error)
    throw new Error(error.message || 'Error fetching my rank')
  }
}
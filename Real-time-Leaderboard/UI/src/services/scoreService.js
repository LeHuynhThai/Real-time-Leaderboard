import { http } from './http'

export async function submitScore(score) {
  try {
    const response = await http('/api/ScoreSubmission/submit-score', {
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
    const response = await http('/api/ScoreSubmission/all')
    return response
  } catch (error) {
    console.error('Error fetching scores:', error)
    throw new Error(error.message || 'Error fetching scores')
  }
}

export async function getMyScore() {
  try {
    const response = await http('/api/ScoreSubmission/me')
    return response
  } catch (error) {
    console.error('Error fetching my score:', error)
    throw new Error(error.message || 'Error fetching my score')
  }
}

// Fetch leaderboard with optional limit n (default to show more entries for full view)
export async function getLeaderboard(n) {
  try {
    const query = typeof n === 'number' ? `?n=${n}` : ''
    const response = await http(`/api/ScoreSubmission/all${query}`)
    return response
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    throw new Error(error.message || 'Error fetching leaderboard')
  }
}

export async function getMyRank() {
  try {
    const response = await http('/api/ScoreSubmission/my-rank')
    return response
  } catch (error) {
    console.error('Error fetching my rank:', error)
    throw new Error(error.message || 'Error fetching my rank')
  }
}
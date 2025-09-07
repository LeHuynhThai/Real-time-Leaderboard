import { http } from './http'

// Update score: create if not exists, or update only when higher
export async function updateScore(score) {
  try {
    const response = await http('/api/ScoreSubmission/update-score', {
      method: 'POST',
      body: JSON.stringify({
        Score: score,
      }),
    })
    return response
  } catch (error) {
    console.error('Error updating score:', error)
    throw new Error(error.message || 'Error updating score')
  }
}

// Keep backward compatibility: submitScore delegates to updateScore
export async function submitScore(score) {
  return updateScore(score)
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
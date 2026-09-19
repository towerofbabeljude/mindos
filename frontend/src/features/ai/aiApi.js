// Isolated API client for Gemini AI Assistant

const BACKEND_AI_URL = '/api/ai';

/**
 * Ask Gemini API with a prompt
 * @param {string} prompt
 * @returns {Promise<{answer?: string, error?: string}>}
 */
export async function askGemini(prompt) {
  if (!prompt || !prompt.trim()) {
    return { error: 'Please enter a prompt.' };
  }

  try {
    const response = await fetch(`${BACKEND_AI_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt.trim() }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.detail || `Server returned error (${response.status})`;
      return { error: errorMsg };
    }

    return { answer: data.answer || '' };
  } catch (err) {
    return {
      error: `Network error: Unable to reach AI backend (${err.message || 'Connection failed'}). Make sure the backend server is running.`
    };
  }
}

/**
 * Check AI service health
 * @returns {Promise<{status?: string, model?: string, configured?: boolean, error?: string}>}
 */
export async function checkAiHealth() {
  try {
    const response = await fetch(`${BACKEND_AI_URL}/health`);
    if (!response.ok) {
      return { error: `Health check failed with status ${response.status}` };
    }
    return await response.json();
  } catch (err) {
    return { error: `Cannot reach backend: ${err.message}` };
  }
}

// Isolated API client for MindOS Wellbeing Chatbot

const BACKEND_CHATBOT_URL = '/api/chatbot';

/**
 * Send conversation history to the Chatbot backend endpoint.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{reply?: string, crisis?: boolean, error?: string}>}
 */
export async function sendChatMessage(messages) {
  if (!messages || !messages.length) {
    return { error: 'Message cannot be empty.' };
  }

  try {
    const response = await fetch(`${BACKEND_CHATBOT_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.detail || `Server returned error (${response.status})`;
      return { error: errorMsg, crisis: false };
    }

    return {
      reply: data.reply || '',
      crisis: Boolean(data.crisis),
    };
  } catch (err) {
    return {
      error: `Network error: Unable to reach chatbot backend (${err.message || 'Connection failed'}). Ensure the MindOS backend is running.`,
      crisis: false,
    };
  }
}

/**
 * Check health of the Chatbot backend module.
 * @returns {Promise<{status?: string, service?: string, configured?: boolean, model?: string, error?: string}>}
 */
export async function checkChatbotHealth() {
  try {
    const response = await fetch(`${BACKEND_CHATBOT_URL}/health`);
    if (!response.ok) {
      return { error: `Health check failed (${response.status})` };
    }
    return await response.json();
  } catch (err) {
    return { error: `Cannot reach backend: ${err.message}` };
  }
}

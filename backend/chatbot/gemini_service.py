"""Gemini Client Service for MindOS Wellbeing Chatbot.

Uses the official google-genai SDK to handle multi-turn conversational wellbeing chats.
"""

import os
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv
from google import genai
from google.genai import types
from google.genai.errors import APIError

from .prompts import SYSTEM_PROMPT

# Load environment variables from backend/.env or root .env
backend_env = Path(__file__).resolve().parent.parent / ".env"
root_env = Path(__file__).resolve().parent.parent.parent / ".env"

if backend_env.exists():
    load_dotenv(dotenv_path=backend_env)
elif root_env.exists():
    load_dotenv(dotenv_path=root_env)
else:
    load_dotenv()

# Pinned model constant for Gemini Chat
GEMINI_MODEL = os.getenv("GEMINI_CHAT_MODEL", "gemini-3.6-flash")


def is_api_key_configured() -> bool:
    """Check if a valid GEMINI_API_KEY is present."""
    key = os.getenv("GEMINI_API_KEY", "").strip()
    return bool(key and key != "your_key_here")


def chat(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Send conversation history to Gemini model and return the reply.
    
    Args:
        messages: List of dicts with 'role' ('user' or 'assistant'/'model') and 'content'.

    Returns:
        Dict with 'reply' (str or None) and 'error' (str or None).
    """
    if not is_api_key_configured():
        return {
            "reply": None,
            "error": "Gemini API key is missing or not configured. Please add your GEMINI_API_KEY to the .env file."
        }

    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not messages:
        return {
            "reply": None,
            "error": "No messages provided to the chatbot."
        }

    # Format messages for the Google GenAI SDK
    contents: List[types.Content] = []
    for msg in messages:
        role = msg.get("role", "user")
        gemini_role = "model" if role in ("assistant", "model", "bot") else "user"
        content_text = (msg.get("content") or "").strip()
        if content_text:
            contents.append(
                types.Content(
                    role=gemini_role,
                    parts=[types.Part.from_text(text=content_text)]
                )
            )

    if not contents:
        return {
            "reply": None,
            "error": "Message content cannot be empty."
        }

    try:
        client = genai.Client(api_key=api_key)
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.7,
        )

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=contents,
            config=config,
        )

        reply_text = response.text or ""
        if not reply_text.strip():
            reply_text = "I'm here with you. Could you share a little more about how you're feeling right now?"

        return {
            "reply": reply_text.strip(),
            "error": None
        }

    except APIError as api_err:
        err_msg = str(api_err)
        if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
            friendly_err = "The AI service is currently receiving high demand. Please take a gentle breath and try again in a moment."
        elif "403" in err_msg or "PERMISSION_DENIED" in err_msg:
            friendly_err = "Gemini API key appears to be invalid or unauthorized. Please verify your GEMINI_API_KEY in the .env file."
        elif "404" in err_msg:
            friendly_err = f"Selected Gemini model ({GEMINI_MODEL}) was not found. Please check model configuration."
        else:
            friendly_err = f"Gemini API error: {err_msg}"

        return {
            "reply": None,
            "error": friendly_err
        }

    except Exception as exc:
        return {
            "reply": None,
            "error": f"Unable to reach Gemini: {str(exc)}"
        }

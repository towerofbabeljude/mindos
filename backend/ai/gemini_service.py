import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Load environment variables from .env
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

# Pinned model constant (current Gemini Flash model)
GEMINI_MODEL = "gemini-2.0-flash"

def is_api_key_configured() -> bool:
    key = os.getenv("GEMINI_API_KEY", "").strip()
    return bool(key and key != "your_key_here")

def ask_gemini(prompt: str) -> dict:
    """
    Send prompt to Gemini API using google-genai package.
    Returns a dictionary with 'answer' and 'error'.
    """
    if not prompt or not prompt.strip():
        return {
            "answer": None,
            "error": "Prompt cannot be empty."
        }

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_key_here":
        return {
            "answer": None,
            "error": "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file."
        }

    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt.strip()
        )
        answer = response.text or ""
        return {
            "answer": answer,
            "error": None
        }
    except Exception as e:
        return {
            "answer": None,
            "error": f"Gemini API request failed: {str(e)}"
        }

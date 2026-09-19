"""FastAPI router for MindOS Wellbeing Chatbot.

Endpoints:
- GET  /api/chatbot/health
- POST /api/chatbot/chat

Conversations are completely in-memory and ephemeral.
No message content or logs are written to database or persistent storage.
"""

from typing import List, Literal
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from .gemini_service import chat, is_api_key_configured, GEMINI_MODEL
from .safety import check_crisis_keywords

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

# Enforce bounds
MAX_HISTORY_MESSAGES = 20
MAX_MESSAGE_CHARACTERS = 2000


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "model", "system"] = Field(
        ..., description="Role of the sender"
    )
    content: str = Field(
        ...,
        description="Message content, capped at 2000 characters"
    )


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(
        ...,
        min_length=1,
        description="Conversation history list up to 20 messages"
    )


class ChatResponse(BaseModel):
    reply: str
    crisis: bool


class HealthResponse(BaseModel):
    status: str
    service: str
    configured: bool
    model: str


@router.get("/health", response_model=HealthResponse)
def chatbot_health():
    """Health check for the Wellbeing Chatbot module."""
    configured = is_api_key_configured()
    return HealthResponse(
        status="ok",
        service="Alix Wellbeing Companion",
        configured=configured,
        model=GEMINI_MODEL,
    )


@router.post("/chat", response_model=ChatResponse)
def chatbot_conversation(payload: ChatRequest):
    """
    Process a chat turn with safety checks and Gemini responses.
    No chat history is stored in any database or persisted logs.
    """
    raw_messages = payload.messages
    if not raw_messages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat history cannot be empty."
        )

    # 1. Limit conversation history to the last 20 messages
    truncated_history = raw_messages[-MAX_HISTORY_MESSAGES:]

    # 2. Enforce character cap per message (2000 chars max)
    sanitized = []
    for msg in truncated_history:
        cleaned_text = (msg.content or "").strip()[:MAX_MESSAGE_CHARACTERS]
        if cleaned_text:
            sanitized.append({"role": msg.role, "content": cleaned_text})

    if not sanitized:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message content cannot be blank."
        )

    # 3. Identify the latest user input for the safety check
    latest_user_text = ""
    for item in reversed(sanitized):
        if item["role"] == "user":
            latest_user_text = item["content"]
            break

    # 4. Keyword-based crisis safety check run BEFORE calling Gemini
    is_crisis, crisis_reply = check_crisis_keywords(latest_user_text)
    if is_crisis and crisis_reply:
        # Gemini is NOT called; return immediate supportive helpline guidance
        return ChatResponse(reply=crisis_reply, crisis=True)

    # 5. Call Gemini service
    result = chat(sanitized)
    if result.get("error"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=result["error"]
        )

    return ChatResponse(
        reply=result["reply"] or "I'm listening. How can I support you right now?",
        crisis=False
    )

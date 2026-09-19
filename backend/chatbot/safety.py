"""Safety and crisis detection module for MindOS Wellbeing Chatbot.

Provides keyword-based safety checks run BEFORE calling Gemini.
If triggered, Gemini is bypassed and immediate supportive crisis resources are returned.
"""

import re
from typing import Tuple

# Configurable crisis helplines — easy to edit or add additional country lines
HELPLINES = {
    "India": {
        "name": "Tele-MANAS (National Tele Mental Health Helpline)",
        "number": "14416",
        "alt_number": "1800 891 4416",
        "availability": "24/7, Toll-Free, Multilingual"
    },
    "US & Canada": {
        "name": "988 Suicide & Crisis Lifeline",
        "number": "988",
        "availability": "24/7, Call or Text, Free & Confidential"
    },
    "UK": {
        "name": "Samaritans",
        "number": "116 123",
        "availability": "24/7, Free"
    },
    "Emergency": {
        "India": "112",
        "US": "911",
        "Europe / UK": "112 / 999"
    }
}

# Regex patterns covering suicide, self-harm, wanting to die, hurting others, abuse
CRISIS_PATTERNS = [
    # Suicide / wanting to die
    r"\b(suicid(e|al|ing)?)\b",
    r"\bkill(ing)?\s+(my\s*self|me)\b",
    r"\bend(ing)?\s+(my\s*life|it\s*all)\b",
    r"\b(want|wanna|wish\s*i\s*could)\s+to\s+die\b",
    r"\bwish\s+i\s+(were|was)\s+dead\b",
    r"\bbetter\s+off\s+dead\b",
    r"\btak(e|ing)\s+my\s*(own)?\s*life\b",
    r"\bdon'?t\s+want\s+to\s+live\s+(anymore|any\s*longer)\b",
    r"\bno\s+reason\s+to\s+live\b",
    
    # Self-harm
    r"\bself[\s\-_]*harm\b",
    r"\bcut(ting)?\s+my\s*self\b",
    r"\bhurt(ing)?\s+my\s*self\b",
    r"\bburn(ing)?\s+my\s*self\b",
    r"\boverdose\b",

    # Hurting others / violence
    r"\bhurt(ing)?\s+(others|someone|people)\b",
    r"\bkill(ing)?\s+(someone|others|them|people)\b",

    # Severe abuse / danger
    r"\b(physically|sexually)?\s*abus(ed|ing|ive)\b",
    r"\bdomestic\s+violence\b",
    r"\bin\s+immediate\s+danger\b"
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in CRISIS_PATTERNS]


def get_crisis_response_text() -> str:
    """Generate the fixed supportive crisis message with emergency helpline info."""
    return (
        "I hear that you're going through a very difficult and painful moment, "
        "and I want to make sure you are safe. Please know that you are not alone, "
        "and there is support available right now.\n\n"
        "Because I am Alix, an AI companion and cannot provide crisis or medical care, "
        "please connect with someone who can help immediately:\n\n"
        f"• **India (Tele-MANAS)**: Call **{HELPLINES['India']['number']}** or **{HELPLINES['India']['alt_number']}** ({HELPLINES['India']['availability']})\n"
        f"• **US & Canada**: Call or text **{HELPLINES['US & Canada']['number']}** ({HELPLINES['US & Canada']['availability']})\n"
        f"• **UK**: Call **{HELPLINES['UK']['number']}** ({HELPLINES['UK']['availability']})\n"
        f"• **Emergency Services**: India **{HELPLINES['Emergency']['India']}** | US **{HELPLINES['Emergency']['US']}** | UK/EU **{HELPLINES['Emergency']['Europe / UK']}**\n\n"
        "Please consider reaching out right now to a trusted friend, family member, mentor, "
        "counselor, or local emergency services. People care about you and want to support you through this."
    )


def check_crisis_keywords(text: str) -> Tuple[bool, str | None]:
    """
    Check if the user's text contains crisis keywords.
    Returns:
        (is_crisis: bool, supportive_message: str | None)
    """
    if not text:
        return False, None

    cleaned = text.strip()
    for pattern in COMPILED_PATTERNS:
        if pattern.search(cleaned):
            return True, get_crisis_response_text()

    return False, None

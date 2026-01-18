import os
import google.generativeai as genai
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# --- CONFIGURATION ---
api_key = os.getenv("API_KEY_GEMINI")

if not api_key:
    logger.warning(" WARNING: API_KEY_GEMINI not found in .env file")
else:
    genai.configure(api_key=api_key.strip())

model = genai.GenerativeModel("gemini-2.5-flash")

def generate_legal_explanation(prompt: str) -> str:
 
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error connecting to Gemini AI: {e}")
        return "Service temporarily unavailable. Please try again later."
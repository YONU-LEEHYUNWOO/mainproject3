
import google.generativeai as genai
import os
from pathlib import Path
import sys

# Add backend directory to sys.path
backend_path = Path(__file__).parent.absolute()
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

try:
    from config import GEMINI_API_KEY
except ImportError:
    from backend.config import GEMINI_API_KEY

if not GEMINI_API_KEY:
    print("❌ No API key found.")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)

print("🔍 Listing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"❌ Failed to list models: {e}")

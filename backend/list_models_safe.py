
import google.generativeai as genai
import os
import sys

# Ensure UTF-8 output
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

try:
    from backend.config import GEMINI_API_KEY
except ImportError:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("VITE_GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Error: No API key found.")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)

print("Starting model list...")
try:
    models = genai.list_models()
    for m in models:
        if 'generateContent' in m.supported_generation_methods:
            print(f"MODEL_NAME: {m.name}")
except Exception as e:
    print(f"Error: {e}")


import os
import sys
from dotenv import load_dotenv

# Ensure UTF-8 output
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load .env
load_dotenv('c:/Users/Administrator/Desktop/mainproject3/.env')
GEMINI_API_KEY = os.getenv("VITE_GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Error: No VITE_GEMINI_API_KEY found in .env")
    sys.exit(1)

import google.generativeai as genai
genai.configure(api_key=GEMINI_API_KEY)

print("Starting model list...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"MODEL_NAME: {m.name}")
except Exception as e:
    print(f"Error: {e}")

#!/usr/bin/env python
"""
간단한 백엔드 서버 실행
"""

import sys
import os
from pathlib import Path

# backend 폴더를 Python 경로에 추가 (절대 import를 위해)
backend_path = Path(__file__).parent.absolute()
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

import uvicorn
from main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

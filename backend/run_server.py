#!/usr/bin/env python
"""
간단한 백엔드 서버 실행
"""

import uvicorn
from main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
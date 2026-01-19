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
    # 로그 레벨을 info로 설정하고 access_log 활성화
    # use_colors=False로 설정하여 로그가 확실히 출력되도록 함
    import logging
    logging.basicConfig(level=logging.INFO)
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info",
        access_log=True,
        use_colors=False  # 색상 없이 출력하여 로그가 확실히 보이도록
    )

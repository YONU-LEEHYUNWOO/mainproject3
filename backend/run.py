#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
백엔드 서버 실행 스크립트
uvicorn 실행 문제를 해결하기 위한 대안 스크립트
"""

import sys
import os
from pathlib import Path

# 프로젝트 루트 경로 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# 백엔드 모듈 경로 추가
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(project_root)]
    )
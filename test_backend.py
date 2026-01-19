#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import os

# 백엔드 디렉토리를 Python 경로에 추가
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

try:
    # 백엔드 모듈 임포트
    from main import app
    print("백엔드 모듈 임포트 성공!")

    # FastAPI 앱 확인
    print(f"FastAPI 앱: {app}")
    print(f"라우터 수: {len(app.routes)}")

except ImportError as e:
    print(f"임포트 오류: {e}")
    import traceback
    traceback.print_exc()

except Exception as e:
    print(f"기타 오류: {e}")
    import traceback
    traceback.print_exc()
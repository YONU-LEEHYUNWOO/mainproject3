#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
데이터베이스 초기화 및 마이그레이션 실행 스크립트
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

def init_database():
    """데이터베이스 초기화 및 마이그레이션 실행"""
    try:
        # 데이터베이스 모델 임포트 (테이블 생성)
        from models import base
        from database import engine

        print("데이터베이스 테이블 생성 중...")
        base.Base.metadata.create_all(bind=engine)
        print("[OK] 데이터베이스 테이블 생성 완료")

        # Alembic 마이그레이션 실행
        print("마이그레이션 실행 중...")
        os.system("alembic upgrade head")
        print("[OK] 마이그레이션 완료")

        print("성공: 데이터베이스 초기화가 완료되었습니다!")

    except Exception as e:
        print(f"오류: 데이터베이스 초기화 중 오류 발생: {e}")
        return False

    return True

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
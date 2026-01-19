#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
환경 변수 확인 스크립트
"""

import os
from pathlib import Path
from dotenv import load_dotenv

def check_env():
    """환경 변수 로드 상태 확인"""
    print("=== 환경 변수 확인 ===")

    # 현재 작업 디렉토리
    cwd = os.getcwd()
    print(f"현재 작업 디렉토리: {cwd}")

    # .env 파일 경로들
    env_paths = [
        '.env',  # 현재 디렉토리
        '../.env',  # 부모 디렉토리
        './.env',  # 명시적 현재
        str(Path(__file__).parent / '.env'),  # 스크립트 기준
        str(Path(__file__).parent.parent / '.env'),  # 프로젝트 루트
    ]

    print("\n=== .env 파일 존재 확인 ===")
    for path in env_paths:
        full_path = Path(path).resolve()
        exists = full_path.exists()
        print(f"{path} -> {full_path} : {'존재' if exists else '없음'}")

    print("\n=== .env 파일 로드 시도 ===")
    # 직접 로드 시도
    for path in env_paths:
        try:
            if load_dotenv(path):
                print(f"✅ {path} 로드 성공")
                break
            else:
                print(f"❌ {path} 로드 실패")
        except Exception as e:
            print(f"❌ {path} 로드 오류: {e}")

    print("\n=== 환경 변수 값 확인 ===")
    env_vars = [
        'GEMINI_API_KEY',
        'DATABASE_URL',
        'SECRET_KEY',
        'DEBUG'
    ]

    for var in env_vars:
        value = os.getenv(var)
        if value:
            # API 키는 앞뒤만 표시
            if var == 'GEMINI_API_KEY' and len(value) > 10:
                display_value = value[:5] + '...' + value[-5:]
            else:
                display_value = value
            print(f"✅ {var}: {display_value}")
        else:
            print(f"❌ {var}: 설정되지 않음")

if __name__ == "__main__":
    check_env()
"""
환경 변수 및 설정 관리
python-decouple을 사용하여 환경 변수를 안전하게 로드합니다.
"""

from decouple import config
from dotenv import load_dotenv
import os

# .env 파일 로드
load_dotenv()  # 현재 디렉토리 (.env)
load_dotenv(dotenv_path='../.env')  # 프로젝트 루트 (..env)

# 디버그: 환경 변수 로드 확인
import os
print(f"DEBUG: GEMINI_API_KEY loaded: {'Yes' if os.getenv('GEMINI_API_KEY') else 'No'}")
print(f"DEBUG: Current working directory: {os.getcwd()}")

# 데이터베이스 설정 (개발용 SQLite, 프로덕션 시 PostgreSQL로 변경)
DATABASE_URL = config("DATABASE_URL", default="sqlite:///./care_assistant.db")

# JWT 설정
SECRET_KEY = config("SECRET_KEY", default="your-secret-key-here-change-in-production")
ALGORITHM = config("ALGORITHM", default="HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = config("ACCESS_TOKEN_EXPIRE_MINUTES", default=30, cast=int)

# AI API 설정 - 직접 os.getenv() 사용 (더 확실함)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# 디버그: 실제 값 확인
print(f"DEBUG: Final GEMINI_API_KEY = {'***' + GEMINI_API_KEY[-4:] if GEMINI_API_KEY else 'EMPTY'}")
print(f"DEBUG: Final GEMINI_MODEL = {GEMINI_MODEL}")

# 지도 API 설정 (선택)
KAKAO_MAP_API_KEY = config("KAKAO_MAP_API_KEY", default="")
NAVER_MAP_API_KEY = config("NAVER_MAP_API_KEY", default="")

# 날씨 API 설정 (선택)
KOREA_WEATHER_API_KEY = config("KOREA_WEATHER_API_KEY", default="")

# 서버 설정
DEBUG = config("DEBUG", default=True, cast=bool)
HOST = config("HOST", default="0.0.0.0")
PORT = config("PORT", default=8000, cast=int)

# CORS 설정
ALLOWED_ORIGINS = config("ALLOWED_ORIGINS", default="http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176").split(",")

# Redis 설정 (선택, 캐싱용)
REDIS_URL = config("REDIS_URL", default="redis://localhost:6379")
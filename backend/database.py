"""
데이터베이스 연결 및 세션 관리
SQLAlchemy를 사용하여 데이터베이스 연결을 관리합니다.
(개발: SQLite, 프로덕션: PostgreSQL)
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import DATABASE_URL

# SQLAlchemy 엔진 생성
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # 연결 확인
    echo=True,  # 개발용 SQL 로깅 (프로덕션에서는 False)
    connect_args={"check_same_thread": False}  # SQLite thread safety
)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 베이스 클래스 (모든 모델의 부모)
Base = declarative_base()

def get_db():
    """
    데이터베이스 세션 의존성 주입용 함수
    FastAPI의 Depends()와 함께 사용
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """데이터베이스 테이블 생성"""
    Base.metadata.create_all(bind=engine)

def drop_tables():
    """데이터베이스 테이블 삭제 (개발용)"""
    Base.metadata.drop_all(bind=engine)
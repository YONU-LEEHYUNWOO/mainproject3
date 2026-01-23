"""
데이터베이스 연결 및 세션 관리
SQLAlchemy를 사용하여 데이터베이스 연결을 관리합니다.
(개발: SQLite, 프로덕션: PostgreSQL)
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# 패키지 import와 직접 실행 모두 지원
try:
    from config import DATABASE_URL
except ImportError:
    from backend.config import DATABASE_URL

try:
    from models.base import Base  # 모델의 Base 사용
except ImportError:
    from backend.models.base import Base

# SQLAlchemy 엔진 생성
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # 연결 확인
    echo=True,  # 개발용 SQL 로깅 (프로덕션에서는 False)
    connect_args={"check_same_thread": False}  # SQLite thread safety
)

# 세션 팩토리 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def ensure_schema():
    """데이터베이스 스키마 및 누락된 컬럼 검사 (프로그램 시작 시 1회 실행)"""
    from sqlalchemy import inspect, text
    import os
    
    try:
        db_path = DATABASE_URL.replace("sqlite:///", "")
        print(f"[DB-CHECK] 데이터베이스 파일 확인: {os.path.abspath(db_path)}")
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        # 1. users 테이블 확인 및 생성
        if 'users' not in tables:
            print("[DB-CHECK] users 테이블이 없습니다. 생성 중...")
            with engine.begin() as conn:
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username VARCHAR(50) NOT NULL UNIQUE,
                        email VARCHAR(100) NOT NULL UNIQUE,
                        hashed_password VARCHAR(255) NOT NULL,
                        full_name VARCHAR(100),
                        phone VARCHAR(20),
                        user_type VARCHAR(20) NOT NULL DEFAULT 'parent',
                        is_active BOOLEAN NOT NULL DEFAULT 1,
                        is_superuser BOOLEAN NOT NULL DEFAULT 0,
                        last_login DATETIME,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                """))
            print("[DB-CHECK] users 테이블 생성 완료")
        else:
            # users 테이블 내 user_type 컬럼 확인
            with engine.begin() as conn:
                result = conn.execute(text("PRAGMA table_info(users)"))
                columns = [row[1] for row in result.fetchall()]
                if 'user_type' not in columns:
                    print("[DB-CHECK] users 테이블에 user_type 컬럼 추가 중...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN user_type VARCHAR(20) NOT NULL DEFAULT 'parent'"))
                
                if 'last_activity_at' not in columns:
                    print("[DB-CHECK] users 테이블에 last_activity_at 컬럼 추가 중...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN last_activity_at DATETIME"))
                
                if 'location_sharing_enabled' not in columns:
                    print("[DB-CHECK] users 테이블에 location_sharing_enabled 컬럼 추가 중...")
                    conn.execute(text("ALTER TABLE users ADD COLUMN location_sharing_enabled BOOLEAN NOT NULL DEFAULT 1"))
        
        # 2. favorite_places 테이블 내 is_primary 컬럼 확인
        if 'favorite_places' in tables:
            with engine.begin() as conn:
                result = conn.execute(text("PRAGMA table_info(favorite_places)"))
                columns = [row[1] for row in result.fetchall()]
                if 'is_primary' not in columns:
                    print("[DB-CHECK] favorite_places 테이블에 is_primary 컬럼 추가 중...")
                    conn.execute(text("ALTER TABLE favorite_places ADD COLUMN is_primary BOOLEAN NOT NULL DEFAULT 0"))
        
        print("[DB-CHECK] 모든 스키마 검사 완료")
    except Exception as e:
        print(f"[DB-CHECK] 오류 발생: {e}")
        import traceback
        traceback.print_exc()

def get_db():
    """
    데이터베이스 세션 의존성 주입용 함수
    매 요청마다 세션만 생성 (스키마 검사는 startup에서 수행)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """데이터베이스 테이블 생성"""
    try:
        # 모든 모델이 import되었는지 확인
        try:
            from models import (
                User, Task, ChatMessage, AIConversation,
                Guardian, Medicine, MedicineAlarm, NotificationLog
            )
        except ImportError:
            from backend.models import (
                User, Task, ChatMessage, AIConversation,
                Guardian, Medicine, MedicineAlarm, NotificationLog
            )
        print(f"[DB] 테이블 생성 시작...")
        print(f"[DB] 등록된 테이블: {list(Base.metadata.tables.keys())}")

        # 테이블 생성
        Base.metadata.create_all(bind=engine)

        # 생성된 테이블 확인
        from sqlalchemy import inspect
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        print(f"[DB] 생성된 테이블: {existing_tables}")

        if 'users' not in existing_tables:
            print("[DB] 경고: users 테이블이 생성되지 않았습니다!")
            raise Exception("users 테이블 생성 실패")

    except Exception as e:
        print(f"[DB] 테이블 생성 오류: {e}")
        import traceback
        traceback.print_exc()
        raise

def drop_tables():
    """데이터베이스 테이블 삭제 (개발용)"""
    Base.metadata.drop_all(bind=engine)
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

def ensure_users_table():
    """users 테이블이 존재하는지 확인하고 없으면 생성, user_type 컬럼이 없으면 추가"""
    from sqlalchemy import inspect, text
    import os
    
    # 데이터베이스 파일 경로 확인
    db_path = DATABASE_URL.replace("sqlite:///", "")
    print(f"GET_DB DEBUG: Checking database at: {os.path.abspath(db_path)}")
    print(f"GET_DB DEBUG: Database file exists: {os.path.exists(db_path)}")
    
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    print(f"GET_DB DEBUG: Existing tables: {existing_tables}")
    
    if 'users' not in existing_tables:
        print("GET_DB WARNING: users table not found! Creating now...")
        try:
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
            print("GET_DB SUCCESS: users table created!")
            
            # 다시 확인
            inspector = inspect(engine)
            existing_tables = inspector.get_table_names()
            print(f"GET_DB DEBUG: Tables after creation: {existing_tables}")
            if 'users' in existing_tables:
                print("GET_DB VERIFIED: users table exists!")
            else:
                print("GET_DB ERROR: users table still not found after creation!")
        except Exception as e:
            print(f"GET_DB ERROR creating users table: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("GET_DB OK: users table already exists")
        
        # user_type 컬럼이 있는지 확인하고 없으면 추가
        try:
            with engine.begin() as conn:
                # 테이블의 컬럼 목록 확인
                result = conn.execute(text("PRAGMA table_info(users)"))
                columns = [row[1] for row in result.fetchall()]
                print(f"GET_DB DEBUG: Existing columns in users table: {columns}")
                
                if 'user_type' not in columns:
                    print("GET_DB WARNING: user_type column not found! Adding now...")
                    # SQLite에서 컬럼 추가 (기본값 설정)
                    conn.execute(text("""
                        ALTER TABLE users 
                        ADD COLUMN user_type VARCHAR(20) NOT NULL DEFAULT 'parent'
                    """))
                    print("GET_DB SUCCESS: user_type column added!")
                else:
                    print("GET_DB OK: user_type column already exists")
        except Exception as e:
            print(f"GET_DB ERROR checking/adding user_type column: {e}")
            import traceback
            traceback.print_exc()

def get_db():
    """
    데이터베이스 세션 의존성 주입용 함수
    FastAPI의 Depends()와 함께 사용
    """
    db = None
    try:
        db = SessionLocal()
        
        # 세션에서 직접 테이블 존재 여부 확인 및 생성
        from sqlalchemy import inspect, text
        try:
            # 세션의 연결을 사용하여 테이블 확인
            inspector = inspect(db.bind)
            tables = inspector.get_table_names()
            
            if 'users' not in tables:
                print("GET_DB WARNING: users table not found in session! Creating...")
                # 세션에서 직접 테이블 생성
                db.execute(text("""
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
                db.commit()
                print("GET_DB SUCCESS: users table created in session!")
                
                # 다시 확인
                inspector = inspect(db.bind)
                tables = inspector.get_table_names()
                print(f"GET_DB DEBUG: Tables after creation: {tables}")
            else:
                # users 테이블이 존재하면 user_type 컬럼 확인 및 추가
                try:
                    result = db.execute(text("PRAGMA table_info(users)"))
                    columns = [row[1] for row in result.fetchall()]
                    print(f"GET_DB DEBUG: Existing columns in users table: {columns}")
                    
                    if 'user_type' not in columns:
                        print("GET_DB WARNING: user_type column not found! Adding now...")
                        # SQLite에서 컬럼 추가
                        db.execute(text("""
                            ALTER TABLE users 
                            ADD COLUMN user_type VARCHAR(20) NOT NULL DEFAULT 'parent'
                        """))
                        db.commit()
                        print("GET_DB SUCCESS: user_type column added!")
                    else:
                        print("GET_DB OK: user_type column already exists")
                except Exception as column_error:
                    print(f"GET_DB ERROR checking/adding user_type column: {column_error}")
                    db.rollback()
        except Exception as table_check_error:
            print(f"GET_DB ERROR checking tables: {table_check_error}")
            # 테이블 확인 실패해도 계속 진행 (쿼리 시 오류 처리)
        
        yield db
    except Exception as e:
        print(f"[DB] 데이터베이스 세션 생성 오류: {e}")
        import traceback
        traceback.print_exc()
        if db:
            db.rollback()
        raise
    finally:
        if db:
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
"""
AI 케어비서 백엔드 메인 애플리케이션
FastAPI를 사용하여 RESTful API를 제공합니다.
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback

# 환경 변수 로드
from decouple import config

# FastAPI 앱 생성
app = FastAPI(
    title="AI 케어비서 API",
    description="노인을 위한 AI 기반 통합 케어 서비스 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    debug=True  # 디버그 모드 활성화
)

# 요청 로깅 미들웨어 추가 (CORS 미들웨어보다 먼저)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """모든 요청을 로깅하는 미들웨어"""
    import time
    start_time = time.time()
    
    # 요청 정보 상세 로깅
    print(f"\n{'='*60}")
    print(f"🌐 [{request.method}] {request.url.path}")
    print(f"📍 Origin: {request.headers.get('origin', 'N/A')}")
    print(f"📍 Headers: {dict(request.headers)}")
    
    try:
        response = await call_next(request)
        elapsed = time.time() - start_time
        print(f"✅ [{request.method}] {request.url.path} - Status: {response.status_code} ({elapsed:.3f}s)")
        
        # CORS 헤더 명시적 추가 (이중 보장)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Expose-Headers"] = "*"
        
        print(f"📤 CORS 헤더 추가됨")
        print(f"{'='*60}\n")
        return response
    except Exception as e:
        elapsed = time.time() - start_time
        print(f"❌ [{request.method}] {request.url.path} - 오류: {type(e).__name__}: {str(e)} ({elapsed:.3f}s)")
        import traceback
        traceback.print_exc()
        # 오류 발생 시에도 CORS 헤더 포함한 응답 반환
        from fastapi.responses import JSONResponse
        error_response = JSONResponse(
            status_code=500,
            content={"detail": f"서버 오류: {str(e)}"},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Expose-Headers": "*"
            }
        )
        print(f"📤 오류 응답에 CORS 헤더 추가됨")
        print(f"{'='*60}\n")
        return error_response

# CORS 설정 (프론트엔드 연결용) - 개발용으로 모든 origin 허용
# 미들웨어는 역순으로 실행되므로 나중에 등록해야 먼저 실행됨
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용 (개발용)
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# OPTIONS 요청 명시적 처리 (preflight 요청)
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """CORS preflight 요청 처리"""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600"
        }
    )

# 기본 헬스체크 엔드포인트
@app.get("/")
async def root():
    """API 헬스체크"""
    return {"message": "AI 케어비서 API 서버가 실행 중입니다"}

@app.get("/health")
async def health_check():
    """헬스체크 엔드포인트"""
    return {"status": "healthy"}

@app.get("/test")
async def test_endpoint():
    """테스트 엔드포인트"""
    return {"message": "Test endpoint works", "timestamp": "2024-01-19"}

@app.post("/test-login")
async def test_login():
    """로그인 테스트 엔드포인트"""
    return {
        "access_token": "test_token_123",
        "token_type": "bearer",
        "expires_in": 3600,
        "user_id": 1
    }

# 간단한 로그인 엔드포인트 (데이터베이스 없이 테스트용)
@app.post("/api/auth/login-simple")
async def simple_login(request: Request):
    """간단한 로그인 테스트 엔드포인트 - 데이터베이스 없이 작동"""
    try:
        print(f"📥 [login-simple] 요청 받음")
        body = await request.json()
        username = body.get("username", "")
        password = body.get("password", "")
        
        print(f"📥 [login-simple] username={username}")
        
        # 간단한 테스트 응답
        response = {
            "access_token": "test_token_simple",
            "token_type": "bearer",
            "expires_in": 3600,
            "user_id": 1
        }
        print(f"✅ [login-simple] 응답 전송")
        return response
    except Exception as e:
        print(f"❌ [login-simple] 오류: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

# 데이터베이스 모델 import (테이블 생성용 - 모든 모델을 import해야 테이블이 생성됨)
# 모델들을 먼저 import하여 메타데이터에 등록
try:
    from .models import (
        Base, User, Task, ChatMessage, AIConversation, 
        Guardian, Medicine, MedicineAlarm, NotificationLog
    )
    from .database import engine, create_tables
    from .config import DATABASE_URL
    print("✅ 모델 import 완료")
except Exception as e:
    print(f"❌ 모델 import 오류: {e}")
    import traceback
    traceback.print_exc()

# 애플리케이션 시작 시 테이블 생성
@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 시 실행되는 이벤트"""
    try:
        print("🔄 데이터베이스 테이블 초기화 시작...")
        
        # 데이터베이스 파일 경로 확인
        import os
        db_path = DATABASE_URL.replace("sqlite:///", "")
        if os.path.exists(db_path):
            print(f"📁 기존 데이터베이스 파일 발견: {db_path}")
        else:
            print(f"📁 새 데이터베이스 파일 생성: {db_path}")
        
        # 테이블 생성
        create_tables()
        
        # 생성된 테이블 확인
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        print(f"✅ 데이터베이스 테이블 초기화 완료")
        print(f"📊 생성된 테이블 목록: {existing_tables}")
        
        # users 테이블이 있는지 확인하고 없으면 생성
        if 'users' not in existing_tables:
            print("WARNING: users table not found! Creating manually...")
            # 직접 SQL 실행하여 테이블 생성
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
                print("SUCCESS: users table created manually!")
                
                # 다시 테이블 목록 확인
                inspector = inspect(engine)
                existing_tables = inspector.get_table_names()
                print(f"Updated table list: {existing_tables}")
                
                if 'users' not in existing_tables:
                    print("CRITICAL: users table still not found after creation attempt!")
                else:
                    print("VERIFIED: users table exists!")
            except Exception as table_error:
                print(f"ERROR creating users table: {table_error}")
                import traceback
                traceback.print_exc()
                # 계속 진행 (get_db에서 다시 시도할 것)
            
    except Exception as e:
        print(f"❌ 데이터베이스 초기화 오류: {e}")
        import traceback
        traceback.print_exc()

# CORS 헤더를 포함한 공통 헤더
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "*",
}

# 전역 예외 핸들러 추가
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """전역 예외 핸들러 - 모든 예외를 캐치하여 로깅"""
    print(f"❌ 예외 발생: {type(exc).__name__}: {str(exc)}")
    print(f"📍 경로: {request.method} {request.url}")
    traceback.print_exc()
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": f"서버 내부 오류가 발생했습니다: {str(exc)}",
            "type": type(exc).__name__
        },
        headers=CORS_HEADERS
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """HTTP 예외 핸들러"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=CORS_HEADERS
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """요청 검증 오류 핸들러"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": exc.body},
        headers=CORS_HEADERS
    )

# 라우터 등록
try:
    from .routers import auth, tasks, ai, guardians, medicine
    from .routers import notification_logs
    
    # 인증 라우터 등록
    app.include_router(auth.router, prefix="/api/auth", tags=["인증"])
    print("✅ 인증 라우터 등록 완료")
    
    # 일정 관리 라우터 등록
    app.include_router(tasks.router, prefix="/api/tasks", tags=["일정관리"])
    print("✅ 일정 관리 라우터 등록 완료")
    
    # 약 관리 라우터 등록
    app.include_router(medicine.router, prefix="/api/medicine", tags=["약관리"])
    print("✅ 약 관리 라우터 등록 완료")
    
    # 보호자 관리 라우터 등록
    app.include_router(guardians.router, prefix="/api/guardians", tags=["보호자"])
    print("✅ 보호자 관리 라우터 등록 완료")
    
    # AI 라우터 등록
    app.include_router(ai.router, prefix="/api/ai", tags=["AI분석"])
    print("✅ AI 라우터 등록 완료")
    
    # 알림 로그 라우터 등록
    app.include_router(notification_logs.router, prefix="/api/notification-logs", tags=["알림로그"])
    print("✅ 알림 로그 라우터 등록 완료")
    
except Exception as e:
    print(f"❌ 라우터 등록 오류: {e}")
    import traceback
    traceback.print_exc()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
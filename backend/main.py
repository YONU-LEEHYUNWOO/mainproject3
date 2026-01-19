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
    debug=True,  # 디버그 모드 활성화
    swagger_ui_init_oauth={
        "clientId": "swagger-ui",
        "usePkceWithAuthorizationCodeGrant": False,
    }
)

# 요청 로깅 미들웨어 추가 (CORS 미들웨어보다 먼저)
# 로거 import를 모듈 레벨로 이동 (캐시 문제 방지)
from utils.logger import log_info, log_error

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """모든 요청을 로깅하는 미들웨어 - uvicorn 기본 로거와 충돌하지 않도록 안전한 로깅"""
    import time
    
    start_time = time.time()
    
    # 요청 로그 출력
    log_info(f"[{request.method}] {request.url.path} - Origin: {request.headers.get('origin', 'N/A')}")
    
    try:
        response = await call_next(request)
        elapsed = time.time() - start_time
        
        # 성공 로그 출력
        log_info(f"[{request.method}] {request.url.path} - Status: {response.status_code} ({elapsed:.3f}s)")
        
        # CORS 헤더 명시적 추가 (이중 보장)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Expose-Headers"] = "*"
        
        return response
    except Exception as e:
        elapsed = time.time() - start_time
        # 에러 로그 출력 (traceback 포함)
        log_error(
            f"[{request.method}] {request.url.path} - 오류: {type(e).__name__}: {str(e)} ({elapsed:.3f}s)",
            exc_info=e
        )
        
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
        return error_response

# CORS 설정 (프론트엔드 연결용)
# 프론트엔드 URL을 명시적으로 허용 (개발 환경)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite 기본 포트
        "http://localhost:3000",  # React 기본 포트
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,  # 쿠키 및 인증 정보 허용
    allow_methods=["*"],  # GET, POST, PUT, PATCH, DELETE, OPTIONS 모두 허용
    allow_headers=["*"],  # 모든 헤더 허용
    expose_headers=["*"],  # 모든 헤더 노출
)

# OPTIONS 요청은 CORSMiddleware가 자동으로 처리하므로 별도 핸들러 불필요
# 필요시 라우터 등록 후에 추가 가능

# 기본 헬스체크 엔드포인트
@app.get("/")
async def root():
    """API 헬스체크"""
    import sys
    import logging
    
    logger = logging.getLogger("uvicorn.access")
    
    msg = "✅ [ROOT] / 엔드포인트 호출됨"
    
    # 여러 방법으로 출력
    sys.stderr.write(f"{'='*60}\n{msg}\n{'='*60}\n")
    sys.stderr.flush()
    logger.info(msg)
    print(f"{'='*60}\n{msg}\n{'='*60}\n", flush=True)
    
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
    from models import (
        Base, User, Task, ChatMessage, AIConversation, 
        Guardian, Medicine, MedicineAlarm, NotificationLog
    )
    from database import engine, create_tables
    from config import DATABASE_URL
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
        # 상대 import 사용 (run.py에서 sys.path 추가 후 모듈로 실행)
        # 이미 상단에서 import한 것을 사용
        db_path = DATABASE_URL.replace("sqlite:///", "")
        if os.path.exists(db_path):
            print(f"📁 기존 데이터베이스 파일 발견: {db_path}")
        else:
            print(f"📁 새 데이터베이스 파일 생성: {db_path}")
        
        # 테이블 생성 (이미 상단에서 import한 create_tables 사용)
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
    """전역 예외 핸들러 - 모든 예외를 캐치하여 로깅 및 traceback 출력"""
    import io
    from utils.logger import log_error
    from utils.serializer import serialize_datetime_objects
    
    # 에러 로그 출력 (traceback 포함)
    log_error(
        f"전역 예외 발생 - {type(exc).__name__}: {str(exc)} | 경로: {request.method} {request.url.path}",
        exc_info=exc
    )
    
    # 스택 트레이스 캡처
    error_trace = io.StringIO()
    traceback.print_exc(file=error_trace)
    error_trace_str = error_trace.getvalue()
    
    # 오류 응답 content 생성
    error_content = {
        "detail": {
            "message": f"서버 내부 오류가 발생했습니다: {str(exc)}",
            "error_type": type(exc).__name__,
            "error_message": str(exc),
            "path": f"{request.method} {request.url.path}",
            "traceback": error_trace_str.split('\n')[-15:] if len(error_trace_str.split('\n')) > 15 else error_trace_str.split('\n')
        }
    }
    
    # datetime 객체 변환 후 JSON 직렬화
    error_content = serialize_datetime_objects(error_content)
    
    # 프론트엔드에서 확인할 수 있도록 상세 오류 정보 포함
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_content,
        headers=CORS_HEADERS
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """HTTP 예외 핸들러"""
    # detail이 이미 딕셔너리인 경우 그대로 사용, 문자열인 경우 메시지로 변환
    detail = exc.detail if isinstance(exc.detail, dict) else {"message": str(exc.detail)}
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": detail},
        headers=CORS_HEADERS
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """요청 검증 오류 핸들러"""
    from utils.serializer import serialize_datetime_objects
    from utils.logger import log_error
    
    # 검증 오류 로그 출력
    log_error(
        f"요청 검증 오류 - 경로: {request.method} {request.url.path}",
        exc_info=exc
    )
    
    # body를 JSON 직렬화 가능한 형태로 변환
    body_for_json = exc.body
    if body_for_json is not None:
        try:
            # datetime 객체를 재귀적으로 변환
            body_for_json = serialize_datetime_objects(body_for_json)
        except Exception as e:
            # 변환 실패 시 문자열로 변환
            body_for_json = str(body_for_json)
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "body": body_for_json},
        headers=CORS_HEADERS
    )

# 라우터 등록
# run.py에서 sys.path에 backend 폴더를 추가하므로 절대 import 사용
print("\n" + "="*60)
print("🔄 라우터 등록 시작...")
print("="*60)

try:
    # 라우터를 직접 import (routers 패키지 경유)
    # run.py에서 sys.path에 backend를 추가하므로 routers.auth로 import 가능
    print("📦 라우터 모듈 import 시도...")
    
    # 인증 라우터 import 및 등록
    try:
        import routers.auth as auth
        print(f"  ✅ auth 모듈 import 성공, router 타입: {type(auth.router)}")
        print(f"  📍 auth 라우터 경로: {[r.path for r in auth.router.routes]}")
        app.include_router(auth.router, prefix="/api/auth", tags=["인증"])
        print("✅ 인증 라우터 등록 완료: /api/auth")
    except Exception as e:
        print(f"❌ auth 라우터 import/등록 오류: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    
    # 일정 관리 라우터 import 및 등록
    try:
        import routers.tasks as tasks
        app.include_router(tasks.router, prefix="/api/tasks", tags=["일정관리"])
        print("✅ 일정 관리 라우터 등록 완료: /api/tasks")
    except Exception as e:
        print(f"❌ tasks 라우터 import/등록 오류: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    
    # 약 관리 라우터 import 및 등록
    try:
        import routers.medicine as medicine
        app.include_router(medicine.router, prefix="/api/medicine", tags=["약관리"])
        print("✅ 약 관리 라우터 등록 완료: /api/medicine")
    except Exception as e:
        print(f"❌ medicine 라우터 import/등록 오류: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    
    # 보호자 관리 라우터 import 및 등록
    try:
        import routers.guardians as guardians
        app.include_router(guardians.router, prefix="/api/guardians", tags=["보호자"])
        print("✅ 보호자 관리 라우터 등록 완료: /api/guardians")
    except Exception as e:
        print(f"❌ guardians 라우터 import/등록 오류: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    
    # AI 라우터 import 및 등록
    try:
        import routers.ai as ai
        app.include_router(ai.router, prefix="/api/ai", tags=["AI분석"])
        print("✅ AI 라우터 등록 완료: /api/ai")
    except Exception as e:
        print(f"❌ ai 라우터 import/등록 오류: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    
    # 알림 로그 라우터 import 및 등록
    try:
        import routers.notification_logs as notification_logs
        app.include_router(notification_logs.router, prefix="/api/notification-logs", tags=["알림로그"])
        print("✅ 알림 로그 라우터 등록 완료: /api/notification-logs")
    except Exception as e:
        print(f"❌ notification_logs 라우터 import/등록 오류: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n✅ 라우터 등록 프로세스 완료!")
    
    print("\n✅ 모든 라우터 등록 완료!")
    
    # 등록된 라우터 확인
    print(f"\n📋 등록된 라우터 목록:")
    auth_routes = [r for r in app.routes if hasattr(r, 'path') and '/api/auth' in r.path]
    print(f"  🔐 인증 라우터 ({len(auth_routes)}개):")
    for route in auth_routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            methods = ', '.join(route.methods) if route.methods else 'N/A'
            print(f"    - {methods} {route.path}")
    
    all_routes = [r for r in app.routes if hasattr(r, 'path') and hasattr(r, 'methods')]
    print(f"\n  📊 전체 라우터 개수: {len(all_routes)}개")
    for route in all_routes[:10]:  # 처음 10개만 출력
        methods = ', '.join(route.methods) if route.methods else 'N/A'
        print(f"    - {methods} {route.path}")
    if len(all_routes) > 10:
        print(f"    ... 외 {len(all_routes) - 10}개")
    
    print("="*60 + "\n")
    
except Exception as e:
    print(f"\n❌ 라우터 등록 오류: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
    print("="*60 + "\n")
    # 오류가 발생해도 서버는 계속 실행 (디버깅용)

# Swagger UI에서 Bearer 토큰을 직접 입력할 수 있도록 OpenAPI 스키마 수정
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    from fastapi.openapi.utils import get_openapi
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    
    # Security scheme 추가
    openapi_schema["components"]["securitySchemes"] = {
        "Bearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "JWT 토큰을 입력하세요. 형식: Bearer {token}"
        }
    }
    
    # 모든 엔드포인트에 security 적용 (인증이 필요한 경우)
    # 인증이 필요하지 않은 엔드포인트는 제외
    for path, path_item in openapi_schema["paths"].items():
        for method, operation in path_item.items():
            if isinstance(operation, dict) and "security" not in operation:
                # 인증이 필요한 엔드포인트만 security 추가
                if path.startswith("/api/") and path not in ["/api/auth/login", "/api/auth/register", "/api/auth/login-simple"]:
                    operation["security"] = [{"Bearer": []}]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
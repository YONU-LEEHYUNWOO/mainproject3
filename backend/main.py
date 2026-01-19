"""
AI 케어비서 백엔드 메인 애플리케이션
FastAPI를 사용하여 RESTful API를 제공합니다.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 라우터 임포트 (아직 생성되지 않음)
# from routers import auth, tasks, ai, guardians, medicine

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

# CORS 설정 (프론트엔드 연결용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],  # React 개발 서버
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 허용
    allow_headers=["*"],  # 모든 헤더 허용
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

# 라우터 등록
from .routers import auth, tasks, ai, guardians, medicine, notification_logs

app.include_router(auth.router, prefix="/api/auth", tags=["인증"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["일정관리"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI분석"])
app.include_router(guardians.router, prefix="/api/guardians", tags=["보호자"])
app.include_router(medicine.router, prefix="/api/medicine", tags=["약관리"])
app.include_router(notification_logs.router, prefix="/api/notification-logs", tags=["알림로그"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
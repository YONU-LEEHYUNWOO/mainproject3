#!/usr/bin/env python
"""
간단한 FastAPI 앱 - SQLAlchemy 없이 테스트용
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# FastAPI 앱 생성
app = FastAPI(
    title="AI 케어비서 API",
    description="노인을 위한 AI 기반 통합 케어 서비스 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 기본 엔드포인트들
@app.get("/")
async def root():
    return {"message": "AI 케어비서 API 서버가 실행 중입니다"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/test")
async def test_endpoint():
    return {"message": "테스트 엔드포인트 작동 중"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
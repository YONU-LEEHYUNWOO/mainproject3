# 백엔드 서버 실행 및 확인 가이드

## 📋 백엔드 개요

AI 케어비서 백엔드 서버는 FastAPI 기반으로 구축되었으며, 다음과 같은 기능을 제공합니다:

- 🔐 **JWT 인증 시스템**
- 🤖 **Google Gemini AI 통합**
- 💾 **SQLite 데이터베이스**
- 📅 **일정 관리**
- 💊 **약 관리**
- 👥 **보호자 관리**
- 💬 **AI 채팅**

## 🚀 서버 실행

### 1. 환경 설정
프로젝트 루트에서 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# 백엔드 환경 변수들
DATABASE_URL=sqlite:///./backend/care_assistant.db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash
DEBUG=True
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# 프론트엔드 환경 변수들 (필요시)
VITE_API_BASE_URL=http://localhost:8000
```

### 2. 백엔드 서버 실행
```bash
# 백엔드 폴더로 이동
cd backend

# 서버 실행
python run.py
```

서버가 정상 실행되면 다음과 같은 메시지가 표시됩니다:
```
INFO:     Will watch for changes in these directories: ['C:\Users\leeks\Desktop\함께잇다(프론트+백엔)\backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [PID] using WatchFiles
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## 🔍 서버 상태 확인

### 1. 기본 상태 확인
```bash
# 루트 엔드포인트
curl http://localhost:8000/

# 헬스체크
curl http://localhost:8000/health
```

### 2. AI 서비스 상태 확인
```bash
curl http://localhost:8000/api/ai/health
```

정상 응답 예시:
```json
{
  "status": "healthy",
  "model": "gemini-2.5-flash",
  "response_time": 3.538
}
```

### 3. API 문서 확인
브라우저에서 다음 URL을 열어 API 문서를 확인하세요:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🧪 테스트 및 디버깅

### API 테스트 스크립트 실행
```bash
# 프로젝트 루트에서
python test_api.py
```

### AI 기능 직접 테스트
```bash
python test_ai_direct.py
```

### 환경 변수 확인
```bash
python check_env_simple.py
```

## 📊 데이터베이스 관리

### 데이터베이스 초기화
```bash
# 백엔드 폴더에서
python init_db.py
```

### Alembic 마이그레이션 (필요시)
```bash
# 마이그레이션 생성
alembic revision --autogenerate -m "설명"

# 마이그레이션 적용
alembic upgrade head
```

## 🔧 문제 해결

### 일반적인 문제들

#### 1. `ModuleNotFoundError` 발생
```bash
pip install -r requirements.txt
```

#### 2. `email-validator` 오류
```bash
pip install email-validator
```

#### 3. AI 기능 비활성화 (`model: "disabled"`)
- `.env` 파일에 `GEMINI_API_KEY`가 제대로 설정되었는지 확인
- 서버 재시작

#### 4. 포트 충돌
서버 실행 시 다른 포트 사용:
```bash
python -c "import uvicorn; uvicorn.run('backend.main:app', host='0.0.0.0', port=8001)"
```

### 서버 강제 종료
```bash
# 모든 Python 프로세스 종료
taskkill /f /im python.exe
```

## 🌐 API 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/` | GET | 서버 상태 확인 |
| `/health` | GET | 헬스체크 |
| `/docs` | GET | API 문서 (Swagger) |
| `/redoc` | GET | API 문서 (ReDoc) |
| `/api/auth/login` | POST | 사용자 로그인 |
| `/api/auth/register` | POST | 사용자 등록 |
| `/api/auth/me` | GET | 현재 사용자 정보 |
| `/api/tasks/` | GET/POST | 일정 관리 |
| `/api/ai/analyze` | POST | 텍스트 분석 |
| `/api/ai/chat` | POST | AI 채팅 |
| `/api/ai/health` | GET | AI 서비스 상태 |
| `/api/guardians/` | GET/POST | 보호자 관리 |
| `/api/medicine/` | GET/POST | 약 관리 |

## 🎯 개발 팁

- 서버는 자동 재시작을 지원하므로 코드 수정 시 자동으로 반영됩니다
- 로그는 터미널에서 실시간으로 확인할 수 있습니다
- API 테스트는 Swagger UI에서 직접 수행할 수 있습니다
- 데이터베이스 파일은 `backend/care_assistant.db`에 저장됩니다

## 📞 지원

문제가 발생하면 다음 순서로 확인하세요:
1. 서버 로그 확인
2. API 테스트 스크립트 실행
3. 환경 변수 확인
4. 데이터베이스 상태 확인
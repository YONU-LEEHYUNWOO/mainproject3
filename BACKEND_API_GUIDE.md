# 🔧 **백엔드 API 개발 가이드**
## FastAPI 기반 Dual App 백엔드 시스템

### 🎯 **목적**
부모용 앱과 자식용 앱을 위한 완전히 분리된 API 엔드포인트 제공 및 데이터 관리

---

## 🏗️ **프로젝트 구조**

```
backend/
├── 🐍 app/
│   ├── 🔑 auth/                     # 인증 시스템
│   │   ├── __init__.py
│   │   ├── models.py                # User, Guardian 모델
│   │   ├── schemas.py               # 인증 스키마
│   │   ├── router.py                # /api/auth/*
│   │   └── dependencies.py          # 인증 의존성
│   ├── 👨‍👩‍👧‍👦 family/                 # 가족 관리
│   │   ├── __init__.py
│   │   ├── models.py                # FamilyLink 모델
│   │   ├── schemas.py               # 가족 스키마
│   │   ├── router.py                # /api/shared/family/*
│   │   └── service.py               # 가족 서비스 로직
│   ├── 👴 parent/                   # 부모 앱 API
│   │   ├── __init__.py
│   │   ├── models.py                # Schedule, Activity, AIRecommendation, SafetyEvent
│   │   ├── schemas.py               # 부모 앱 스키마
│   │   ├── router.py                # /api/parent/*
│   │   ├── services/
│   │   │   ├── ai_service.py        # AI 추천 서비스
│   │   │   ├── safety_service.py    # 안전 감지 서비스
│   │   │   └── location_service.py  # 위치 서비스
│   │   └── dependencies.py          # 부모 앱 의존성
│   ├── 👨 child/                    # 자식 앱 API
│   │   ├── __init__.py
│   │   ├── models.py                # MonitoringData, Report, Message
│   │   ├── schemas.py               # 자식 앱 스키마
│   │   ├── router.py                # /api/child/*
│   │   ├── services/
│   │   │   ├── monitoring_service.py # 모니터링 서비스
│   │   │   ├── report_service.py     # 리포트 서비스
│   │   │   └── websocket_service.py  # 실시간 서비스
│   │   └── dependencies.py          # 자식 앱 의존성
│   ├── 🤖 ai/                       # AI 엔진
│   │   ├── __init__.py
│   │   ├── recommendation_engine.py # 추천 엔진
│   │   ├── pattern_analyzer.py      # 패턴 분석
│   │   └── safety_detector.py       # 안전 감지
│   ├── 🗄️ database/                 # 데이터베이스
│   │   ├── __init__.py
│   │   ├── connection.py            # DB 연결
│   │   ├── parent_db.py             # 부모 DB 세션
│   │   ├── child_db.py              # 자식 DB 세션
│   │   └── migrations/              # Alembic 마이그레이션
│   ├── 🌐 external/                 # 외부 API 연동
│   │   ├── weather_api.py           # 날씨 API
│   │   ├── transport_api.py         # 교통 API
│   │   └── map_api.py               # 지도 API
│   └── ⚙️ config/                   # 설정
│       ├── __init__.py
│       ├── settings.py              # 환경 설정
│       └── constants.py             # 상수 정의
├── 🧪 tests/                        # 테스트
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_parent_api.py
│   ├── test_child_api.py
│   └── test_ai_services.py
├── 📋 docs/                         # API 문서
├── 📦 requirements.txt              # 의존성
├── 🏃 main.py                       # FastAPI 앱
├── 🔄 run.py                        # 실행 스크립트
└── 📖 README.md                     # 프로젝트 설명
```

---

## 🗄️ **데이터베이스 설계**

### **공통 데이터베이스 (shared.db)**
```sql
-- 사용자 테이블 (부모와 자식 모두)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(20) NOT NULL, -- 'parent' or 'guardian'
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 가족 연결 테이블
CREATE TABLE family_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER NOT NULL,
    guardian_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    relationship VARCHAR(50), -- son, daughter, spouse, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id),
    FOREIGN KEY (guardian_id) REFERENCES users(id),
    UNIQUE(parent_id, guardian_id)
);

-- 건강 데이터 공유 테이블
CREATE TABLE health_sync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    data_value TEXT,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **부모 앱 데이터베이스 (parent.db)**
```sql
-- 일정 테이블
CREATE TABLE schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- hospital, medicine, activity
    scheduled_at TIMESTAMP NOT NULL,
    location VARCHAR(255),
    description TEXT,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 활동 로그 테이블
CREATE TABLE activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    accuracy DECIMAL(5,2),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration INTEGER, -- seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI 추천 기록 테이블
CREATE TABLE ai_recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    context_data TEXT, -- JSON string
    was_accepted BOOLEAN,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 안전 이벤트 테이블
CREATE TABLE safety_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **자식 앱 데이터베이스 (child.db)**
```sql
-- 모니터링 데이터 테이블
CREATE TABLE monitoring_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER NOT NULL,
    guardian_id INTEGER NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    accuracy DECIMAL(5,2),
    activity_level DECIMAL(3,2), -- 0.0 to 1.0
    status VARCHAR(20) NOT NULL, -- moving, resting, sleeping, etc.
    battery_level INTEGER, -- 0-100
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id),
    FOREIGN KEY (guardian_id) REFERENCES users(id)
);

-- 리포트 테이블
CREATE TABLE reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER NOT NULL,
    guardian_id INTEGER NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    data_summary TEXT, -- JSON string
    activity_score DECIMAL(3,2),
    safety_score DECIMAL(3,2),
    social_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id),
    FOREIGN KEY (guardian_id) REFERENCES users(id)
);

-- 메시지 테이블
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    message_type VARCHAR(20) NOT NULL, -- text, voice, action_request
    content TEXT NOT NULL,
    voice_url VARCHAR(500), -- for voice messages
    action_type VARCHAR(50), -- walk, eat, rest, etc.
    read_status BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

---

## 🔌 **API 엔드포인트 구조**

### **FastAPI 앱 설정**
```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.router import router as auth_router
from app.family.router import router as family_router
from app.parent.router import router as parent_router
from app.child.router import router as child_router

app = FastAPI(
    title="AI 케어비서 Dual App API",
    description="부모용과 자식용 앱을 위한 통합 API",
    version="1.0.0"
)

# CORS 설정 (개발용 - 실제 운영시 더 엄격하게)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React 개발 서버
        "http://localhost:5173",  # Vite 개발 서버
        "exp://localhost:8081",   # Expo React Native
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth_router, prefix="/api/auth", tags=["인증"])
app.include_router(family_router, prefix="/api/shared/family", tags=["가족관리"])
app.include_router(parent_router, prefix="/api/parent", tags=["부모앱"])
app.include_router(child_router, prefix="/api/child", tags=["자식앱"])

@app.get("/")
async def root():
    return {"message": "AI 케어비서 Dual App API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

---

## 🔑 **인증 시스템**

### **JWT 기반 인증**
```python
# app/auth/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20), nullable=False)  # 'parent' or 'guardian'
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# app/auth/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str
    type: str  # 'parent' or 'guardian'

class User(UserBase):
    id: int
    type: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
```

### **인증 라우터**
```python
# app/auth/router.py
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.auth import schemas, models, service
from app.database.connection import get_db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.post("/register", response_model=schemas.User)
async def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """사용자 등록"""
    db_user = service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 비밀번호 해싱
    hashed_password = service.hash_password(user.password)

    # 사용자 생성
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        phone=user.phone,
        type=user.type
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/token", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """로그인 토큰 발급"""
    user = service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=service.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = service.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(service.get_current_user)):
    """현재 사용자 정보"""
    return current_user

@router.get("/users/", response_model=list[schemas.User])
async def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """사용자 목록 (관리자용)"""
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users
```

---

## 👴 **부모 앱 API**

### **일정 관리 API**
```python
# app/parent/router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.parent import schemas, models, service
from app.database.parent_db import get_parent_db
from app.auth.dependencies import get_current_parent_user

router = APIRouter()

@router.get("/schedules/today", response_model=List[schemas.Schedule])
async def get_today_schedules(
    db: Session = Depends(get_parent_db),
    current_user = Depends(get_current_parent_user)
):
    """오늘의 일정 조회"""
    schedules = service.get_today_schedules(db, current_user.id)
    return schedules

@router.post("/schedules/confirm")
async def confirm_schedule(
    schedule_id: int,
    confirmed: bool,
    db: Session = Depends(get_parent_db),
    current_user = Depends(get_current_parent_user)
):
    """일정 확인/취소"""
    result = service.confirm_schedule(db, schedule_id, current_user.id, confirmed)
    if not result:
        raise HTTPException(status_code=404, detail="Schedule not found")

    # 자식 앱에 일정 상태 업데이트 알림
    await service.notify_guardians_schedule_update(schedule_id, confirmed)

    return {"message": "Schedule confirmed" if confirmed else "Schedule cancelled"}

@router.post("/activities/log")
async def log_activity(
    activity: schemas.ActivityCreate,
    db: Session = Depends(get_parent_db),
    current_user = Depends(get_current_parent_user)
):
    """활동 로그 기록"""
    db_activity = models.Activity(
        user_id=current_user.id,
        activity_type=activity.activity_type,
        description=activity.description,
        location_lat=activity.location_lat,
        location_lng=activity.location_lng,
        accuracy=activity.accuracy,
        started_at=activity.started_at
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)

    # 실시간으로 자식 앱에 활동 업데이트 전송
    await service.broadcast_activity_update(current_user.id, db_activity)

    return db_activity

@router.get("/ai/recommend", response_model=List[schemas.AIRecommendation])
async def get_ai_recommendations(
    context: schemas.AIContext,
    db: Session = Depends(get_parent_db),
    current_user = Depends(get_current_parent_user)
):
    """AI 추천 받기"""
    recommendations = await service.generate_recommendations(
        db, current_user.id, context
    )
    return recommendations

@router.post("/safety/emergency")
async def report_emergency(
    emergency: schemas.EmergencyReport,
    db: Session = Depends(get_parent_db),
    current_user = Depends(get_current_parent_user)
):
    """긴급 상황 보고"""
    # 안전 이벤트 기록
    db_event = models.SafetyEvent(
        user_id=current_user.id,
        event_type="emergency",
        severity="critical",
        title=emergency.title,
        description=emergency.description,
        location_lat=emergency.location_lat,
        location_lng=emergency.location_lng
    )
    db.add(db_event)
    db.commit()

    # 모든 보호자에게 긴급 알림 전송
    await service.send_emergency_alert_to_guardians(current_user.id, db_event)

    return {"message": "Emergency reported", "event_id": db_event.id}
```

---

## 👨 **자식 앱 API**

### **모니터링 API**
```python
# app/child/router.py
from fastapi import APIRouter, Depends, HTTPException, WebSocket
from sqlalchemy.orm import Session
from typing import List
from app.child import schemas, models, service
from app.database.child_db import get_child_db
from app.auth.dependencies import get_current_guardian_user

router = APIRouter()

@router.get("/dashboard/summary", response_model=schemas.DashboardSummary)
async def get_dashboard_summary(
    db: Session = Depends(get_child_db),
    current_user = Depends(get_current_guardian_user)
):
    """대시보드 요약 정보"""
    # 연결된 부모들 조회
    parent_ids = service.get_connected_parent_ids(db, current_user.id)

    summary = await service.generate_dashboard_summary(db, parent_ids)
    return summary

@router.get("/monitoring/location", response_model=schemas.LocationData)
async def get_current_location(
    parent_id: int,
    db: Session = Depends(get_child_db),
    current_user = Depends(get_current_guardian_user)
):
    """부모 현재 위치 조회"""
    # 권한 확인: 이 보호자가 해당 부모를 모니터링할 수 있는지
    if not service.can_monitor_parent(db, current_user.id, parent_id):
        raise HTTPException(status_code=403, detail="Not authorized to monitor this parent")

    location = service.get_latest_location(db, parent_id)
    return location

@router.post("/schedules/create", response_model=schemas.Schedule)
async def create_schedule(
    schedule: schemas.ScheduleCreate,
    db: Session = Depends(get_child_db),
    current_user = Depends(get_current_guardian_user)
):
    """일정 생성"""
    # 부모 권한 확인
    if not service.can_manage_parent_schedules(db, current_user.id, schedule.parent_id):
        raise HTTPException(status_code=403, detail="Not authorized to manage schedules")

    db_schedule = models.Schedule(
        user_id=schedule.parent_id,
        guardian_id=current_user.id,
        title=schedule.title,
        type=schedule.type,
        scheduled_at=schedule.scheduled_at,
        location=schedule.location,
        description=schedule.description
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)

    # 부모 앱에 일정 추가 알림
    await service.notify_parent_new_schedule(schedule.parent_id, db_schedule)

    return db_schedule

@router.get("/reports/generate", response_model=schemas.Report)
async def generate_report(
    parent_id: int,
    report_type: str = "weekly",
    db: Session = Depends(get_child_db),
    current_user = Depends(get_current_guardian_user)
):
    """리포트 생성"""
    if not service.can_monitor_parent(db, current_user.id, parent_id):
        raise HTTPException(status_code=403, detail="Not authorized")

    report = await service.generate_report(db, parent_id, report_type)
    return report

@router.post("/messages/send")
async def send_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_child_db),
    current_user = Depends(get_current_guardian_user)
):
    """메시지 전송"""
    # 메시지 저장
    db_message = models.Message(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        message_type=message.message_type,
        content=message.content,
        action_type=message.action_type
    )
    db.add(db_message)
    db.commit()

    # 부모 앱에 실시간 메시지 전송
    await service.send_message_to_parent(message.receiver_id, db_message)

    return {"message": "Message sent", "message_id": db_message.id}
```

---

## 🤖 **AI 엔진**

### **추천 엔진**
```python
# app/ai/recommendation_engine.py
from typing import List, Dict, Any
from datetime import datetime, time
from app.ai.pattern_analyzer import PatternAnalyzer

class RecommendationEngine:
    def __init__(self):
        self.pattern_analyzer = PatternAnalyzer()

    async def generate_recommendations(
        self,
        db: Session,
        user_id: int,
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """맞춤 추천 생성"""

        recommendations = []

        # 현재 시간 기반 추천
        current_time = context.get('current_time', datetime.now().time())

        if self._is_meal_time(current_time):
            # 식사 시간 추천
            meal_rec = await self._generate_meal_recommendation(db, user_id, context)
            if meal_rec:
                recommendations.append(meal_rec)

        elif self._is_activity_time(current_time):
            # 활동 추천
            activity_rec = await self._generate_activity_recommendation(db, user_id, context)
            if activity_rec:
                recommendations.append(activity_rec)

        # 패턴 기반 추천
        pattern_recs = await self._generate_pattern_based_recommendations(db, user_id)
        recommendations.extend(pattern_recs)

        return recommendations

    def _is_meal_time(self, current_time: time) -> bool:
        """식사 시간 판단"""
        breakfast = time(7, 0) <= current_time <= time(9, 0)
        lunch = time(11, 30) <= current_time <= time(13, 30)
        dinner = time(17, 30) <= current_time <= time(19, 30)
        return breakfast or lunch or dinner

    def _is_activity_time(self, current_time: time) -> bool:
        """활동 시간 판단"""
        morning = time(9, 0) <= current_time <= time(11, 0)
        afternoon = time(14, 0) <= current_time <= time(16, 0)
        return morning or afternoon

    async def _generate_meal_recommendation(
        self, db: Session, user_id: int, context: Dict
    ) -> Dict[str, Any]:
        """식사 추천 생성"""
        location = context.get('location')

        # 주변 식당 검색 (실제로는 외부 API 연동)
        nearby_restaurants = await self._find_nearby_restaurants(location)

        if nearby_restaurants:
            return {
                "type": "meal",
                "title": f"{nearby_restaurants[0]['name']} 어떠세요?",
                "description": f"현재 위치에서 {nearby_restaurants[0]['distance']}km 거리에 있는 맛집입니다.",
                "action": "restaurant_details",
                "data": nearby_restaurants[0]
            }

        return None
```

---

## 🔄 **실시간 WebSocket**

### **WebSocket 매니저**
```python
# app/child/services/websocket_service.py
from fastapi import WebSocket
import json
from typing import Dict, List
from datetime import datetime

class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}  # user_id -> connections

    async def connect(self, websocket: WebSocket, user_id: int):
        """WebSocket 연결"""
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        """WebSocket 연결 해제"""
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast_to_user(self, user_id: int, message: Dict):
        """특정 사용자에게 메시지 브로드캐스트"""
        if user_id in self.active_connections:
            message_data = json.dumps({
                **message,
                "timestamp": datetime.now().isoformat()
            })

            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(message_data)
                except Exception as e:
                    print(f"Failed to send message to user {user_id}: {e}")

    async def broadcast_activity_update(self, user_id: int, activity_data: Dict):
        """활동 업데이트 브로드캐스트"""
        await self.broadcast_to_user(user_id, {
            "type": "activity_update",
            "data": activity_data
        })

    async def broadcast_location_update(self, user_id: int, location_data: Dict):
        """위치 업데이트 브로드캐스트"""
        await self.broadcast_to_user(user_id, {
            "type": "location_update",
            "data": location_data
        })

    async def broadcast_alert(self, user_id: int, alert_data: Dict):
        """알림 브로드캐스트"""
        await self.broadcast_to_user(user_id, {
            "type": "alert",
            "data": alert_data
        })

# 전역 WebSocket 매니저 인스턴스
ws_manager = WebSocketManager()
```

---

## 📋 **개발 단계별 작업**

### **Phase BE-1: 기반 구축 (1주)**
- [ ] FastAPI 프로젝트 구조 생성
- [ ] 데이터베이스 스키마 설계 및 마이그레이션
- [ ] 인증 시스템 구현 (JWT)
- [ ] 가족 연결 기능 구현

### **Phase BE-2: 부모 앱 API (1주)**
- [ ] 일정 관리 API 구현
- [ ] 활동 로그 API 구현
- [ ] AI 추천 API 구현
- [ ] 안전 감지 API 구현

### **Phase BE-3: 자식 앱 API (1주)**
- [ ] 모니터링 API 구현
- [ ] 일정 관리 API 구현
- [ ] 리포트 생성 API 구현
- [ ] 메시지 전송 API 구현

### **Phase BE-4: AI 엔진 개발 (1주)**
- [ ] 추천 엔진 구현
- [ ] 패턴 분석기 구현
- [ ] 안전 감지기 구현
- [ ] 외부 API 연동

### **Phase BE-5: 실시간 기능 (1주)**
- [ ] WebSocket 연결 구현
- [ ] 실시간 데이터 전송
- [ ] 알림 시스템 구현
- [ ] 연결 관리 및 재연결

### **Phase BE-6: 외부 API 연동 (1주)**
- [ ] 날씨 API 연동
- [ ] 교통 정보 API 연동
- [ ] 지도 API 연동
- [ ] 택시 호출 API 연동

### **Phase BE-7: 테스트 및 최적화 (1주)**
- [ ] API 테스트 작성
- [ ] 성능 최적화
- [ ] 에러 처리 강화
- [ ] 보안 강화

---

## 🎯 **완성 기준**

### **API 완성도**
- [ ] 인증 시스템 작동
- [ ] 부모 앱 API 완성 (일정, 활동, AI, 안전)
- [ ] 자식 앱 API 완성 (모니터링, 일정, 리포트, 메시지)
- [ ] 실시간 WebSocket 작동
- [ ] 외부 API 연동 성공

### **데이터 관리**
- [ ] 분리된 DB 구조 작동
- [ ] 데이터 일관성 유지
- [ ] 마이그레이션 자동화
- [ ] 백업/복구 기능

### **성능 및 안정성**
- [ ] API 응답 시간 500ms 이내
- [ ] 동시 접속 1000명 지원
- [ ] 메모리 누수 없음
- [ ] 자동 재시작 및 복구

---

**🎯 목표:** 부모용과 자식용 앱을 완벽하게 지원하는 확장 가능하고 안정적인 Dual App 백엔드 API 완성
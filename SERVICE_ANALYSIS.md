# 🔍 전체 서비스 분석 및 기능 배치 가이드

## 📋 목차
1. [현재 구현 상태](#현재-구현-상태)
2. [필요한 기능 분석](#필요한-기능-분석)
3. [부모/자식 앱 기능 배치](#부모자식-앱-기능-배치)
4. [작업 분리 원칙](#작업-분리-원칙)
5. [Merge 충돌 방지 전략](#merge-충돌-방지-전략)

---

## ✅ 현재 구현 상태

### 백엔드 (Backend)

#### 구현된 API 엔드포인트
- ✅ **인증**: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- ✅ **일정 관리**: `/api/tasks/` (CRUD), `/api/tasks/{id}/complete`, `/api/tasks/today/count`
- ✅ **약 관리**: `/api/medicine/alarms/` (CRUD), `/api/medicine/today`, `/api/medicine/due-now`
- ✅ **보호자 관리**: `/api/guardians/` (CRUD), `/api/guardians/{id}/primary`
- ✅ **AI 채팅**: `/api/ai/chat`, `/api/ai/analyze`, `/api/ai/schedule-extract`
- ✅ **알림 로그**: `/api/notification-logs/` (CRUD)

#### 구현된 모델
- ✅ `User` - 사용자 모델 (user_type: parent/child)
- ✅ `Task` - 일정 모델
- ✅ `MedicineAlarm` - 약 알림 모델
- ✅ `Guardian` - 보호자 모델
- ✅ `AIConversation` - AI 대화 모델
- ✅ `ChatMessage` - 채팅 메시지 모델
- ✅ `NotificationLog` - 알림 로그 모델

#### 미완료/오류 상태
- ❌ 일정 완료 토글 CORS 오류 (PATCH 메서드)
- ❌ 일정 생성 시 Time 필드 처리 문제 (현재 제거됨)
- ⚠️ 약 알림 스케줄링 미구현 (모델만 존재)
- ⚠️ 알림 설정 API 미구현

---

### 프론트엔드 (Frontend)

#### 구현된 페이지
- ✅ `Login.tsx` - 로그인/회원가입 (모드 선택 기능 추가됨)
- ✅ `Dashboard.tsx` - 대시보드 (모드별 UI 차이 적용됨)
- ✅ `Tasks.tsx` - 일정 관리 (달력 뷰 기본 구현, 모드별 UI 차이)
- ✅ `Medicine.tsx` - 약 관리 (모드별 UI 차이만 적용, 기능 미구현)
- ✅ `Chat.tsx` - AI 채팅 (모드별 UI 차이만 적용, 기능 미구현)
- ✅ `Guardians.tsx` - 보호자 관리 (모드별 UI 차이만 적용, 기능 미구현)
- ✅ `Settings.tsx` - 설정 (모드별 UI 차이만 적용, 기능 미구현)

#### 구현된 컴포넌트
- ✅ `CalendarView.tsx` - 달력 컴포넌트 (기본 기능만)
- ✅ `TaskForm.tsx` - 일정 추가 폼
- ✅ `Layout.tsx` - 레이아웃 (사이드바, 헤더)
- ✅ `ProtectedRoute.tsx` - 인증 보호 라우트

#### 미완료 상태
- ❌ 일정 완료 토글 UI (API 오류로 인해 미구현)
- ❌ 달력 뷰 개선 (일정 개수 표시, 색상 구분 등)
- ❌ 약 관리 페이지 기능 구현
- ❌ 알림 시스템 UI 개선
- ❌ 위치/지도 기능 (전체 미구현)
- ❌ 모니터링 기능 (전체 미구현)
- ❌ 음성 입력 기능 (전체 미구현)

---

## 🎯 필요한 기능 분석

### Phase 1: 기본 기능 완성 (우선순위: 최고)

#### 1. 달력 뷰 완성 📅
**현재 상태**: 기본 달력만 구현됨
**필요한 기능**:
- 일정 개수 표시 (각 날짜 셀에 배지)
- 완료/미완료 색상 구분
- 오늘 날짜 하이라이트 강화
- 날짜 선택 시 해당 날짜 일정만 필터링

**배치 위치**:
- 부모 앱: `/parent/tasks` - 내 일정 확인용
- 자식 앱: `/child/tasks` - 부모님 일정 관리용

**작업 분리**:
- 작업자 A: `CalendarView.tsx` 컴포넌트 개선
- 작업자 B: `GET /api/tasks/?date=YYYY-MM-DD` API 개선

---

#### 2. 일정 알림 시스템 ⏰
**현재 상태**: 기본 알림 시스템만 구현됨 (Notification API)
**필요한 기능**:
- 일정 시작 시간 전 알림
- 알림 설정 토글
- 알림 로그 표시
- 알림 권한 요청 모달

**배치 위치**:
- 부모 앱: `/parent/tasks` - 내 일정 알림
- 자식 앱: `/child/tasks` - 부모님 일정 알림 (부모님에게 알림 전송)

**작업 분리**:
- 작업자 A: 알림 UI 개선 (`Settings.tsx`, `Tasks.tsx`)
- 작업자 B: 알림 설정 API (`/api/users/me/notification_settings`)

---

#### 3. 약 알림 시스템 💊
**현재 상태**: 모델과 기본 API만 구현됨
**필요한 기능**:
- 약 등록/수정/삭제 (자식 모드)
- 오늘의 약 목록 표시 (부모 모드)
- 복용 완료 기록
- 약 알림 스케줄링
- 복용 통계 표시

**배치 위치**:
- 부모 앱: `/parent/medicine` - 내 약 복용 확인 및 기록
- 자식 앱: `/child/medicine` - 부모님 약 알림 설정

**작업 분리**:
- 작업자 A: `Medicine.tsx` 페이지 구현 (부모/자식 모드)
- 작업자 B: 약 알림 스케줄링 서비스 (`medicine_scheduler.py`)

---

### Phase 2: 위치/지도 기능

#### 4. GPS 위치 추적 📍
**현재 상태**: 미구현
**필요한 기능**:
- 실시간 위치 추적
- 이동 경로 기록
- 위치 공유
- 안전 구역 설정 및 진입/이탈 알림

**배치 위치**:
- 부모 앱: `/parent/location` (새 페이지) - 내 위치 추적 및 공유
- 자식 앱: `/child/location` (새 페이지) - 부모님 위치 모니터링

**작업 분리**:
- 작업자 A: `Location.tsx` 페이지 생성, Geolocation API 연동
- 작업자 B: 위치 추적 API (`/api/location/`), 안전 구역 API

---

#### 5. 카카오 지도 API 연동 🗺️
**현재 상태**: 미구현
**필요한 기능**:
- 장소 검색 (자동완성)
- 경로 표시
- 좌표 변환 (주소 ↔ 좌표)
- 즐겨찾기 장소 저장

**배치 위치**:
- 부모 앱: `/parent/location` - 내 위치 지도 표시
- 자식 앱: `/child/location` - 부모님 위치 지도 표시

**작업 분리**:
- 작업자 A: `KakaoMap.tsx` 컴포넌트 생성, 지도 UI
- 작업자 B: 카카오 지도 API 프록시 (`/api/map/`)

---

### Phase 3: AI/모니터링 기능

#### 6. 보호자 모니터링 👥
**현재 상태**: 미구현
**필요한 기능**:
- 활동량 모니터링
- 건강 데이터 수집 (심박수, 걸음 수 등)
- 실시간 상태 표시
- 이상 징후 감지 및 비상 알림

**배치 위치**:
- 부모 앱: ❌ 사용 안 함 (모니터링 대상)
- 자식 앱: `/child/monitoring` (새 페이지) - 부모님 모니터링

**작업 분리**:
- 작업자 A: `Monitoring.tsx` 페이지 생성, 차트 컴포넌트
- 작업자 B: 모니터링 API (`/api/monitoring/`), 이상 징후 감지 로직

---

#### 7. AI 일정 추출 🤖
**현재 상태**: 기본 API만 구현됨
**필요한 기능**:
- 자연어 처리 (텍스트 → 일정)
- 스마트 파싱 (날짜/시간/장소 추출)
- 충돌 감지 (기존 일정과 비교)
- 일정 자동 생성

**배치 위치**:
- 부모 앱: `/parent/chat` - 음성/텍스트로 일정 생성
- 자식 앱: `/child/chat` - 부모님 일정 생성 도움

**작업 분리**:
- 작업자 A: Chat 페이지에 일정 추출 UI 추가
- 작업자 B: AI 일정 추출 API 개선 (`/api/ai/extract-schedule`), 충돌 감지 로직

---

#### 8. 음성 입력 기능 🎤
**현재 상태**: 미구현
**필요한 기능**:
- 음성 인식 (Web Speech API)
- 음성 → 텍스트 변환
- 음성으로 AI 채팅
- 음성 명령어 처리

**배치 위치**:
- 부모 앱: `/parent/chat` - 음성으로 AI 채팅
- 자식 앱: `/child/chat` - 음성으로 일정 생성

**작업 분리**:
- 작업자 A: Chat 페이지에 음성 입력 UI 추가
- 작업자 B: 음성 처리 API (선택적, 프론트엔드에서 직접 처리 가능)

---

### Phase 4: 고급 기능

#### 9. 건강 데이터 시각화 📈
**현재 상태**: 미구현
**필요한 기능**:
- 차트/그래프 (활동량, 건강 지표)
- 패턴 분석 (일일/주간/월간)
- 리포트 생성
- 데이터 내보내기 (CSV/JSON)

**배치 위치**:
- 부모 앱: `/parent/health` (새 페이지) - 내 건강 데이터
- 자식 앱: `/child/monitoring` - 부모님 건강 데이터

**작업 분리**:
- 작업자 A: `Health.tsx` 페이지 생성, 차트 컴포넌트
- 작업자 B: 건강 데이터 API (`/api/health/`), 리포트 생성 API

---

#### 10. 실시간 기능 ⚡
**현재 상태**: 미구현
**필요한 기능**:
- WebSocket 연결
- 실시간 채팅
- 실시간 알림
- 실시간 위치 공유
- 오프라인 동기화

**배치 위치**:
- 부모 앱: 모든 페이지 - 실시간 알림 수신
- 자식 앱: 모든 페이지 - 실시간 모니터링 및 알림 전송

**작업 분리**:
- 작업자 A: WebSocket 클라이언트, 실시간 UI
- 작업자 B: WebSocket 서버, 실시간 알림 전송 로직

---

## 🎯 부모/자식 앱 기능 배치

### 부모 앱 (Parent Mode) - `/parent/*`

| 페이지 | 경로 | 주요 기능 | Phase |
|--------|------|----------|------|
| Dashboard | `/parent/dashboard` | 내 일정/약 통계, 빠른 액션 | ✅ 완료 |
| Tasks | `/parent/tasks` | 내 일정 확인, 완료 처리 | Phase 1 |
| Medicine | `/parent/medicine` | 내 약 복용 확인, 기록 | Phase 1 |
| Chat | `/parent/chat` | AI 케어비서 대화, 일정 생성 | Phase 3 |
| Settings | `/parent/settings` | 내 계정 설정, 알림 설정 | Phase 1 |
| Location | `/parent/location` | 내 위치 추적, 공유 | Phase 2 |
| Health | `/parent/health` | 내 건강 데이터 시각화 | Phase 4 |

### 자식 앱 (Child Mode) - `/child/*`

| 페이지 | 경로 | 주요 기능 | Phase |
|--------|------|----------|------|
| Dashboard | `/child/dashboard` | 부모님 일정/약 통계, 모니터링 | ✅ 완료 |
| Tasks | `/child/tasks` | 부모님 일정 등록, 관리 | Phase 1 |
| Medicine | `/child/medicine` | 부모님 약 알림 설정 | Phase 1 |
| Guardians | `/child/guardians` | 보호자 관리 | ✅ 기본 완료 |
| Chat | `/child/chat` | 부모님 케어 AI 상담 | Phase 3 |
| Settings | `/child/settings` | 부모님 관리 설정 | Phase 1 |
| Location | `/child/location` | 부모님 위치 모니터링 | Phase 2 |
| Monitoring | `/child/monitoring` | 부모님 활동량/건강 모니터링 | Phase 3 |

---

## 👥 작업 분리 원칙

### 파일 단위 분리

#### 작업자 A (프론트엔드) 전용 파일
```
frontend/
├── src/
│   ├── pages/          # 모든 페이지 컴포넌트
│   ├── components/     # 모든 재사용 컴포넌트
│   ├── hooks/          # 커스텀 훅
│   ├── services/       # API 호출 함수만 (작업자 B API 완료 후)
│   ├── types/          # TypeScript 타입 정의
│   ├── contexts/       # React Context
│   └── utils/          # 유틸리티 함수
```

#### 작업자 B (백엔드) 전용 파일
```
backend/
├── routers/            # 모든 API 라우터
├── models/            # 데이터베이스 모델
├── schemas/           # Pydantic 스키마
├── services/          # 비즈니스 로직
├── database.py        # 데이터베이스 설정
└── main.py            # FastAPI 앱 설정
```

### 공통 파일 (협의 필요)
- `README.md` - 프로젝트 설명
- `.gitignore` - Git 무시 파일
- `package.json` / `requirements.txt` - 의존성 (변경 시 협의)

---

## 🚨 Merge 충돌 방지 전략

### 1. 파일 단위 분리
- ✅ 작업자 A는 `frontend/` 폴더만 수정
- ✅ 작업자 B는 `backend/` 폴더만 수정
- ✅ 공통 파일 수정 시 사전 협의

### 2. 브랜치 전략
```
main (프로덕션)
├── develop (개발 통합)
    ├── feature/worker-a-phase1-tasks (작업자 A)
    ├── feature/worker-b-phase1-tasks (작업자 B)
    ├── feature/worker-a-phase1-medicine (작업자 A)
    └── feature/worker-b-phase1-medicine (작업자 B)
```

### 3. 작업 순서
1. **작업자 B가 API 먼저 구현** → Swagger 문서화
2. **작업자 A가 API 스펙 확인** → 프론트엔드 구현
3. **통합 테스트** → 문제 발견 시 즉시 소통
4. **Merge** → 각 Phase 완료 후 `develop` 브랜치로 머지

### 4. API 인터페이스 먼저 정의
- 작업자 B가 API 스펙을 먼저 정의
- Swagger 문서에 명확히 작성
- 작업자 A는 Swagger 문서를 참고하여 구현

### 5. 충돌 가능성 높은 파일
- ❌ `frontend/src/services/api.ts` - 작업자 B API 완료 후 작업자 A가 수정
- ❌ `backend/main.py` - CORS 설정 등 (작업자 B만 수정)
- ❌ `package.json` / `requirements.txt` - 의존성 추가 시 협의

---

## 📝 작업 진행 순서

### Phase 1 진행 순서

#### Week 1
1. **작업자 B**: Step 1-1 (일정 완료 토글 API 수정) → 완료 후 알림
2. **작업자 A**: Step 1-1 (일정 완료 토글 UI) → 통합 테스트
3. **작업자 B**: Step 1-2 (날짜별 일정 조회 API) → 완료 후 알림
4. **작업자 A**: Step 1-2 (CalendarView 개선) → 통합 테스트

#### Week 2
1. **작업자 B**: Step 1-3 (약 알림 API 완성) → 완료 후 알림
2. **작업자 A**: Step 1-4, 1-5 (Medicine 페이지) → 통합 테스트
3. **작업자 B**: Step 1-4 (약 알림 스케줄링) → 완료 후 알림
4. **작업자 A**: Step 1-6 (알림 시스템 UI) → 통합 테스트

---

## ✅ 통합 체크리스트

### Phase 1 완료 전 확인
- [ ] 모든 API 호출에 에러 처리 추가 (작업자 A)
- [ ] 모든 API 응답 형식 통일 (작업자 B)
- [ ] CORS 설정 확인 (작업자 B)
- [ ] 모드별 UI 차이 확인 (작업자 A)
- [ ] 반응형 디자인 테스트 (작업자 A)
- [ ] Swagger 문서 최신 상태 (작업자 B)
- [ ] 통합 테스트 완료 (작업자 A + B)

---

**작성일**: 2025-01-19  
**작성자**: AI Assistant  
**최종 수정**: 2025-01-19

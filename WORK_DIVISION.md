# 🎯 기능 구현 작업 분할 가이드

## 📋 목차
1. [기능별 부모/자식 앱 배치](#기능별-부모자식-앱-배치)
2. [작업 분할 (사용자 vs 협업자1)](#작업-분할-사용자-vs-협업자1)
3. [API 인터페이스 정의](#api-인터페이스-정의)
4. [통합 체크리스트](#통합-체크리스트)

---

## 🎯 기능별 부모/자식 앱 배치

### Phase 1: 기본 기능 확장

#### 1. 달력 뷰 구현 📅
- **부모 앱**: ✅ Tasks 페이지 (`/parent/tasks`)
  - 내 일정 확인용 달력
  - 완료/미완료 일정 색상 구분
  - 날짜별 일정 개수 표시
  
- **자식 앱**: ✅ Tasks 페이지 (`/child/tasks`)
  - 부모님 일정 관리용 달력
  - 등록한 일정 확인
  - 일정 상태 모니터링

#### 2. 일정 알림 시스템 ⏰
- **부모 앱**: ✅ Tasks 페이지 (`/parent/tasks`)
  - 내 일정 시작 시간 전 알림
  - 브라우저 알림 권한 요청
  - 알림 설정 토글
  
- **자식 앱**: ⚠️ Tasks 페이지 (`/child/tasks`)
  - 부모님 일정 알림 (부모님에게 알림이 가야 함)
  - 일정 등록 시 알림 스케줄링
  - 알림 로그 확인

#### 3. 약 알림 시스템 💊
- **부모 앱**: ✅ Medicine 페이지 (`/parent/medicine`)
  - 내 약 복용 시간 알림
  - 복용 완료 기록
  - 오늘의 약 목록 확인
  
- **자식 앱**: ✅ Medicine 페이지 (`/child/medicine`)
  - 부모님 약 알림 설정
  - 약 등록/수정/삭제
  - 복용 기록 모니터링
  - 알림 로그 확인

---

### Phase 2: 위치/지도 기능

#### 4. GPS 위치 추적 📍
- **부모 앱**: 🆕 새 페이지 필요 (`/parent/location`)
  - 내 위치 실시간 추적
  - 이동 경로 기록
  - 안전 구역 설정
  - 위치 공유 (자식에게)
  
- **자식 앱**: 🆕 새 페이지 필요 (`/child/location`)
  - 부모님 위치 실시간 확인
  - 이동 경로 모니터링
  - 안전 구역 진입/이탈 알림
  - 비상 알림 기능

#### 5. 카카오 지도 API 연동 🗺️
- **부모 앱**: 🆕 Location 페이지에 통합
  - 내 위치 지도 표시
  - 자주 가는 장소 즐겨찾기
  - 경로 확인
  
- **자식 앱**: 🆕 Location 페이지에 통합
  - 부모님 위치 지도 표시
  - 장소 검색 및 경로 표시
  - 즐겨찾기 장소 관리

---

### Phase 3: AI/모니터링 기능

#### 6. 보호자 모니터링 👥
- **부모 앱**: ❌ 사용 안 함 (보호자 모니터링 대상)
  
- **자식 앱**: 🆕 Dashboard 또는 새 페이지 (`/child/monitoring`)
  - 부모님 활동량 모니터링
  - 건강 데이터 수집 (심박수, 걸음 수 등)
  - 실시간 상태 표시
  - 이상 징후 감지 및 비상 알림

#### 7. AI 일정 추출 🤖
- **부모 앱**: ✅ Chat 페이지 (`/parent/chat`)
  - 음성/텍스트로 일정 생성
  - "내일 오후 3시 병원 가기" → 자동 일정 생성
  - 자연어 처리
  
- **자식 앱**: ✅ Chat 페이지 (`/child/chat`)
  - 부모님 일정 생성 도움
  - "엄마 내일 오후 3시 병원 예약" → 일정 생성
  - 충돌 감지 (기존 일정과 비교)

#### 8. 음성 입력 기능 🎤
- **부모 앱**: ✅ Chat 페이지 (`/parent/chat`)
  - AI 채팅에 음성 입력
  - 음성 명령어 처리
  
- **자식 앱**: ✅ Chat 페이지 (`/child/chat`)
  - AI 상담에 음성 입력
  - 음성으로 일정 생성

---

### Phase 4: 고급 기능

#### 9. 건강 데이터 시각화 📈
- **부모 앱**: 🆕 새 페이지 (`/parent/health`)
  - 내 건강 데이터 차트
  - 활동량 그래프
  - 건강 리포트
  
- **자식 앱**: 🆕 Monitoring 페이지에 통합
  - 부모님 건강 데이터 시각화
  - 패턴 분석
  - 리포트 생성 및 내보내기

#### 10. 실시간 기능 ⚡
- **부모 앱**: 
  - 실시간 위치 공유
  - 실시간 알림 수신
  
- **자식 앱**:
  - 실시간 위치 모니터링
  - 실시간 알림 전송
  - 실시간 채팅

---

## 👥 작업 분할 (사용자 vs 협업자1)

### 📱 **사용자 (프론트엔드 개발자) 작업**

#### Phase 1-1: 달력 뷰 완성
- [ ] **CalendarView 컴포넌트 개선**
  - 일정 개수 표시 로직 구현
  - 완료/미완료 색상 구분
  - 오늘 날짜 하이라이트 강화
  - 날짜 선택 시 해당 날짜 일정만 필터링
  
- [ ] **Tasks 페이지 모드별 UI 차이**
  - 부모 모드: "내 일정 확인" 강조
  - 자식 모드: "부모님 일정 등록" 강조
  - 일정 추가 버튼 텍스트 변경

#### Phase 1-2: 일정 알림 시스템
- [ ] **알림 UI 개선**
  - 알림 권한 요청 모달
  - 알림 설정 토글 UI
  - 알림 로그 표시 (선택적)
  
- [ ] **일정 완료 토글 UI**
  - 완료 버튼 클릭 시 즉시 UI 업데이트
  - 로딩 상태 표시
  - 에러 처리

#### Phase 1-3: 약 알림 시스템
- [ ] **Medicine 페이지 구현**
  - 부모 모드: 오늘의 약 목록, 복용 완료 버튼
  - 자식 모드: 약 등록/수정/삭제 폼, 알림 설정 UI
  - 약 알림 스케줄링 UI
  
- [ ] **약 복용 기록 UI**
  - 복용 완료 체크박스
  - 복용 시간 기록
  - 복용 통계 표시

#### Phase 2: 위치/지도 기능
- [ ] **Location 페이지 생성**
  - 부모 모드: 내 위치 표시, 안전 구역 설정
  - 자식 모드: 부모님 위치 표시, 경로 모니터링
  
- [ ] **카카오 지도 연동**
  - 지도 컴포넌트 생성
  - 마커 표시
  - 경로 표시
  - 장소 검색 UI

#### Phase 3: AI/모니터링
- [ ] **Chat 페이지 음성 입력**
  - 음성 인식 버튼
  - 음성 → 텍스트 변환 UI
  - 음성 명령어 처리
  
- [ ] **Monitoring 페이지 생성** (자식 모드 전용)
  - 활동량 차트
  - 건강 데이터 표시
  - 실시간 상태 표시

#### Phase 4: 고급 기능
- [ ] **Health 페이지 생성** (부모 모드)
  - 건강 데이터 차트
  - 리포트 생성 UI
  
- [ ] **실시간 기능 UI**
  - WebSocket 연결 상태 표시
  - 실시간 알림 배지
  - 오프라인 모드 표시

---

### 🔧 **협업자1 (백엔드 개발자) 작업**

#### Phase 1-1: 일정 API 개선
- [ ] **일정 완료 토글 API 수정**
  - `PATCH /api/tasks/{task_id}/complete` 엔드포인트
  - CORS 설정 확인
  - 응답 형식 통일
  
- [ ] **날짜별 일정 조회 API**
  - `GET /api/tasks/?date=YYYY-MM-DD` 쿼리 파라미터 지원
  - 완료/미완료 필터링 옵션
  - 일정 개수 집계 응답

#### Phase 1-2: 알림 시스템 백엔드
- [ ] **알림 로그 API**
  - `GET /api/notification_logs/` - 알림 로그 조회
  - `POST /api/notification_logs/` - 알림 로그 저장
  - 사용자별 필터링
  
- [ ] **알림 설정 API**
  - `GET /api/users/me/notification_settings` - 설정 조회
  - `PATCH /api/users/me/notification_settings` - 설정 업데이트

#### Phase 1-3: 약 알림 시스템
- [ ] **약 알림 API 완성**
  - `GET /api/medicine/alarms/today` - 오늘의 약 알림
  - `POST /api/medicine/alarms/` - 약 알림 생성
  - `PATCH /api/medicine/alarms/{id}` - 약 알림 수정
  - `DELETE /api/medicine/alarms/{id}` - 약 알림 삭제
  - `POST /api/medicine/alarms/{id}/taken` - 복용 완료 기록
  
- [ ] **약 알림 스케줄링**
  - 백그라운드 작업으로 알림 시간 체크
  - 알림 전송 로직 (푸시 알림 또는 웹소켓)

#### Phase 2: 위치/지도 API
- [ ] **위치 추적 API**
  - `POST /api/location/` - 위치 업데이트
  - `GET /api/location/current` - 현재 위치 조회
  - `GET /api/location/history` - 위치 이력 조회
  - `POST /api/location/safe-zones` - 안전 구역 설정
  
- [ ] **카카오 지도 API 프록시**
  - `POST /api/map/search` - 장소 검색
  - `POST /api/map/route` - 경로 계산
  - `POST /api/map/geocode` - 좌표 변환

#### Phase 3: AI/모니터링 API
- [ ] **보호자 모니터링 API**
  - `POST /api/monitoring/data` - 건강 데이터 수집
  - `GET /api/monitoring/current` - 현재 상태 조회
  - `GET /api/monitoring/analytics` - 분석 데이터
  
- [ ] **AI 일정 추출 API 개선**
  - `POST /api/ai/extract-schedule` - 자연어 → 일정 추출
  - 충돌 감지 로직
  - 일정 자동 생성
  
- [ ] **음성 처리 API** (선택적)
  - `POST /api/ai/speech-to-text` - 음성 → 텍스트

#### Phase 4: 고급 기능 API
- [ ] **건강 데이터 시각화 API**
  - `GET /api/health/data` - 건강 데이터 조회
  - `GET /api/health/report` - 리포트 생성
  - `GET /api/health/export` - 데이터 내보내기
  
- [ ] **실시간 기능**
  - WebSocket 엔드포인트 설정
  - 실시간 알림 전송
  - 실시간 위치 공유
  - 오프라인 동기화 API

---

## 🔌 API 인터페이스 정의

### 공통 규칙
1. **인증**: 모든 API는 JWT 토큰 필요 (`Authorization: Bearer <token>`)
2. **응답 형식**: 
   ```json
   {
     "status": 200,
     "message": "성공",
     "data": { ... }
   }
   ```
3. **에러 응답**:
   ```json
   {
     "status": 400,
     "message": "에러 메시지",
     "data": null
   }
   ```

### Phase 1 API 명세

#### 1. 일정 완료 토글
```typescript
// PATCH /api/tasks/{task_id}/complete
Request: {}
Response: {
  status: 200,
  message: "일정이 완료 처리되었습니다",
  data: {
    id: number,
    completed: boolean,
    completed_at: string
  }
}
```

#### 2. 날짜별 일정 조회
```typescript
// GET /api/tasks/?date=2025-01-19&completed=false
Response: {
  status: 200,
  message: "성공",
  data: {
    tasks: Task[],
    total: number,
    completed: number,
    remaining: number
  }
}
```

#### 3. 약 알림 생성
```typescript
// POST /api/medicine/alarms/
Request: {
  medicine_name: string,
  dosage: string,
  frequency: string,
  time_1: string, // "HH:MM"
  time_2?: string,
  time_3?: string,
  time_4?: string,
  start_date: string, // "YYYY-MM-DD"
  end_date?: string,
  reminder_minutes: number // 알림 몇 분 전
}
Response: {
  status: 201,
  message: "약 알림이 생성되었습니다",
  data: MedicineAlarm
}
```

#### 4. 약 복용 완료 기록
```typescript
// POST /api/medicine/alarms/{id}/taken
Request: {
  taken_at: string // "YYYY-MM-DD HH:MM:SS"
}
Response: {
  status: 200,
  message: "복용이 기록되었습니다",
  data: {
    id: number,
    last_taken: string,
    next_reminder: string
  }
}
```

### Phase 2 API 명세

#### 5. 위치 업데이트
```typescript
// POST /api/location/
Request: {
  latitude: number,
  longitude: number,
  accuracy?: number,
  timestamp: string
}
Response: {
  status: 200,
  message: "위치가 업데이트되었습니다",
  data: {
    id: number,
    latitude: number,
    longitude: number,
    created_at: string
  }
}
```

#### 6. 안전 구역 설정
```typescript
// POST /api/location/safe-zones
Request: {
  name: string,
  center_latitude: number,
  center_longitude: number,
  radius: number // 미터 단위
}
Response: {
  status: 201,
  message: "안전 구역이 설정되었습니다",
  data: SafeZone
}
```

### Phase 3 API 명세

#### 7. AI 일정 추출
```typescript
// POST /api/ai/extract-schedule
Request: {
  text: string, // "내일 오후 3시 병원 가기"
  user_id: number
}
Response: {
  status: 200,
  message: "일정이 추출되었습니다",
  data: {
    title: string,
    date: string,
    time?: string,
    location?: string,
    conflicts: Task[] // 충돌하는 기존 일정
  }
}
```

#### 8. 건강 데이터 수집
```typescript
// POST /api/monitoring/data
Request: {
  user_id: number, // 부모님 ID
  heart_rate?: number,
  steps?: number,
  activity_level: string, // "low" | "medium" | "high"
  timestamp: string
}
Response: {
  status: 200,
  message: "데이터가 저장되었습니다",
  data: MonitoringData
}
```

---

## ✅ 통합 체크리스트

### Phase 1 통합 전 확인사항

#### 프론트엔드 (사용자)
- [ ] 모든 API 호출에 에러 처리 추가
- [ ] 로딩 상태 표시
- [ ] 모드별 UI 차이 확인
- [ ] 반응형 디자인 테스트

#### 백엔드 (협업자1)
- [ ] CORS 설정 확인
- [ ] 모든 엔드포인트 Swagger 문서화
- [ ] 에러 응답 형식 통일
- [ ] 데이터베이스 마이그레이션 완료

#### 통합 테스트
- [ ] 일정 생성/수정/삭제/완료 토글 테스트
- [ ] 약 알림 생성/복용 기록 테스트
- [ ] 알림 시스템 테스트
- [ ] 모드별 기능 분리 확인

### Phase 2 통합 전 확인사항
- [ ] 카카오 지도 API 키 설정
- [ ] 위치 권한 요청 처리
- [ ] 지도 컴포넌트 성능 최적화
- [ ] 위치 데이터 보안 확인

### Phase 3 통합 전 확인사항
- [ ] AI API 키 설정
- [ ] 음성 인식 브라우저 호환성 확인
- [ ] 모니터링 데이터 수집 주기 설정
- [ ] 실시간 기능 성능 테스트

---

## 📝 작업 순서 권장사항

### 1단계: Phase 1 완성 (우선순위 최고)
1. **협업자1**: 일정 완료 토글 API 수정 → 테스트
2. **사용자**: 일정 완료 토글 UI 구현 → 통합 테스트
3. **협업자1**: 약 알림 API 완성 → 테스트
4. **사용자**: 약 관리 페이지 구현 → 통합 테스트

### 2단계: Phase 2 시작
1. **협업자1**: 위치 추적 API 구현
2. **사용자**: Location 페이지 기본 구조
3. **협업자1**: 카카오 지도 API 프록시
4. **사용자**: 지도 컴포넌트 연동

### 3단계: Phase 3 시작
1. **협업자1**: AI 일정 추출 API 개선
2. **사용자**: Chat 페이지 음성 입력
3. **협업자1**: 모니터링 API 구현
4. **사용자**: Monitoring 페이지 구현

---

## 🚨 주의사항

1. **API 버전 관리**: 모든 API는 `/api/v1/` 접두사 사용 권장
2. **에러 처리**: 프론트엔드와 백엔드 모두 일관된 에러 메시지 사용
3. **타입 정의**: TypeScript 타입은 `frontend/src/types/` 폴더에 공유
4. **환경 변수**: API URL 등은 `.env` 파일로 관리
5. **코드 리뷰**: 각 Phase 완료 후 코드 리뷰 필수

---

## 📞 협업 가이드

### 커밋 메시지 규칙
```
[Frontend/Backend] [Phase X] 기능명: 설명

예시:
[Frontend] [Phase 1] Tasks: 일정 완료 토글 UI 구현
[Backend] [Phase 1] Tasks: 완료 토글 API CORS 수정
```

### 브랜치 전략
- `main`: 프로덕션 코드
- `develop`: 개발 통합 브랜치
- `feature/phase1-tasks`: Phase 1 Tasks 기능
- `feature/phase1-medicine`: Phase 1 Medicine 기능

### 통합 시점
- 각 Phase의 모든 작업이 완료되면 `develop` 브랜치로 머지
- 통합 테스트 완료 후 `main` 브랜치로 머지

---

**작성일**: 2025-01-19  
**작성자**: AI Assistant  
**최종 수정**: 2025-01-19

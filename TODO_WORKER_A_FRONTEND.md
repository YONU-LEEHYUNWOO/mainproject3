# 📱 작업자 A (프론트엔드) TODO 리스트

## 📋 작업 범위
- `frontend/src/pages/*.tsx` - 페이지 컴포넌트
- `frontend/src/components/*.tsx` - 재사용 컴포넌트
- `frontend/src/hooks/*.ts` - 커스텀 훅
- `frontend/src/services/api.ts` - API 호출 함수 (작업자 B의 API 완료 후 연동)
- `frontend/src/types/*.ts` - TypeScript 타입 정의

---

## 🎯 Phase 1: 기본 기능 완성 (우선순위: 최고)

### ✅ Step 1-1: 일정 완료 토글 UI 구현
**작업자 B 완료 대기**: `PATCH /api/tasks/{task_id}/complete` API 수정 완료 후 시작

**파일**: `frontend/src/pages/Tasks.tsx`

- [ ] **완료 토글 버튼 추가**
  - 일정 목록에 체크박스 또는 토글 버튼 추가
  - 완료된 일정은 체크 표시
  - 클릭 시 즉시 UI 업데이트 (낙관적 업데이트)

- [ ] **로딩 상태 처리**
  - API 호출 중 버튼 비활성화
  - 로딩 스피너 표시

- [ ] **에러 처리**
  - API 호출 실패 시 이전 상태로 롤백
  - 에러 토스트 메시지 표시
  - 재시도 버튼 제공

**API 연동**:
```typescript
// frontend/src/services/api.ts에 추가
tasksAPI.toggleComplete = async (taskId: number) => {
  const response = await api.patch(`/tasks/${taskId}/complete`)
  return response.data
}
```

**예상 소요 시간**: 2-3시간

---

### ✅ Step 1-2: CalendarView 컴포넌트 개선
**작업자 B 완료 대기**: `GET /api/tasks/?date=YYYY-MM-DD` 쿼리 파라미터 지원 완료 후 시작

**파일**: `frontend/src/components/CalendarView.tsx`

- [ ] **일정 개수 표시**
  - 각 날짜 셀에 일정 개수 배지 표시
  - 완료된 일정: 초록색 배지
  - 미완료 일정: 빨간색 배지
  - 일정 없음: 표시 없음

- [ ] **오늘 날짜 하이라이트 강화**
  - 현재 날짜를 더 명확하게 표시 (테두리 + 배경색)
  - 선택된 날짜와 구분

- [ ] **날짜 클릭 이벤트 개선**
  - 클릭한 날짜의 일정만 필터링하여 표시
  - 선택된 날짜 상태 관리
  - URL 쿼리 파라미터로 날짜 저장 (선택적)

**API 연동**:
```typescript
// 날짜별 일정 조회
const loadTasksByDate = async (date: string) => {
  const response = await tasksAPI.getTasks({ date, completed: null })
  return response.data
}
```

**예상 소요 시간**: 3-4시간

---

### ✅ Step 1-3: Tasks 페이지 모드별 UI 강화
**파일**: `frontend/src/pages/Tasks.tsx`

- [ ] **부모 모드 UI**
  - 제목: "내 일정 관리 👴"
  - 설명: "오늘의 일정을 확인하고 완료 처리하세요"
  - "일정 추가" 버튼 → "일정 확인" 버튼으로 변경 (선택적)
  - 완료 토글 버튼 강조

- [ ] **자식 모드 UI**
  - 제목: "부모님 일정 관리 👨"
  - 설명: "부모님의 일정을 등록하고 관리하세요"
  - "일정 등록" 버튼 강조
  - 일정 상태 모니터링 강조

**예상 소요 시간**: 1시간

---

### ✅ Step 1-4: Medicine 페이지 구현 (부모 모드)
**작업자 B 완료 대기**: `GET /api/medicine/alarms/today` API 완료 후 시작

**파일**: `frontend/src/pages/Medicine.tsx`

- [ ] **오늘의 약 목록 표시**
  - 약 이름, 복용량, 복용 시간 표시
  - 복용 완료/미완료 상태 표시
  - 시간순 정렬

- [ ] **복용 완료 버튼**
  - 각 약마다 "복용 완료" 버튼
  - 클릭 시 복용 시간 기록
  - 완료된 약은 체크 표시

- [ ] **복용 통계 표시**
  - 오늘 복용해야 할 약 개수
  - 완료된 약 개수
  - 남은 약 개수
  - 진행률 바

**API 연동**:
```typescript
// frontend/src/services/api.ts에 추가
medicineAPI.getTodayAlarms = async () => {
  const response = await api.get('/medicine/today')
  return response.data
}

medicineAPI.markTaken = async (alarmId: number, takenAt?: string) => {
  const response = await api.post(`/medicine/taken`, {
    alarm_id: alarmId,
    taken_at: takenAt || new Date().toISOString()
  })
  return response.data
}
```

**예상 소요 시간**: 3-4시간

---

### ✅ Step 1-5: Medicine 페이지 구현 (자식 모드)
**작업자 B 완료 대기**: 약 알림 CRUD API 완료 후 시작

**파일**: `frontend/src/pages/Medicine.tsx`

- [ ] **약 등록 폼**
  - 약 이름 입력
  - 복용량 입력
  - 복용 시간 입력 (최대 4개 시간)
  - 복용 시작일/종료일 설정
  - 알림 시간 설정 (몇 분 전)
  - 복용 빈도 설정 (매일, 특정 요일)
  - 복용 방법/주의사항 입력

- [ ] **약 목록 표시**
  - 등록된 약 목록 (카드 형태)
  - 수정/삭제 버튼
  - 활성화/비활성화 토글
  - 복용 기록 모니터링

- [ ] **약 수정 모달**
  - 기존 약 정보 수정
  - 폼 재사용

- [ ] **약 삭제 확인**
  - 삭제 전 확인 모달
  - 삭제 후 목록 새로고침

**API 연동**:
```typescript
// frontend/src/services/api.ts에 추가
medicineAPI.getAlarms = async () => {
  const response = await api.get('/medicine/alarms')
  return response.data
}

medicineAPI.createAlarm = async (alarmData: MedicineAlarmCreate) => {
  const response = await api.post('/medicine/alarms', alarmData)
  return response.data
}

medicineAPI.updateAlarm = async (alarmId: number, alarmData: MedicineAlarmUpdate) => {
  const response = await api.put(`/medicine/alarms/${alarmId}`, alarmData)
  return response.data
}

medicineAPI.deleteAlarm = async (alarmId: number) => {
  const response = await api.delete(`/medicine/alarms/${alarmId}`)
  return response.data
}
```

**예상 소요 시간**: 5-6시간

---

### ✅ Step 1-6: 알림 시스템 UI 개선
**파일**: `frontend/src/pages/Settings.tsx`, `frontend/src/hooks/useNotifications.ts`

- [ ] **알림 권한 요청 모달**
  - 첫 접속 시 알림 권한 요청 모달 표시
  - 권한 거부 시 안내 메시지
  - 설정에서 권한 재요청 가능

- [ ] **알림 설정 UI (Settings 페이지)**
  - 알림 켜기/끄기 토글
  - 일정 알림 시간 설정 (일정 시작 몇 분 전)
  - 약 알림 설정 (약 알림 페이지에서 관리)
  - 알림 소리 설정 (향후)

- [ ] **알림 로그 표시 (선택적)**
  - 최근 알림 이력 표시
  - 알림 클릭 시 해당 페이지로 이동

**API 연동**:
```typescript
// frontend/src/services/api.ts에 추가
userAPI.getNotificationSettings = async () => {
  const response = await api.get('/users/me/notification_settings')
  return response.data
}

userAPI.updateNotificationSettings = async (settings: NotificationSettings) => {
  const response = await api.patch('/users/me/notification_settings', settings)
  return response.data
}
```

**예상 소요 시간**: 2-3시간

---

## 🗺️ Phase 2: 위치/지도 기능 (Phase 1 완료 후)

### ✅ Step 2-1: Location 페이지 생성
**작업자 B 완료 대기**: 위치 추적 API 완료 후 시작

**파일**: `frontend/src/pages/Location.tsx` (새 파일)

- [ ] **부모 모드 UI**
  - 내 위치 실시간 표시
  - 위치 공유 토글
  - 안전 구역 설정 버튼
  - 이동 경로 기록 표시

- [ ] **자식 모드 UI**
  - 부모님 위치 실시간 확인
  - 이동 경로 모니터링
  - 안전 구역 진입/이탈 알림 표시
  - 비상 알림 버튼

**예상 소요 시간**: 4-5시간

---

### ✅ Step 2-2: 카카오 지도 연동
**작업자 B 완료 대기**: 카카오 지도 API 프록시 완료 후 시작

**파일**: `frontend/src/components/KakaoMap.tsx` (새 파일)

- [ ] **지도 컴포넌트 생성**
  - 카카오 지도 SDK 연동
  - 현재 위치 마커 표시
  - 부모님 위치 마커 표시 (자식 모드)

- [ ] **경로 표시**
  - 출발지 → 목적지 경로 표시
  - 이동 경로 폴리라인 표시

- [ ] **장소 검색 UI**
  - 자동완성 검색 입력창
  - 검색 결과 목록
  - 검색 결과 마커 표시

- [ ] **즐겨찾기 기능**
  - 자주 가는 장소 저장
  - 즐겨찾기 목록 표시
  - 즐겨찾기 마커 표시

**예상 소요 시간**: 6-8시간

---

## 🤖 Phase 3: AI/모니터링 기능 (Phase 2 완료 후)

### ✅ Step 3-1: Chat 페이지 음성 입력
**파일**: `frontend/src/pages/Chat.tsx`

- [ ] **음성 인식 버튼**
  - 마이크 아이콘 버튼
  - 클릭 시 음성 인식 시작
  - 인식 중 애니메이션

- [ ] **음성 → 텍스트 변환**
  - Web Speech API 활용
  - 인식된 텍스트 입력창에 표시
  - 인식 오류 처리

- [ ] **음성 명령어 처리**
  - "일정 추가", "약 알림" 등 명령어 인식
  - 명령어에 따라 자동 액션 실행

**예상 소요 시간**: 4-5시간

---

### ✅ Step 3-2: Monitoring 페이지 생성 (자식 모드 전용)
**작업자 B 완료 대기**: 모니터링 API 완료 후 시작

**파일**: `frontend/src/pages/Monitoring.tsx` (새 파일)

- [ ] **활동량 차트**
  - 일일/주간/월간 활동량 그래프
  - Chart.js 또는 Recharts 사용

- [ ] **건강 데이터 표시**
  - 심박수, 걸음 수 등 표시
  - 실시간 상태 표시

- [ ] **이상 징후 알림**
  - 이상 징후 감지 시 알림 표시
  - 비상 알림 버튼

**예상 소요 시간**: 5-6시간

---

## 📊 Phase 4: 고급 기능 (Phase 3 완료 후)

### ✅ Step 4-1: Health 페이지 생성 (부모 모드)
**작업자 B 완료 대기**: 건강 데이터 API 완료 후 시작

**파일**: `frontend/src/pages/Health.tsx` (새 파일)

- [ ] **건강 데이터 차트**
  - 활동량 그래프
  - 건강 지표 차트

- [ ] **리포트 생성 UI**
  - 리포트 생성 버튼
  - 리포트 미리보기
  - 리포트 다운로드

**예상 소요 시간**: 4-5시간

---

### ✅ Step 4-2: 실시간 기능 UI
**작업자 B 완료 대기**: WebSocket 엔드포인트 완료 후 시작

**파일**: `frontend/src/hooks/useWebSocket.ts` (새 파일), 각 페이지

- [ ] **WebSocket 연결 상태 표시**
  - 연결 상태 아이콘
  - 연결 끊김 시 재연결 시도

- [ ] **실시간 알림 배지**
  - 새 알림 개수 표시
  - 알림 목록 표시

- [ ] **오프라인 모드 표시**
  - 오프라인 상태 표시
  - 오프라인 데이터 저장
  - 온라인 복구 시 동기화

**예상 소요 시간**: 6-8시간

---

## 📝 공통 작업

### ✅ 공통-1: TypeScript 타입 정의
**파일**: `frontend/src/types/` (새 폴더)

- [ ] **API 응답 타입 정의**
  - Task, MedicineAlarm, Guardian 등 타입 정의
  - API 응답 형식 타입 정의

- [ ] **컴포넌트 Props 타입 정의**
  - 각 컴포넌트의 Props 타입 정의

**예상 소요 시간**: 2-3시간

---

### ✅ 공통-2: 에러 처리 개선
**파일**: `frontend/src/services/api.ts`, 각 페이지

- [ ] **전역 에러 처리**
  - 네트워크 오류 처리
  - 4xx, 5xx 에러 처리
  - 에러 메시지 표시

- [ ] **로딩 상태 관리**
  - 전역 로딩 상태 관리
  - 로딩 스피너 표시

**예상 소요 시간**: 2-3시간

---

## ✅ 통합 체크리스트

### Phase 1 완료 전 확인
- [ ] 모든 API 호출에 에러 처리 추가
- [ ] 로딩 상태 표시
- [ ] 모드별 UI 차이 확인
- [ ] 반응형 디자인 테스트 (모바일/데스크톱)
- [ ] 작업자 B와 API 연동 테스트

### Phase 2 완료 전 확인
- [ ] 카카오 지도 API 키 설정 확인
- [ ] 위치 권한 요청 처리 확인
- [ ] 지도 컴포넌트 성능 최적화

### Phase 3 완료 전 확인
- [ ] 음성 인식 브라우저 호환성 확인
- [ ] 모니터링 데이터 수집 주기 확인

### Phase 4 완료 전 확인
- [ ] WebSocket 연결 안정성 확인
- [ ] 오프라인 동기화 테스트

---

## 🚨 주의사항

1. **작업자 B와의 협업**
   - API 완료 후에만 프론트엔드 작업 시작
   - API 스펙 변경 시 즉시 소통
   - Swagger 문서 확인 필수

2. **파일 충돌 방지**
   - 작업자 B는 `backend/` 폴더만 수정
   - 작업자 A는 `frontend/` 폴더만 수정
   - 공통 파일 수정 시 사전 협의

3. **코드 품질**
   - TypeScript 타입 명시
   - 에러 처리 필수
   - 주석 작성 (한국어)
   - 컴포넌트 최대 300줄 이하

4. **테스트**
   - 각 단계 완료 후 테스트 필수
   - 작업자 B와 통합 테스트 진행

---

**작성일**: 2025-01-19  
**최종 수정**: 2025-01-19

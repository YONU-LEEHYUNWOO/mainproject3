# 👤 퍼슨 A: 프론트엔드 MVP 구현 가이드
## 커서 에이전트에게 이 파일을 전달하세요

### 🎯 **담당 영역**: 프론트엔드 UI/UX, API 연동, 일정 관리 시스템

---

## 📋 **작업 단계별 진행 가이드**

### **Phase A-1: 프로젝트 환경 설정 및 현재 상태 파악**
**진행 전 확인사항:**
- [ ] Node.js 18+ 및 npm 설치 확인
- [ ] 백엔드 서버 실행 상태 확인 (`python run.py`)
- [ ] 프론트엔드 개발 서버 실행 (`npm run dev`)

**테스트 항목:**
- [ ] `http://localhost:5173` 접속 가능
- [ ] `http://localhost:8000/docs` 백엔드 API 문서 접속 가능
- [ ] 현재 일정 페이지에서 오류 확인 (422, CORS 등)

**다음 단계 조건:** 위 항목 모두 확인 완료 시 Phase A-2 진행

---

### **Phase A-2: 일정 생성 오류 해결 (Time 필드 422 오류)**
**대상 파일:** `frontend/src/components/TaskForm.tsx`

**문제 현상:**
```
POST http://localhost:8000/api/tasks/ 422 (Unprocessable Content)
"Input should be None" (time 필드에 "21:23" 같은 값이 들어감)
```

**해결 방안:**
1. TaskForm 컴포넌트에서 time 필드 제거 또는 수정
2. 백엔드 스키마와 일치하는 데이터 전송
3. 시간 관련 필드는 별도 처리

**테스트 항목:**
- [ ] 일정 생성 시 422 오류 사라짐
- [ ] 생성된 일정이 목록에 표시됨
- [ ] 날짜/시간 필드 정상 동작

**다음 단계 조건:** 일정 생성이 정상 작동할 때 Phase A-3 진행

---

### **Phase A-3: 일정 완료 토글 CORS 오류 해결**
**대상 파일:** `frontend/src/pages/Tasks.tsx`

**문제 현상:**
```
PATCH http://localhost:8000/api/tasks/1/complete net::ERR_FAILED
Access to XMLHttpRequest blocked by CORS policy
```

**해결 방안:**
1. Tasks.tsx에서 PATCH 요청 코드 확인
2. CORS 설정 검증 (백엔드와 협의)
3. OPTIONS preflight 요청 처리

**테스트 항목:**
- [ ] 일정 완료/미완료 토글 작동
- [ ] CORS 오류 메시지 사라짐
- [ ] 토글 후 UI 상태 변경 확인

**다음 단계 조건:** 토글 기능이 정상 작동할 때 Phase A-4 진행

---

### **Phase A-4: 달력 뷰 컴포넌트 개선**
**대상 파일:** `frontend/src/components/Calendar.tsx` (없으면 생성)

**구현 사항:**
- 월별 달력 표시
- 날짜 선택 기능
- 오늘 날짜 하이라이트
- 일정 개수 표시 (날짜별 점/색상)
- 완료/미완료 일정 색상 구분

**테스트 항목:**
- [ ] 달력 월 이동 작동
- [ ] 날짜 클릭 시 일정 조회
- [ ] 일정 있는 날짜 표시 (색상/점)
- [ ] 오늘 날짜 시각적 구분

**다음 단계 조건:** 달력 기본 기능 완료 시 Phase A-5 진행

---

### **Phase A-5: 알림 시스템 UI 완성**
**대상 파일:** `frontend/src/hooks/useNotifications.ts`, `frontend/src/components/NotificationBell.tsx`

**구현 사항:**
- 브라우저 알림 권한 요청
- 일정 알림 표시
- 알림 설정 토글
- 알림 기록 표시

**테스트 항목:**
- [ ] 브라우저 알림 권한 요청 작동
- [ ] 일정 시간에 알림 표시
- [ ] 알림 설정 ON/OFF 작동
- [ ] 알림 로그 저장 확인

**다음 단계 조건:** 알림 시스템 기본 작동 시 Phase A-6 진행

---

### **Phase A-6: 약 알림 시스템 프론트엔드 구현**
**대상 파일:** `frontend/src/pages/Medicine.tsx`, `frontend/src/components/MedicineAlarm.tsx`

**구현 사항:**
- 약 알림 설정 UI (시간/요일별 설정)
- 복용 시간 알림 표시
- 복용 완료/미완료 토글
- 알림 기록 표시
- 약 검색/필터링 기능

**테스트 항목:**
- [ ] 약 알림 시간 설정 저장
- [ ] 요일별 알림 설정 작동
- [ ] 복용 완료/미완료 토글
- [ ] 알림 기록 표시
- [ ] 설정된 시간에 알림 발생

**다음 단계 조건:** 약 알림 시스템 완료 시 Phase A-7 진행

---

### **Phase A-7: AI 채팅 기능 검증 및 개선**
**대상 파일:** `frontend/src/pages/Chat.tsx`, `frontend/src/components/ChatInterface.tsx`

**구현 사항:**
- AI 채팅 인터페이스 개선
- 채팅 기록 표시
- 채팅 입력 폼 최적화
- 채팅 메시지 포맷팅

**테스트 항목:**
- [ ] AI 채팅 메시지 송수신
- [ ] 채팅 기록 저장 및 표시
- [ ] 채팅 UI 반응형 작동
- [ ] 에러 처리 및 재연결

**다음 단계 조건:** AI 채팅 기능 정상 작동 시 Phase A-8 진행

---

### **Phase A-8: 알림 로그 확인 및 표시**
**대상 파일:** `frontend/src/components/NotificationLog.tsx` (신규 생성)

**구현 사항:**
- 알림 로그 조회 및 표시
- 로그 필터링 (날짜별, 타입별)
- 로그 삭제 기능
- 로그 상세 정보 표시

**테스트 항목:**
- [ ] 알림 로그 목록 표시
- [ ] 로그 필터링 작동
- [ ] 로그 삭제 기능
- [ ] 로그 상세 정보 표시

**다음 단계 조건:** 알림 로그 기능 완료 시 Phase A-9 진행

---

### **Phase A-9: 음성 입력 기능 기본 구현**
**대상 파일:** `frontend/src/components/SpeechInput.tsx`, `frontend/src/hooks/useSpeech.ts`

**구현 사항:**
- Web Speech API 기본 연동
- 음성 인식 시작/중지 버튼
- 인식된 텍스트 표시
- 에러 처리 (브라우저 지원 여부)
- 기본 명령어 인식 (간단한 키워드)

**테스트 항목:**
- [ ] 음성 인식 권한 요청
- [ ] 음성 입력으로 텍스트 변환
- [ ] 기본 명령어 인식 (예: "일정 추가")
- [ ] 브라우저 지원 여부 확인

**다음 단계 조건:** 음성 입력 기본 기능 완료 시 Phase A-10 진행

---

### **Phase A-10: 위치 추적 기능 기본 틀**
**대상 파일:** `frontend/src/components/LocationTracker.tsx`, `frontend/src/hooks/useGeolocation.ts`

**구현 사항:**
- Geolocation API 권한 요청
- 현재 위치 가져오기
- 위치 표시 (지도 미연동 상태)
- 위치 추적 시작/중지
- 기본 에러 처리

**테스트 항목:**
- [ ] 위치 권한 요청 작동
- [ ] 현재 위치 좌표 표시
- [ ] 위치 추적 토글 작동
- [ ] 위치 정보 저장 준비

**다음 단계 조건:** 위치 추적 기본 틀 완료 시 Phase A-11 진행

---

### **Phase A-11: 보호자 모니터링 UI 틀**
**대상 파일:** `frontend/src/pages/Monitoring.tsx`, `frontend/src/components/HealthDashboard.tsx`

**구현 사항:**
- 모니터링 대시보드 기본 레이아웃
- 건강 데이터 표시 영역 (더미 데이터)
- 실시간 상태 표시 준비
- 비상 알림 UI 준비
- 활동량 차트 틀

**테스트 항목:**
- [ ] 모니터링 페이지 접근 가능
- [ ] 건강 데이터 표시 영역 렌더링
- [ ] 차트 컴포넌트 기본 표시
- [ ] UI 레이아웃 정상

**다음 단계 조건:** 모니터링 UI 틀 완료 시 Phase A-12 진행

---

### **Phase A-12: AI 일정 추출 UI 틀**
**대상 파일:** `frontend/src/components/SmartScheduler.tsx`, `frontend/src/components/TextParser.tsx`

**구현 사항:**
- 자연어 입력 폼
- 텍스트 파싱 결과 표시
- 일정 자동 생성 미리보기
- 충돌 감지 UI 준비
- 생성된 일정 확인/수정 인터페이스

**테스트 항목:**
- [ ] 자연어 입력 폼 작동
- [ ] 입력 텍스트 표시
- [ ] 기본 파싱 결과 표시
- [ ] 일정 생성 미리보기

**다음 단계 조건:** AI 일정 추출 UI 틀 완료 시 Phase A-13 진행

---

### **Phase A-13: 건강 데이터 시각화 기본 틀**
**대상 파일:** `frontend/src/pages/HealthReports.tsx`, `frontend/src/components/Charts.tsx`

**구현 사항:**
- 차트 라이브러리 기본 연동
- 건강 데이터 차트 틀 (더미 데이터)
- 기간별 필터링 UI
- 데이터 내보내기 버튼 (준비 상태)
- 기본 리포트 레이아웃

**테스트 항목:**
- [ ] 차트 컴포넌트 렌더링
- [ ] 더미 데이터 표시
- [ ] 기간 필터링 UI 작동
- [ ] 내보내기 버튼 표시

**다음 단계 조건:** 건강 데이터 시각화 틀 완료 시 Phase A-14 진행

---

### **Phase A-14: UI/UX 개선 및 반응형 디자인**
**대상 파일:** 전체 프론트엔드 컴포넌트

**개선 사항:**
- 모바일 반응형 디자인 적용
- 로딩 상태 표시
- 에러 메시지 사용자 친화적 표시
- 일관된 디자인 시스템 적용
- 회원가입/로그인 페이지 최적화
- 대시보드 레이아웃 개선
- 고급 기능 페이지 네비게이션 추가

**테스트 항목:**
- [ ] 모바일 화면에서 정상 표시
- [ ] 태블릿/데스크톱 최적화
- [ ] 모든 버튼/링크 작동 확인
- [ ] 에러 발생 시 적절한 메시지 표시
- [ ] 인증 페이지 정상 작동
- [ ] 고급 기능 페이지 접근 가능

**다음 단계 조건:** UI/UX 개선 완료 시 최종 통합 테스트 진행

---

## 🔧 **주요 작업 파일들**

### 필수 수정 파일:
1. `frontend/src/components/TaskForm.tsx` - 일정 생성 폼
2. `frontend/src/pages/Tasks.tsx` - 일정 관리 페이지
3. `frontend/src/components/Calendar.tsx` - 달력 컴포넌트 (생성 필요)

### 권장 생성 파일:
1. `frontend/src/components/NotificationBell.tsx` - 알림 컴포넌트
2. `frontend/src/hooks/useCalendar.ts` - 달력 관련 훅
3. `frontend/src/utils/dateUtils.ts` - 날짜 유틸리티 함수

---

## 🚨 **주의사항**

### 백엔드 협의사항:
- API 엔드포인트 변경 시 백엔드 팀과 반드시 협의
- 새로운 필드 추가 시 스키마 공유
- CORS 관련 변경 시 즉시 공유

### 코드 품질:
- 모든 함수에 JSDoc 주석 추가
- TypeScript 타입 엄격하게 적용
- ESLint 오류 해결 필수

### 테스트 우선순위:
1. 오류 해결 (422, CORS)
2. 기본 CRUD 기능
3. UI/UX 개선
4. 반응형 디자인

---

## 📞 **커뮤니케이션**

### 백엔드 팀과 공유할 사항:
- 발견한 API 문제점
- 필요한 API 변경 요청
- 새로운 컴포넌트 요구사항

### 진행 상황 공유:
- 매일 아침/저녁 스크럼
- 오류 발견 즉시 공유
- 성공적인 기능 구현 즉시 공유

---

**🎯 목표:** 프론트엔드 MVP 완성 및 백엔드와의 완벽한 연동
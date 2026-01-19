# 👤 퍼슨 B: 백엔드 MVP 구현 가이드
## 커서 에이전트에게 이 파일을 전달하세요

### 🎯 **담당 영역**: API 개발, 데이터베이스, 약 관리 시스템

---

## 📋 **작업 단계별 진행 가이드**

### **Phase B-1: 프로젝트 환경 설정 및 현재 상태 파악**
**진행 전 확인사항:**
- [ ] Python 3.8+ 및 pip 설치 확인
- [ ] 가상환경 활성화 및 패키지 설치
- [ ] 데이터베이스 파일 존재 확인 (`backend/care_assistant.db`)

**테스트 항목:**
- [ ] `python run.py` 실행 시 서버 시작
- [ ] `http://localhost:8000/docs` API 문서 접속 가능
- [ ] 기존 API 엔드포인트 작동 확인 (auth, tasks)
- [ ] 데이터베이스 연결 정상

**다음 단계 조건:** 서버 정상 실행 및 기본 API 작동 시 Phase B-2 진행

---

### **Phase B-2: 일정 관련 백엔드 오류 해결**
**대상 파일:** `backend/schemas/task.py`, `backend/routers/tasks.py`

**문제 현상:**
```
POST /api/tasks/ 422 Unprocessable Content
"Input should be None" (time 필드 처리 실패)
```

**해결 방안:**
1. TaskCreate 스키마에서 time 필드 처리 방식 검토
2. Pydantic v2 호환성 확인
3. Union[str, time] 타입 처리 개선

**테스트 항목:**
- [ ] 일정 생성 API 200 응답 반환
- [ ] time 필드 없이도 일정 생성 가능
- [ ] 생성된 데이터 DB에 정상 저장
- [ ] 프론트엔드에서 생성 요청 성공

**다음 단계 조건:** 일정 생성 오류 해결 시 Phase B-3 진행

---

### **Phase B-3: CORS 설정 최종 검증**
**대상 파일:** `backend/main.py`

**문제 현상:**
```
PATCH /api/tasks/1/complete net::ERR_FAILED
Access to XMLHttpRequest blocked by CORS policy
```

**해결 방안:**
1. CORSMiddleware 설정 재검토
2. OPTIONS preflight 요청 허용
3. credentials 처리 확인
4. allow_headers, allow_methods 설정 검증

**테스트 항목:**
- [ ] 프론트엔드에서 PATCH 요청 성공
- [ ] OPTIONS preflight 요청 200 응답
- [ ] 쿠키/인증 헤더 정상 전송
- [ ] 모든 CRUD 작업 CORS 문제 없음

**다음 단계 조건:** 모든 CORS 오류 해결 시 Phase B-4 진행

---

### **Phase B-4: 약 관리 API 라우터 생성**
**대상 파일:** `backend/routers/medicine.py` (신규 생성)

**구현 사항:**
- 약 정보 CRUD API
  - `GET /api/medicine/` - 약 목록 조회
  - `POST /api/medicine/` - 약 생성
  - `GET /api/medicine/{id}` - 약 상세 조회
  - `PUT /api/medicine/{id}` - 약 수정
  - `DELETE /api/medicine/{id}` - 약 삭제
- 사용자별 약 필터링 (owner_id)
- Pydantic 스키마 정의

**테스트 항목:**
- [ ] 모든 CRUD 엔드포인트 작동
- [ ] 사용자별 데이터 격리
- [ ] 입력 검증 작동
- [ ] 에러 응답 적절

**다음 단계 조건:** 약 기본 CRUD 완료 시 Phase B-5 진행

---

### **Phase B-5: 약 알림 API 라우터 생성**
**대상 파일:** `backend/routers/medicine_alarms.py` (신규 생성)

**구현 사항:**
- 약 알림 CRUD API
  - `GET /api/medicine-alarms/` - 알림 목록
  - `POST /api/medicine-alarms/` - 알림 생성
  - `PUT /api/medicine-alarms/{id}` - 알림 수정
  - `DELETE /api/medicine-alarms/{id}` - 알림 삭제
- 알림 스케줄링 로직
- 복용 기록 관리
- Pydantic 스키마 및 모델 검증

**테스트 항목:**
- [ ] 알림 생성/수정/삭제 작동
- [ ] 시간/요일 설정 저장
- [ ] 복용 상태 추적
- [ ] 사용자별 알림 격리

**다음 단계 조건:** 약 알림 API 완료 시 Phase B-6 진행

---

### **Phase B-6: 데이터베이스 마이그레이션 및 검증**
**대상 파일:** `backend/alembic/versions/`, `backend/models/`

**구현 사항:**
- notification_logs 테이블 마이그레이션 생성 및 실행
- 기존 마이그레이션 검증
- 데이터베이스 스키마 일관성 확인
- 모델 관계 검증

**테스트 항목:**
- [ ] notification_logs 테이블 정상 생성
- [ ] 기존 데이터 유지
- [ ] 모델 관계 정상 작동
- [ ] alembic 마이그레이션 정상 실행

**다음 단계 조건:** DB 마이그레이션 완료 시 Phase B-7 진행

---

### **Phase B-7: 약 알림 스케줄링 시스템 구현**
**대상 파일:** `backend/services/alarm_scheduler.py` (신규 생성)

**구현 사항:**
- 약 알림 스케줄링 로직
- 시간 기반 알림 트리거
- 반복 알림 처리 (요일별, 시간별)
- 알림 실행 기록 관리
- 비동기 알림 처리

**테스트 항목:**
- [ ] 설정된 시간에 알림 트리거
- [ ] 요일별 반복 알림 작동
- [ ] 알림 실행 로그 저장
- [ ] 중복 알림 방지

**다음 단계 조건:** 알림 스케줄링 완료 시 Phase B-8 진행

---

### **Phase B-8: 복용 기록 관리 시스템**
**대상 파일:** `backend/routers/medicine_alarms.py` (확장)

**구현 사항:**
- 복용 완료/미완료 상태 업데이트 API
- 복용 기록 조회 API
- 복용 통계 API
- 복용 패턴 분석 데이터 제공

**테스트 항목:**
- [ ] 복용 상태 토글 작동
- [ ] 복용 기록 저장 및 조회
- [ ] 복용 통계 계산
- [ ] 데이터 일관성 유지

**다음 단계 조건:** 복용 기록 관리 완료 시 Phase B-9 진행

---

### **Phase B-9: AI 채팅 백엔드 검증**
**대상 파일:** `backend/routers/ai.py`, `backend/services/ai_service.py`

**구현 사항:**
- AI 채팅 API 검증
- 채팅 기록 저장 로직 검증
- Gemini API 연동 상태 확인
- 채팅 데이터 검증 및 필터링

**테스트 항목:**
- [ ] AI 채팅 메시지 송수신
- [ ] 채팅 기록 DB 저장
- [ ] Gemini API 정상 응답
- [ ] 채팅 데이터 검증

**다음 단계 조건:** AI 채팅 검증 완료 시 Phase B-10 진행

---

### **Phase B-10: 알림 로그 API 검증**
**대상 파일:** `backend/routers/notification_logs.py`, `backend/models/notification_log.py`

**구현 사항:**
- 알림 로그 조회 API
- 로그 필터링 및 검색
- 로그 삭제 API
- 로그 통계 API

**테스트 항목:**
- [ ] 알림 로그 목록 조회
- [ ] 날짜/타입별 필터링
- [ ] 로그 삭제 기능
- [ ] 로그 통계 계산

**다음 단계 조건:** 알림 로그 API 완료 시 Phase B-11 진행

---

### **Phase B-11: 위치 추적 API 기본 틀**
**대상 파일:** `backend/routers/location.py`, `backend/models/location.py`

**구현 사항:**
- 위치 데이터 저장 API 기본 틀
- Geolocation 데이터 수신 준비
- 위치 기록 조회 API
- 안전 구역 모델 준비
- 기본 위치 검증

**테스트 항목:**
- [ ] 위치 데이터 저장 API 엔드포인트 생성
- [ ] 기본 위치 모델 작동
- [ ] 위치 데이터 조회 가능
- [ ] API 기본 구조 완성

**다음 단계 조건:** 위치 추적 API 틀 완료 시 Phase B-12 진행

---

### **Phase B-12: 음성 입력 처리 API 준비**
**대상 파일:** `backend/routers/speech.py`, `backend/services/speech_service.py`

**구현 사항:**
- 음성 데이터 수신 API 준비
- 텍스트 변환 결과 저장
- 명령어 인식 기본 로직
- 음성 데이터 검증 및 처리

**테스트 항목:**
- [ ] 음성 데이터 수신 API 엔드포인트
- [ ] 텍스트 변환 결과 저장 구조
- [ ] 기본 명령어 처리 로직
- [ ] API 응답 포맷 준비

**다음 단계 조건:** 음성 입력 API 준비 완료 시 Phase B-13 진행

---

### **Phase B-13: 보호자 모니터링 API 틀**
**대상 파일:** `backend/routers/monitoring.py`, `backend/models/health_data.py`

**구현 사항:**
- 건강 데이터 저장 API 준비
- 활동량 데이터 수집 틀
- 모니터링 데이터 조회 API
- 비상 알림 트리거 준비
- 건강 데이터 모델 기본 구조

**테스트 항목:**
- [ ] 건강 데이터 저장 API 엔드포인트
- [ ] 활동량 데이터 모델 작동
- [ ] 모니터링 데이터 조회 가능
- [ ] 비상 알림 기본 구조

**다음 단계 조건:** 모니터링 API 틀 완료 시 Phase B-14 진행

---

### **Phase B-14: AI 일정 추출 API 틀**
**대상 파일:** `backend/routers/smart_scheduler.py`, `backend/services/nlp_service.py`

**구현 사항:**
- 자연어 텍스트 수신 API
- 텍스트 파싱 서비스 준비
- 일정 자동 생성 로직 틀
- 충돌 감지 알고리즘 준비
- AI 처리 결과 저장 구조

**테스트 항목:**
- [ ] 자연어 입력 수신 API
- [ ] 텍스트 파싱 서비스 기본 구조
- [ ] 일정 생성 알고리즘 틀
- [ ] 충돌 감지 로직 준비

**다음 단계 조건:** AI 일정 추출 API 틀 완료 시 Phase B-15 진행

---

### **Phase B-15: 실시간 기능 준비 (WebSocket)**
**대상 파일:** `backend/routers/websocket.py`, `backend/services/websocket_manager.py`

**구현 사항:**
- WebSocket 엔드포인트 기본 설정
- 실시간 연결 관리
- 메시지 브로드캐스트 준비
- 연결 상태 모니터링
- 기본 채팅/알림 실시간 전송 틀

**테스트 항목:**
- [ ] WebSocket 엔드포인트 연결 가능
- [ ] 기본 메시지 송수신
- [ ] 연결 상태 관리
- [ ] 실시간 이벤트 처리 준비

**다음 단계 조건:** 실시간 기능 준비 완료 시 Phase B-16 진행

---

### **Phase B-16: 건강 데이터 시각화 API 준비**
**대상 파일:** `backend/routers/health_reports.py`, `backend/services/chart_service.py`

**구현 사항:**
- 건강 데이터 집계 API
- 차트 데이터 생성 서비스
- 기간별 데이터 필터링
- 데이터 내보내기 기능 준비
- 리포트 생성 기본 로직

**테스트 항목:**
- [ ] 건강 데이터 집계 API 작동
- [ ] 차트 데이터 포맷 준비
- [ ] 기간 필터링 로직
- [ ] 데이터 내보내기 틀

**다음 단계 조건:** 건강 데이터 시각화 API 준비 완료 시 Phase B-17 진행

---

### **Phase B-17: API 문서화 및 최적화**
**대상 파일:** 전체 백엔드 API 파일들

**개선 사항:**
- Swagger/OpenAPI 문서 완성 (고급 기능 포함)
- API 응답 포맷 표준화
- 에러 메시지 개선
- 성능 최적화 (쿼리 최적화, 인덱스)
- 보안 헤더 추가
- 고급 기능 API 문서화

**테스트 항목:**
- [ ] 모든 API 엔드포인트 문서화 완료
- [ ] 고급 기능 API 포함
- [ ] 일관된 응답 포맷
- [ ] 적절한 HTTP 상태 코드
- [ ] 데이터 검증 강화
- [ ] 보안 헤더 적용

**다음 단계 조건:** API 문서화 완료 시 최종 통합 테스트 진행

---

## 🔧 **주요 작업 파일들**

### 필수 생성 파일:
1. `backend/routers/medicine.py` - 약 관리 API
2. `backend/routers/medicine_alarms.py` - 약 알림 API
3. `backend/schemas/medicine.py` - 약 관련 스키마
4. `backend/schemas/medicine_alarm.py` - 약 알림 스키마

### 수정 파일:
1. `backend/main.py` - CORS 설정 검증
2. `backend/schemas/task.py` - 일정 스키마 오류 해결
3. `backend/models/__init__.py` - 모델 import 검증

---

## 🚨 **주의사항**

### 프론트엔드 협의사항:
- API 엔드포인트 변경 즉시 공유
- 새로운 응답 포맷 공유
- 에러 메시지 포맷 통일

### 데이터베이스 관리:
- 마이그레이션 실행 전 백업
- 모델 변경 시 alembic 사용
- 데이터 무결성 유지

### 코드 품질:
- 모든 함수에 docstring 추가
- 타입 힌트 사용
- 예외 처리 철저히

### 보안 고려사항:
- 사용자별 데이터 접근 제어
- 입력 데이터 검증 강화
- SQL 인젝션 방지

---

## 📞 **커뮤니케이션**

### 프론트엔드 팀과 공유할 사항:
- API 엔드포인트 명세
- 데이터 모델 변경사항
- 새로운 기능 요구사항

### 진행 상황 공유:
- 매일 아침/저녁 스크럼
- API 변경 즉시 공유
- 오류 발견 즉시 공유

---

## 🔄 **API 엔드포인트 명세** (프론트엔드 팀과 공유)

### 기존 API (확인용):
```
GET    /api/auth/me          # 현재 사용자 정보
GET    /api/tasks/           # 일정 목록
POST   /api/tasks/           # 일정 생성
PATCH  /api/tasks/{id}/complete  # 일정 완료 토글
```

### 신규 API (약 관리):
```
GET    /api/medicine/                    # 약 목록
POST   /api/medicine/                    # 약 생성
GET    /api/medicine/{id}                # 약 상세
PUT    /api/medicine/{id}                # 약 수정
DELETE /api/medicine/{id}                # 약 삭제

GET    /api/medicine-alarms/             # 약 알림 목록
POST   /api/medicine-alarms/             # 약 알림 생성
PUT    /api/medicine-alarms/{id}         # 약 알림 수정
DELETE /api/medicine-alarms/{id}         # 약 알림 삭제
```

---

**🎯 목표:** 백엔드 MVP 완성 및 프론트엔드와의 완벽한 연동
# 🔧 작업자 B (백엔드) TODO 리스트

## 📋 작업 범위
- `backend/routers/*.py` - API 라우터
- `backend/models/*.py` - 데이터베이스 모델
- `backend/schemas/*.py` - Pydantic 스키마
- `backend/services/*.py` - 비즈니스 로직
- `backend/database.py` - 데이터베이스 설정
- `backend/main.py` - FastAPI 앱 설정

---

## 🎯 Phase 1: 기본 기능 완성 (우선순위: 최고)

### ✅ Step 1-1: 일정 완료 토글 API 수정git b
**파일**: `backend/routers/tasks.py`

- [ ] **CORS 설정 확인**
  - `PATCH` 메서드 허용 확인
  - `OPTIONS` preflight 요청 처리 확인
  - `main.py`의 CORSMiddleware 설정 확인

- [ ] **API 엔드포인트 수정**
  ```python
  @router.patch("/{task_id}/complete")
  async def toggle_task_completion(
      task_id: int,
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      일정 완료 상태 토글
      """
      task = db.query(Task).filter(
          and_(Task.id == task_id, Task.owner_id == current_user.id)
      ).first()
      
      if not task:
          raise HTTPException(
              status_code=status.HTTP_404_NOT_FOUND,
              detail="일정을 찾을 수 없습니다"
          )
      
      task.completed = not task.completed
      if task.completed:
          task.completed_at = datetime.now()
      else:
          task.completed_at = None
      
      db.commit()
      db.refresh(task)
      
      return {
          "status": 200,
          "message": "일정이 완료 처리되었습니다" if task.completed else "일정 완료가 해제되었습니다",
          "data": {
              "id": task.id,
              "completed": task.completed,
              "completed_at": task.completed_at.isoformat() if task.completed_at else None
          }
      }
  ```

- [ ] **응답 형식 통일**
  - 성공 시: `{status: 200, message: "...", data: {...}}`
  - 실패 시: 적절한 HTTP 상태 코드와 에러 메시지

- [ ] **테스트**
  - Swagger UI에서 테스트
  - CORS 오류 확인
  - 작업자 A와 통합 테스트

**예상 소요 시간**: 1-2시간

---

### ✅ Step 1-2: 날짜별 일정 조회 API 개선
**파일**: `backend/routers/tasks.py`

- [ ] **쿼리 파라미터 추가**
  ```python
  @router.get("/", response_model=TaskListResponse)
  async def get_tasks(
      date: Optional[str] = Query(None, description="날짜 필터 (YYYY-MM-DD)"),
      completed: Optional[bool] = Query(None, description="완료 여부 필터"),
      skip: int = Query(0, ge=0),
      limit: int = Query(100, ge=1, le=1000),
      filter_params: TaskFilter = Depends(),
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      일정 목록 조회
      날짜별, 완료 여부별 필터링 지원
      """
      query = db.query(Task).filter(Task.owner_id == current_user.id)
      
      # 날짜 필터
      if date:
          from datetime import datetime
          filter_date = datetime.strptime(date, "%Y-%m-%d").date()
          query = query.filter(Task.date == filter_date)
      
      # 완료 여부 필터
      if completed is not None:
          query = query.filter(Task.completed == completed)
      
      # 기존 필터 적용
      # ... (기존 코드)
      
      # 집계 데이터 계산
      total = query.count()
      completed_count = query.filter(Task.completed == True).count()
      remaining_count = total - completed_count
      
      tasks = query.offset(skip).limit(limit).all()
      
      return TaskListResponse(
          tasks=[TaskResponse.from_orm(task) for task in tasks],
          total=total,
          completed=completed_count,
          remaining=remaining_count,
          page=skip // limit + 1,
          per_page=limit
      )
  ```

- [ ] **응답에 집계 데이터 추가**
  - `TaskListResponse` 스키마에 `completed`, `remaining` 필드 추가

- [ ] **테스트**
  - 다양한 날짜로 테스트
  - 필터링 옵션 테스트
  - 집계 데이터 확인

**예상 소요 시간**: 2-3시간

---

### ✅ Step 1-3: 약 알림 API 완성
**파일**: `backend/routers/medicine.py`

**현재 상태**: 기본 CRUD는 구현됨, 다음 기능 추가 필요

- [ ] **오늘의 약 알림 API 개선**
  - `GET /api/medicine/alarms/today` 응답 형식 개선
  - 복용 시간별 정렬
  - 복용 완료 여부 포함

- [ ] **복용 완료 기록 API 개선**
  - `POST /api/medicine/taken` 응답 형식 개선
  - 다음 알림 시간 계산 로직 확인

- [ ] **약 알림 스케줄링 준비**
  - 다음 알림 시간 계산 로직 확인
  - 알림 시간 체크 로직 준비

- [ ] **테스트**
  - 모든 CRUD 작업 테스트
  - 시간 검증 테스트
  - 작업자 A와 통합 테스트

**예상 소요 시간**: 2-3시간

---

### ✅ Step 1-4: 약 알림 스케줄링 구현
**파일**: `backend/services/medicine_scheduler.py` (새 파일)

- [ ] **백그라운드 작업 설정**
  ```python
  from apscheduler.schedulers.background import BackgroundScheduler
  from apscheduler.triggers.cron import CronTrigger
  
  scheduler = BackgroundScheduler()
  
  def check_medicine_alarms():
      """
      약 복용 시간 체크 및 알림 전송
      """
      # 활성화된 약 알림 조회
      # 복용 시간 도래 확인
      # 알림 전송 (WebSocket 또는 로그 저장)
      pass
  
  # 1분마다 실행
  scheduler.add_job(
      check_medicine_alarms,
      trigger=CronTrigger(minute='*'),
      id='check_medicine_alarms'
  )
  
  scheduler.start()
  ```

- [ ] **알림 전송 로직**
  - 복용 시간 도래 시 알림 로그 저장
  - WebSocket으로 실시간 알림 전송 (Phase 4에서 구현)
  - 또는 프론트엔드에서 폴링하도록 API 제공

- [ ] **알림 로그 저장**
  - `notification_logs` 테이블에 기록
  - 알림 전송 시간, 상태 저장

**참고**: 
- 초기에는 알림 로그만 저장하고, 프론트엔드에서 폴링
- Phase 4에서 WebSocket으로 업그레이드

**예상 소요 시간**: 3-4시간

---

### ✅ Step 1-5: 알림 설정 API
**파일**: `backend/routers/auth.py` 또는 `backend/routers/users.py` (새 파일)

- [ ] **알림 설정 조회**
  ```python
  @router.get("/users/me/notification_settings")
  async def get_notification_settings(
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      사용자 알림 설정 조회
      """
      return {
          "status": 200,
          "message": "성공",
          "data": {
              "enabled": current_user.notification_enabled,
              "task_reminder_minutes": current_user.task_reminder_minutes,
              "medicine_reminder_enabled": current_user.medicine_reminder_enabled
          }
      }
  ```

- [ ] **알림 설정 업데이트**
  ```python
  @router.patch("/users/me/notification_settings")
  async def update_notification_settings(
      settings: NotificationSettingsUpdate,
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      사용자 알림 설정 업데이트
      """
      # 설정 업데이트
      # 데이터베이스 저장
      # 응답 반환
  ```

- [ ] **데이터베이스 마이그레이션**
  - `users` 테이블에 알림 설정 컬럼 추가
  - 또는 별도 `notification_settings` 테이블 생성

- [ ] **테스트**
  - 설정 조회/업데이트 테스트
  - 작업자 A와 통합 테스트

**예상 소요 시간**: 2-3시간

---

## 🗺️ Phase 2: 위치/지도 기능 (Phase 1 완료 후)

### ✅ Step 2-1: 위치 추적 API
**파일**: `backend/routers/location.py` (새 파일)

- [ ] **위치 업데이트 API**
  ```python
  @router.post("/location/")
  async def update_location(
      location: LocationUpdate,
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      현재 위치 업데이트
      """
      # 위치 데이터 저장
      # 위치 이력 저장
      # 응답 반환
  ```

- [ ] **현재 위치 조회 API**
  ```python
  @router.get("/location/current")
  async def get_current_location(
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      현재 위치 조회
      """
  ```

- [ ] **위치 이력 조회 API**
  ```python
  @router.get("/location/history")
  async def get_location_history(
      date_from: Optional[str] = None,
      date_to: Optional[str] = None,
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      위치 이력 조회
      """
  ```

- [ ] **안전 구역 설정 API**
  ```python
  @router.post("/location/safe-zones")
  async def create_safe_zone(
      safe_zone: SafeZoneCreate,
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      안전 구역 설정
      """
  ```

- [ ] **데이터베이스 모델 생성**
  - `Location` 모델 생성
  - `SafeZone` 모델 생성

- [ ] **테스트**
  - 모든 API 테스트
  - 위치 데이터 저장 확인

**예상 소요 시간**: 4-5시간

---

### ✅ Step 2-2: 카카오 지도 API 프록시
**파일**: `backend/services/kakao_map_service.py` (새 파일), `backend/routers/map.py` (새 파일)

- [ ] **카카오 지도 API 서비스**
  ```python
  class KakaoMapService:
      def __init__(self):
          self.api_key = os.getenv("KAKAO_MAP_API_KEY")
          self.base_url = "https://dapi.kakao.com/v2"
      
      def search_places(self, query: str):
          """
          장소 검색
          """
          pass
      
      def get_route(self, origin: tuple, destination: tuple):
          """
          경로 계산
          """
          pass
      
      def geocode(self, address: str):
          """
          주소 → 좌표 변환
          """
          pass
      
      def reverse_geocode(self, lat: float, lng: float):
          """
          좌표 → 주소 변환
          """
          pass
  ```

- [ ] **API 라우터 생성**
  ```python
  @router.post("/map/search")
  async def search_places(
      query: str,
      current_user: User = Depends(get_current_user)
  ):
      """
      장소 검색
      """
      pass
  
  @router.post("/map/route")
  async def get_route(
      origin: tuple,
      destination: tuple,
      current_user: User = Depends(get_current_user)
  ):
      """
      경로 계산
      """
      pass
  ```

- [ ] **환경 변수 설정**
  - `.env` 파일에 `KAKAO_MAP_API_KEY` 추가

- [ ] **테스트**
  - 카카오 지도 API 연동 테스트
  - 작업자 A와 통합 테스트

**예상 소요 시간**: 4-5시간

---

## 🤖 Phase 3: AI/모니터링 기능 (Phase 2 완료 후)

### ✅ Step 3-1: AI 일정 추출 API 개선
**파일**: `backend/routers/ai.py`

**현재 상태**: 기본 구현됨, 개선 필요

- [ ] **일정 추출 API 개선**
  ```python
  @router.post("/ai/extract-schedule")
  async def extract_schedule(
      request: ScheduleExtractRequest,
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      자연어에서 일정 정보 추출
      """
      # AI로 일정 정보 추출
      # 기존 일정과 충돌 확인
      # 일정 자동 생성 (선택적)
      # 응답 반환
  ```

- [ ] **충돌 감지 로직**
  - 추출된 일정과 기존 일정 비교
  - 충돌하는 일정 목록 반환

- [ ] **일정 자동 생성 옵션**
  - `auto_create` 파라미터 추가
  - True일 경우 자동으로 일정 생성

- [ ] **테스트**
  - 다양한 자연어 입력 테스트
  - 충돌 감지 테스트

**예상 소요 시간**: 3-4시간

---

### ✅ Step 3-2: 보호자 모니터링 API
**파일**: `backend/routers/monitoring.py` (새 파일)

- [ ] **건강 데이터 수집 API**
  ```python
  @router.post("/monitoring/data")
  async def collect_monitoring_data(
      data: MonitoringDataCreate,
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      건강 데이터 수집
      """
      # 데이터 저장
      # 이상 징후 감지
      # 비상 알림 (필요 시)
  ```

- [ ] **현재 상태 조회 API**
  ```python
  @router.get("/monitoring/current")
  async def get_current_status(
      user_id: int,  # 부모님 ID
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      현재 상태 조회
      """
  ```

- [ ] **분석 데이터 API**
  ```python
  @router.get("/monitoring/analytics")
  async def get_analytics(
      user_id: int,
      period: str = "daily",  # daily, weekly, monthly
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      분석 데이터 조회
      """
  ```

- [ ] **데이터베이스 모델 생성**
  - `MonitoringData` 모델 생성

- [ ] **테스트**
  - 데이터 수집 테스트
  - 분석 데이터 확인

**예상 소요 시간**: 5-6시간

---

## 📊 Phase 4: 고급 기능 (Phase 3 완료 후)

### ✅ Step 4-1: 건강 데이터 시각화 API
**파일**: `backend/routers/health.py` (새 파일)

- [ ] **건강 데이터 조회 API**
  ```python
  @router.get("/health/data")
  async def get_health_data(
      date_from: Optional[str] = None,
      date_to: Optional[str] = None,
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      건강 데이터 조회
      """
  ```

- [ ] **리포트 생성 API**
  ```python
  @router.get("/health/report")
  async def generate_health_report(
      period: str = "weekly",
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      건강 리포트 생성
      """
  ```

- [ ] **데이터 내보내기 API**
  ```python
  @router.get("/health/export")
  async def export_health_data(
      format: str = "csv",  # csv, json
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      건강 데이터 내보내기
      """
  ```

- [ ] **테스트**
  - 데이터 조회 테스트
  - 리포트 생성 테스트

**예상 소요 시간**: 4-5시간

---

### ✅ Step 4-2: 실시간 기능 (WebSocket)
**파일**: `backend/routers/websocket.py` (새 파일)

- [ ] **WebSocket 엔드포인트 설정**
  ```python
  from fastapi import WebSocket
  
  @router.websocket("/ws/{user_id}")
  async def websocket_endpoint(
      websocket: WebSocket,
      user_id: int
  ):
      """
      WebSocket 연결
      """
      await websocket.accept()
      # 연결 관리
      # 메시지 수신/전송
  ```

- [ ] **실시간 알림 전송**
  - 약 알림 시간 도래 시 WebSocket으로 전송
  - 일정 알림 전송

- [ ] **실시간 위치 공유**
  - 위치 업데이트 시 WebSocket으로 전송

- [ ] **오프라인 동기화 API**
  ```python
  @router.post("/sync")
  async def sync_offline_data(
      data: OfflineDataSync,
      current_user: User = Depends(get_current_user),
      db: Session = Depends(get_db)
  ):
      """
      오프라인 데이터 동기화
      """
  ```

- [ ] **테스트**
  - WebSocket 연결 테스트
  - 실시간 알림 전송 테스트

**예상 소요 시간**: 6-8시간

---

## 📝 공통 작업

### ✅ 공통-1: API 응답 형식 통일
**파일**: 모든 라우터 파일

- [ ] **응답 형식 통일**
  - 성공: `{status: 200, message: "...", data: {...}}`
  - 실패: `{status: 400/404/500, message: "...", data: null}`

- [ ] **에러 처리 개선**
  - 모든 엔드포인트에 일관된 에러 처리
  - 적절한 HTTP 상태 코드 사용

**예상 소요 시간**: 3-4시간

---

### ✅ 공통-2: Swagger 문서화
**파일**: 모든 라우터 파일

- [ ] **API 문서화**
  - 모든 엔드포인트에 설명 추가
  - 요청/응답 예시 추가
  - 에러 응답 문서화

- [ ] **Swagger UI 확인**
  - `/docs` 페이지에서 모든 API 확인
  - 문서 정확성 확인

**예상 소요 시간**: 2-3시간

---

### ✅ 공통-3: 데이터베이스 마이그레이션
**파일**: `backend/database.py`, Alembic 마이그레이션

- [ ] **필요한 테이블 생성**
  - `notification_settings` 테이블
  - `locations` 테이블
  - `safe_zones` 테이블
  - `monitoring_data` 테이블

- [ ] **기존 테이블 수정**
  - `users` 테이블에 알림 설정 컬럼 추가 (선택적)

- [ ] **마이그레이션 스크립트 작성**
  - Alembic 마이그레이션 생성
  - 마이그레이션 테스트

**예상 소요 시간**: 3-4시간

---

## ✅ 통합 체크리스트

### Phase 1 완료 전 확인
- [ ] CORS 설정 확인 (모든 메서드 허용)
- [ ] 모든 엔드포인트 Swagger 문서화
- [ ] 에러 응답 형식 통일
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 작업자 A와 API 연동 테스트

### Phase 2 완료 전 확인
- [ ] 카카오 지도 API 키 설정 확인
- [ ] 위치 데이터 보안 확인
- [ ] 위치 데이터 저장 성능 확인

### Phase 3 완료 전 확인
- [ ] AI API 키 설정 확인
- [ ] 모니터링 데이터 수집 주기 확인
- [ ] 이상 징후 감지 로직 확인

### Phase 4 완료 전 확인
- [ ] WebSocket 연결 안정성 확인
- [ ] 실시간 알림 전송 성능 확인
- [ ] 오프라인 동기화 로직 확인

---

## 🚨 주의사항

1. **작업자 A와의 협업**
   - API 완료 후 작업자 A에게 알림
   - API 스펙 변경 시 즉시 소통
   - Swagger 문서 최신 상태 유지

2. **파일 충돌 방지**
   - 작업자 A는 `frontend/` 폴더만 수정
   - 작업자 B는 `backend/` 폴더만 수정
   - 공통 파일 수정 시 사전 협의

3. **코드 품질**
   - Python 타입 힌트 명시
   - 에러 처리 필수
   - 주석 작성 (한국어)
   - 함수 최대 100줄 이하

4. **테스트**
   - 각 단계 완료 후 테스트 필수
   - 작업자 A와 통합 테스트 진행
   - Swagger UI에서 수동 테스트

5. **보안**
   - JWT 토큰 검증 필수
   - 사용자 권한 확인
   - SQL Injection 방지
   - XSS 방지

---

**작성일**: 2025-01-19  
**최종 수정**: 2025-01-19

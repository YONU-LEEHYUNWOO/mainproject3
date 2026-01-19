# 🔧 작업자 A (백엔드) TODO 리스트

## 📋 작업 범위
- **기존 파일 수정/개선**: `tasks.py`, `medicine.py`, `ai.py`, `auth.py`
- **공통 작업**: API 응답 형식 통일, 부모/자식 모드 구분
- **Swagger 문서화**: 자신이 작업한 파일들

## ⚠️ 최우선 작업: API 응답 형식 통일 (모든 Phase 시작 전 필수)

### ✅ 공통-0: API 응답 형식 통일 (최우선)
**파일**: `backend/main.py`, 모든 라우터 파일
**우선순위**: 최우선 (Phase 1 시작 전 완료 권장)

- [ ] **CORS 설정 강화** (`main.py`)
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:5173", "http://localhost:3000"],  # 프론트엔드 URL
      allow_credentials=True,
      allow_methods=["*"],  # GET, POST, PUT, PATCH, DELETE, OPTIONS 모두 허용
      allow_headers=["*"],
  )
  ```

- [ ] **성공 응답 형식 통일**
  ```python
  # 모든 성공 응답은 다음 형식 사용
  {
      "status": 200,
      "message": "성공 메시지",
      "data": {...}  # 실제 데이터
  }
  ```

- [ ] **에러 응답 형식 통일**
  ```python
  # 422 유효성 검사 오류 (Pydantic 기본 형식)
  {
      "detail": [
          {
              "loc": ["field_name"],
              "msg": "에러 메시지",
              "type": "error_type"
          }
      ]
  }
  
  # 기타 에러 (HTTPException 사용)
  HTTPException(
      status_code=400/404/500,
      detail="에러 메시지"
  )
  ```

- [ ] **기존 API 응답 형식 점검 및 수정**
  - `tasks.py`의 모든 엔드포인트 응답 형식 확인 및 수정
  - `medicine.py`의 모든 엔드포인트 응답 형식 확인 및 수정
  - `ai.py`의 모든 엔드포인트 응답 형식 확인 및 수정
  - `auth.py`의 모든 엔드포인트 응답 형식 확인 및 수정

**예상 소요 시간**: 2-3시간
**⚠️ 중요**: 이 작업을 먼저 완료하면 이후 모든 API 개발이 일관성 있게 진행됩니다.

---

## 🎯 Phase 1: 기본 기능 완성 (우선순위: 최고)

### ✅ Step 1-1: 일정 완료 토글 API 수정
**파일**: `backend/routers/tasks.py`

- [ ] **CORS 설정 확인** (공통-0에서 이미 설정했다면 확인만)
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
  - 프론트엔드와 통합 테스트

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
      
      return {
          "status": 200,
          "message": "성공",
          "data": {
              "tasks": [TaskResponse.from_orm(task) for task in tasks],
              "total": total,
              "completed": completed_count,
              "remaining": remaining_count,
              "page": skip // limit + 1,
              "per_page": limit
          }
      }
  ```

- [ ] **응답에 집계 데이터 추가**
  - `TaskListResponse` 스키마에 `completed`, `remaining` 필드 추가 (필요 시)
  - 또는 응답 형식 통일을 위해 위 코드처럼 직접 반환

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
  - `GET /api/medicine/today` 또는 `GET /api/medicine/alarms/today` 응답 형식 개선
  - **응답 형식 (프론트엔드 기대 형식)**:
    ```python
    {
        "status": 200,
        "message": "성공",
        "data": {
            "alarms": [
                {
                    "id": 1,
                    "medicine_name": "혈압약",
                    "dosage": "1정",
                    "time_1": "09:00",
                    "time_2": "21:00",
                    "time_3": null,
                    "time_4": null,
                    "last_taken": "2025-01-19T09:05:00",
                    "next_reminder": "2025-01-19T21:00:00",
                    "is_taken": false,
                    "is_active": true
                }
            ]
        }
    }
    ```
  - 복용 시간별 정렬 (time_1 기준)
  - 복용 완료 여부 포함 (`is_taken` 필드)

- [ ] **복용 완료 기록 API 개선**
  - `POST /api/medicine/taken` 또는 `POST /api/medicine/alarms/{id}/taken` 응답 형식 개선
  - 다음 알림 시간 계산 로직 확인

- [ ] **약 알림 스케줄링 준비**
  - 다음 알림 시간 계산 로직 확인
  - 알림 시간 체크 로직 준비

- [ ] **테스트**
  - 모든 CRUD 작업 테스트
  - 시간 검증 테스트
  - 프론트엔드와 통합 테스트

**예상 소요 시간**: 2-3시간

---

## 🤖 Phase 3: AI/모니터링 기능

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
      # 응답 형식 통일 적용
      return {
          "status": 200,
          "message": "일정이 추출되었습니다",
          "data": {...}
      }
  ```

- [ ] **충돌 감지 로직**
  - 추출된 일정과 기존 일정 비교
  - 충돌하는 일정 목록 반환

- [ ] **일정 자동 생성 옵션**
  - `auto_create` 파라미터 추가
  - True일 경우 자동으로 일정 생성

- [ ] **응답 형식 통일**
  - 모든 응답을 통일된 형식으로 변경

- [ ] **테스트**
  - 다양한 자연어 입력 테스트
  - 충돌 감지 테스트

**예상 소요 시간**: 3-4시간

---

## 📝 공통 작업

### ✅ 공통-1: 부모/자식 모드 구분 API
**파일**: `backend/routers/tasks.py`, `backend/routers/medicine.py`, `backend/routers/ai.py`

- [ ] **보호자 관계 확인 헬퍼 함수 생성**
  ```python
  # backend/routers/guardians.py 또는 utils.py에 추가
  def verify_guardian_relationship(
      guardian_id: int,  # 자식 ID
      parent_id: int,    # 부모 ID
      db: Session
  ) -> bool:
      """
      보호자 관계 확인
      """
      guardian = db.query(Guardian).filter(
          and_(
              Guardian.guardian_id == guardian_id,
              Guardian.parent_id == parent_id,
              Guardian.is_active == True
          )
      ).first()
      return guardian is not None
  ```

- [ ] **모드별 권한 확인 로직 추가**
  - 부모 모드: 자신의 데이터만 조회/수정
  - 자식 모드: 부모님 데이터 조회 (읽기 전용 또는 제한된 수정)

- [ ] **자식 모드에서 부모님 데이터 조회 시 권한 확인**
  - 약 알림 조회: `GET /api/medicine/alarms?parent_id={parent_id}` (필요 시)
  - 일정 조회: `GET /api/tasks?parent_id={parent_id}` (필요 시)

- [ ] **기존 API에 모드 구분 로직 적용**
  - `tasks.py`의 모든 엔드포인트에 모드 확인 로직 추가
  - `medicine.py`의 모든 엔드포인트에 모드 확인 로직 추가

**예상 소요 시간**: 2-3시간

---

### ✅ 공통-2: Swagger 문서화
**파일**: 자신이 작업한 모든 라우터 파일

- [ ] **API 문서화**
  - `tasks.py`의 모든 엔드포인트에 설명 추가
  - `medicine.py`의 모든 엔드포인트에 설명 추가
  - `ai.py`의 모든 엔드포인트에 설명 추가
  - 요청/응답 예시 추가
  - 에러 응답 문서화

- [ ] **Swagger UI 확인**
  - `/docs` 페이지에서 모든 API 확인
  - 문서 정확성 확인

**예상 소요 시간**: 2-3시간

---

## ✅ 통합 체크리스트

### Phase 1 시작 전 확인 (최우선)
- [ ] **공통-0: API 응답 형식 통일 완료** ⚠️ 필수
- [ ] CORS 설정 확인 (모든 메서드 허용)
- [ ] 기본 에러 처리 로직 구현

### Phase 1 완료 전 확인
- [ ] 모든 엔드포인트 Swagger 문서화
- [ ] 에러 응답 형식 통일 확인
- [ ] 작업자 B와 API 연동 테스트
- [ ] 약 알림 API 응답 형식 확인 (프론트엔드와 일치)

---

## 🚨 주의사항

1. **작업자 B와의 협업**
   - API 완료 후 작업자 B에게 알림
   - API 스펙 변경 시 즉시 소통
   - Swagger 문서 최신 상태 유지

2. **파일 충돌 방지**
   - 작업자 A는 `tasks.py`, `medicine.py`, `ai.py`, `auth.py`만 수정
   - 작업자 B는 새 파일들(`location.py`, `map.py` 등) 작업
   - 공통 파일 수정 시 사전 협의

3. **코드 품질**
   - Python 타입 힌트 명시
   - 에러 처리 필수
   - 주석 작성 (한국어)
   - 함수 최대 100줄 이하

4. **테스트**
   - 각 단계 완료 후 테스트 필수
   - 프론트엔드와 통합 테스트 진행
   - Swagger UI에서 수동 테스트

5. **보안**
   - JWT 토큰 검증 필수
   - 사용자 권한 확인
   - SQL Injection 방지
   - XSS 방지

---

## 📌 프론트엔드 연동 참고사항

### 프론트엔드에서 기대하는 API 응답 형식
- **성공**: `{status: 200, message: "...", data: {...}}`
- **422 에러**: Pydantic 기본 형식 `{detail: [{loc: [...], msg: "...", type: "..."}]}`
- **기타 에러**: HTTP 상태 코드와 `detail` 필드

### 작업 순서 권장사항
1. **공통-0 완료** (최우선) → 모든 API 응답 형식 통일
2. **Step 1-1 완료** → 일정 완료 토글 API
3. **Step 1-2 완료** → 날짜별 일정 조회 API
4. **Step 1-3 완료** → 약 알림 API
5. **공통-1 완료** → 부모/자식 모드 구분
6. **공통-2 완료** → Swagger 문서화

---

**작성일**: 2025-01-19  
**최종 수정**: 2025-01-19  
**작업자**: A (기존 파일 수정/개선 담당)

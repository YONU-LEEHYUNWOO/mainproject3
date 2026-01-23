"""
일정 관리 API 라우터
일정의 CRUD 기능을 제공합니다.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import traceback
from datetime import datetime, date as date_class, time as time_class, datetime as datetime_class
from utils.logger import log_info, log_error, log_warning

from database import get_db
from auth import get_current_user
from models.user import User
from models.task import Task
from models.guardian import Guardian
from schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskFilter
)
from utils.response import success_response
from utils.serializer import orm_to_dict, serialize_datetime_objects

# AI 분석 및 경로 서비스
from services.ai_service import AIService
from services.kakao_service import KakaoService
ai_service = AIService()

router = APIRouter()

@router.get("/{task_id}/analyze")
async def analyze_task_travel(
    task_id: int,
    lat: Optional[float] = Query(None, description="현재 위도"),
    lng: Optional[float] = Query(None, description="현재 경도"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    일정 상세 분석 (이동 시간, 추천 출발 시간, AI 가이드)
    """
    # 1. 일정 조회
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(status_code=404, detail="일정을 찾을 수 없습니다")
    
    # 권한 확인: 본인 일정이거나, 보호자 관계인 경우
    if task.owner_id != current_user.id:
        from models.guardian import Guardian
        is_guardian = db.query(Guardian).filter(
            Guardian.guardian_user_id == current_user.id,
            Guardian.user_id == task.owner_id
        ).first()
        if not is_guardian:
            raise HTTPException(status_code=403, detail="일정 분석 권한이 없습니다")
    
    if not task.latitude or not task.longitude:
        return success_response(
            data={"guide": "장소 좌표 정보가 없어 이동 분석을 할 수 없습니다.", "departure_time": None},
            message="좌표 정보 부족"
        )

    # 2. 실시간 경로 계산 (카카오 API)
    # 현재 위치가 없으면 마지막 알려진 위치 사용 고려 (여기서는 간단히 필수 처리 또는 에러)
    if lat is None or lng is None:
        # 사용자 최근 위치 조회
        from models.location import Location
        last_loc = db.query(Location).filter(Location.user_id == current_user.id).order_by(Location.created_at.desc()).first()
        if last_loc:
            lat, lng = last_loc.latitude, last_loc.longitude
        else:
            return success_response(
                data={"guide": "현재 위치 정보를 알 수 없어 이동 분석이 불가능합니다.", "departure_time": None},
                message="현재 위치 정보 없음"
            )

    try:
        route_data = KakaoService.get_route(
            origin_x=lng, origin_y=lat,
            destination_x=task.longitude, destination_y=task.latitude
        )
        
        if not route_data:
            return success_response(
                data={"guide": "경로를 찾을 수 없습니다.", "departure_time": None},
                message="경로 검색 불가"
            )

        # 3. AI 가이드 생성
        task_info = {"title": task.title, "location": task.location, "time": task.time.strftime("%H:%M") if task.time else None}
        ai_guide = await ai_service.generate_task_guide(task_info, route_data)
        
        return success_response(
            data={
                "route": {
                    "distance": route_data["distance"],
                    "duration": route_data["duration"],
                    "fare": route_data["fare"]
                },
                "guide": ai_guide.get("guide"),
                "departure_time": ai_guide.get("departure_time")
            },
            message="분석 완료"
        )
        
    except Exception as e:
        log_error(f"Task analysis endpoint error: {e}")
        return success_response(
            data={"guide": "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", "departure_time": None},
            message="분석 오류"
        )

# 테스트 엔드포인트 (인증 없이 접근 가능)
@router.get("/test")
async def test_tasks_endpoint():
    """테스트 엔드포인트 - 서버 연결 확인용"""
    import sys
    print("=" * 60, file=sys.stderr)
    print("[TEST] /api/tasks/test 엔드포인트 호출됨", file=sys.stderr)
    print("=" * 60, file=sys.stderr)
    sys.stderr.flush()
    return {"message": "Tasks API 서버 연결 성공", "status": "ok"}

@router.get("/")
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
    사용자의 일정을 필터링하여 조회합니다.
    날짜별, 완료 여부별 필터링 지원
    """
    query = db.query(Task).filter(Task.owner_id == current_user.id)

    # 날짜 필터 (쿼리 파라미터)
    if date:
        filter_date = datetime.strptime(date, "%Y-%m-%d").date()
        query = query.filter(Task.date == filter_date)

    # 완료 여부 필터 (쿼리 파라미터 우선)
    if completed is not None:
        query = query.filter(Task.completed == completed)
    elif filter_params.completed is not None:
        query = query.filter(Task.completed == filter_params.completed)

    # 기존 필터 적용
    if filter_params.date_from:
        query = query.filter(Task.date >= filter_params.date_from)
    if filter_params.date_to:
        query = query.filter(Task.date <= filter_params.date_to)
    if filter_params.priority:
        query = query.filter(Task.priority == filter_params.priority)
    if filter_params.category:
        query = query.filter(Task.category == filter_params.category)
    if filter_params.search:
        search_term = f"%{filter_params.search}%"
        query = query.filter(
            or_(
                Task.title.ilike(search_term),
                Task.description.ilike(search_term),
                Task.location.ilike(search_term)
            )
        )

    # 정렬 (날짜 및 시간순)
    query = query.order_by(Task.date.asc(), Task.time.asc())

    # 집계 데이터 계산
    total = query.count()
    completed_count = query.filter(Task.completed == True).count()
    remaining_count = total - completed_count

    # 페이징
    tasks = query.offset(skip).limit(limit).all()

    # 공통 serializer를 사용하여 ORM 객체를 dict로 변환
    # 모든 datetime/time/date 객체가 자동으로 문자열로 변환됨
    task_list = []
    for task in tasks:
        try:
            # 공통 serializer를 사용하여 안전하게 변환
            task_dict = orm_to_dict(task)
            task_list.append(task_dict)
        except Exception as e:
            # 변환 실패 시 직접 딕셔너리 생성 후 serializer 적용
            task_dict = {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "date": task.date,
                "time": task.time,
                "location": task.location,
                "latitude": task.latitude,
                "longitude": task.longitude,
                "completed": task.completed,
                "priority": task.priority,
                "reminder_minutes": task.reminder_minutes,
                "category": task.category,
                "owner_id": task.owner_id,
                "created_at": task.created_at,
                "updated_at": task.updated_at
            }
            # datetime 객체 변환
            task_dict = serialize_datetime_objects(task_dict)
            task_list.append(task_dict)
    
    return success_response(
        data={
            "tasks": task_list,
            "total": total,
            "completed": completed_count,
            "remaining": remaining_count,
            "page": skip // limit + 1,
            "per_page": limit
        },
        message="성공"
    )

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    새 일정 생성
    SQLAlchemy ORM 객체를 dict로 변환하고, 모든 날짜/시간 객체를 문자열로 변환하여 반환합니다.
    """
    log_info(f"[CREATE_TASK] 함수 시작 - user_id={current_user.id}, title={task.title}, date={task.date}, time={task.time}")
    try:
        
        # Pydantic v1/v2 호환성을 위한 데이터 추출
        try:
            if hasattr(task, 'model_dump'):
                task_data = task.model_dump()
            else:
                task_data = task.dict()
        except Exception as e:
            log_error(f"[CREATE_TASK] 데이터 추출 오류: {type(e).__name__}: {str(e)}", exc_info=e)
            # 직접 속성 접근으로 폴백
            task_data = {
                'title': task.title,
                'description': getattr(task, 'description', None),
                'date': task.date,
                'time': getattr(task, 'time', None),
                'location': getattr(task, 'location', None),
                'latitude': getattr(task, 'latitude', None),
                'longitude': getattr(task, 'longitude', None),
                'completed': getattr(task, 'completed', False),
                'priority': getattr(task, 'priority', 2),
                'reminder_minutes': getattr(task, 'reminder_minutes', 0),
                'category': getattr(task, 'category', '일반')
            }
        
        log_info(f"[CREATE_TASK] 변환된 데이터 - date={task.date} (type: {type(task.date).__name__}), time={task.time} (type: {type(task.time).__name__})")
        
        # 문자열을 datetime 객체로 변환 (create_task 함수 내부에서만 수행)
        from datetime import date as date_class, time as time_class, datetime as datetime_class
        
        # date 문자열을 date 객체로 변환
        task_date_str = task.date
        if not task_date_str:
            raise ValueError("date 필드는 필수입니다")
        try:
            task_date = datetime_class.strptime(task_date_str, "%Y-%m-%d").date()
            log_info(f"[CREATE_TASK] date 문자열을 date 객체로 변환: {task_date_str} -> {task_date}")
        except ValueError as e:
            raise ValueError(f"Invalid date format: {task_date_str}. Expected format: YYYY-MM-DD")
        
        # time 문자열을 time 객체로 변환
        task_time = None
        if task.time and task.time.strip():
            try:
                hour, minute = map(int, task.time.strip().split(':'))
                task_time = time_class(hour=hour, minute=minute)
                log_info(f"[CREATE_TASK] time 문자열을 time 객체로 변환: {task.time} -> {task_time}")
            except (ValueError, AttributeError) as e:
                log_warning(f"[CREATE_TASK] time 변환 실패: {e}, None으로 설정")
                task_time = None
        
        # Task 객체 생성
        try:
            # 안전하게 속성 가져오기
            task_title = getattr(task, 'title', '')
            task_description = getattr(task, 'description', None)
            if task_description and isinstance(task_description, str) and not task_description.strip():
                task_description = None
            
            task_location = getattr(task, 'location', None)
            if task_location and isinstance(task_location, str) and not task_location.strip():
                task_location = None
            
            task_latitude = getattr(task, 'latitude', None)
            task_longitude = getattr(task, 'longitude', None)
            task_completed = getattr(task, 'completed', False)
            task_priority = getattr(task, 'priority', 2)
            task_reminder_minutes = getattr(task, 'reminder_minutes', 0)
            task_category = getattr(task, 'category', '일반')
            
            # 대상 사용자 ID 결정 (보호자 모드 지원)
            target_owner_id = current_user.id
            request_owner_id = getattr(task, 'owner_id', None)
            
            if request_owner_id and request_owner_id != current_user.id:
                # 보호자 관계 확인
                guardian = db.query(Guardian).filter(
                    Guardian.user_id == request_owner_id,
                    Guardian.guardian_user_id == current_user.id
                ).first()
                if not guardian:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="해당 사용자의 일정을 등록할 권한이 없습니다."
                    )
                target_owner_id = request_owner_id
                log_info(f"[CREATE_TASK] 보호자 대리 등록: guardian={current_user.id}, target={target_owner_id}")

            log_info(f"[CREATE_TASK] Task 객체 생성 시도 - title={task_title}, date={task_date}, time={task_time}, owner_id={target_owner_id}")
            
            db_task = Task(
                title=task_title,
                description=task_description,
                date=task_date,  # 변환된 date 객체 사용
                time=task_time,  # 변환된 time 객체 사용
                location=task_location,
                latitude=task_latitude,
                longitude=task_longitude,
                completed=task_completed,
                priority=task_priority,
                reminder_minutes=task_reminder_minutes,
                category=task_category,
                owner_id=target_owner_id
            )
            log_info(f"[CREATE_TASK] Task 객체 생성 완료 - id={db_task.id if hasattr(db_task, 'id') else 'N/A'}, title={db_task.title}")
        except Exception as e:
            log_error(f"[CREATE_TASK] Task 객체 생성 오류: {type(e).__name__}: {str(e)}", exc_info=e)
            raise
        
        try:
            db.add(db_task)
            log_info(f"[CREATE_TASK] DB에 추가 완료, 커밋 시도...")
            db.commit()
            log_info(f"[CREATE_TASK] 커밋 완료, refresh 시도...")
            db.refresh(db_task)
            log_info(f"[CREATE_TASK] refresh 완료, task_id={db_task.id}")
        except Exception as e:
            log_error(f"[CREATE_TASK] DB 작업 오류: {type(e).__name__}: {str(e)}", exc_info=e)
            db.rollback()
            raise
        
        # 응답 데이터 생성 - 공통 serializer를 사용하여 ORM 객체를 dict로 변환
        # 모든 datetime/time/date 객체가 자동으로 문자열로 변환됨
        response_data = orm_to_dict(db_task)
        
        # success_response를 사용하여 통일된 응답 형식으로 반환
        # 내부에서 datetime 객체 변환 및 JSON 직렬화가 안전하게 처리됨
        return success_response(
            data=response_data,
            message="일정이 생성되었습니다",
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        log_error(f"[CREATE_TASK] 일정 생성 오류: {type(e).__name__}: {str(e)}", exc_info=e)
        
        # 롤백
        db.rollback()
        log_info(f"[CREATE_TASK] 롤백 완료")
        
        # 상세한 오류 정보를 포함한 응답 생성
        import sys
        import io
        error_trace = io.StringIO()
        traceback.print_exc(file=error_trace)
        error_trace_str = error_trace.getvalue()
        
        # 프론트엔드에서 확인할 수 있도록 상세 오류 정보 포함
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": f"일정 생성 중 오류가 발생했습니다: {str(e)}",
                "error_type": type(e).__name__,
                "error_message": str(e),
                "traceback": error_trace_str.split('\n')[-10:] if len(error_trace_str.split('\n')) > 10 else error_trace_str.split('\n')
            }
        )

@router.get("/{task_id}")
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    특정 일정 조회
    """
    task = db.query(Task).filter(
        and_(Task.id == task_id, Task.owner_id == current_user.id)
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="일정을 찾을 수 없습니다"
        )

    # 공통 serializer를 사용하여 ORM 객체를 dict로 변환
    # 모든 datetime/time/date 객체가 자동으로 문자열로 변환됨
    response_data = orm_to_dict(task)
    
    return success_response(
        data=response_data,
        message="성공"
    )

@router.put("/{task_id}")
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    일정 수정
    """
    task = db.query(Task).filter(
        and_(Task.id == task_id, Task.owner_id == current_user.id)
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="일정을 찾을 수 없습니다"
        )

    # 업데이트할 필드만 적용
    # Pydantic v1/v2 호환성
    if hasattr(task_update, 'model_dump'):
        update_data = task_update.model_dump(exclude_unset=True)
    else:
        update_data = task_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == 'date' and value:
            try:
                # date 문자열을 객체로 변환
                setattr(task, field, datetime_class.strptime(value, "%Y-%m-%d").date())
            except ValueError:
                log_warning(f"[UPDATE_TASK] date 변환 실패: {value}")
                continue
        elif field == 'time' and value:
            try:
                # time 문자열을 객체로 변환
                hour, minute = map(int, value.strip().split(':'))
                setattr(task, field, time_class(hour=hour, minute=minute))
            except (ValueError, AttributeError):
                log_warning(f"[UPDATE_TASK] time 변환 실패: {value}")
                setattr(task, field, None)
        else:
            setattr(task, field, value)

    db.commit()
    db.refresh(task)
    
    # 공통 serializer를 사용하여 ORM 객체를 dict로 변환
    # 모든 datetime/time/date 객체가 자동으로 문자열로 변환됨
    response_data = orm_to_dict(task)
    
    return success_response(
        data=response_data,
        message="일정이 수정되었습니다"
    )

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    일정 삭제
    """
    task = db.query(Task).filter(
        and_(Task.id == task_id, Task.owner_id == current_user.id)
    ).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="일정을 찾을 수 없습니다"
        )

    db.delete(task)
    db.commit()
    
    return success_response(
        data=None,
        message="일정이 삭제되었습니다"
    )

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
    # completed_at 필드는 Task 모델에 없으므로 제거
    # 필요시 나중에 마이그레이션으로 추가 가능
    
    db.commit()
    db.refresh(task)
    
    return success_response(
        data={
            "id": task.id,
            "completed": task.completed
        },
            message="일정이 완료 처리되었습니다" if task.completed else "일정 완료가 해제되었습니다"
    )

@router.get("/today/count")
async def get_today_tasks_count(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    오늘의 일정 개수 조회 (보호자 권한 지원)
    """
    from datetime import date
    today = date.today()
    
    # 대상 사용자 ID 결정
    target_id = current_user.id
    if user_id and user_id != current_user.id:
        # 권한 확인 (보호자 관계인지)
        guardian = db.query(Guardian).filter(
            Guardian.user_id == user_id, 
            Guardian.guardian_user_id == current_user.id
        ).first()
        if not guardian:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="해당 사용자의 정보를 볼 권한이 없습니다."
            )
        target_id = user_id

    total_count = db.query(Task).filter(
        and_(Task.owner_id == target_id, Task.date == today)
    ).count()

    completed_count = db.query(Task).filter(
        and_(
            Task.owner_id == target_id,
            Task.date == today,
            Task.completed == True
        )
    ).count()

    return success_response(
        data={
            "total": total_count,
            "completed": completed_count,
            "remaining": total_count - completed_count
        },
        message="성공"
    )
"""
일정 관리 API 라우터
일정의 CRUD 기능을 제공합니다.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from database import get_db
from auth import get_current_user
from models.user import User
from models.task import Task
from schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskListResponse, TaskFilter
)

router = APIRouter()

@router.get("/", response_model=TaskListResponse)
async def get_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    filter_params: TaskFilter = Depends(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    일정 목록 조회
    사용자의 일정을 필터링하여 조회합니다.
    """
    query = db.query(Task).filter(Task.owner_id == current_user.id)

    # 필터 적용
    if filter_params.date_from:
        query = query.filter(Task.date >= filter_params.date_from)
    if filter_params.date_to:
        query = query.filter(Task.date <= filter_params.date_to)
    if filter_params.completed is not None:
        query = query.filter(Task.completed == filter_params.completed)
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

    # 페이징
    total = query.count()
    tasks = query.offset(skip).limit(limit).all()

    return TaskListResponse(
        tasks=[TaskResponse.from_orm(task) for task in tasks],
        total=total,
        page=skip // limit + 1,
        per_page=limit
    )

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    새 일정 생성
    """
    import logging
    # print(f"DEBUG: 받은 RAW 데이터: {task.__dict__}")  # 디버깅용
    # print(f"DEBUG: 받은 task 데이터: {task.dict()}")  # 디버깅용
    # print(f"DEBUG: task 타입: date={type(task.date)}, time={type(task.time)}")  # 타입 확인
    # print(f"DEBUG: time 값 확인: '{task.time}'")  # time 값 확인
    # 명시적으로 타입 변환
    task_data = task.dict()
    db_task = Task(
        title=task_data['title'],
        description=task_data.get('description'),
        date=task_data['date'],  # 이미 date 객체로 변환됨
        time=task_data.get('time'),  # 이미 time 객체로 변환됨
        location=task_data.get('location'),
        latitude=task_data.get('latitude'),
        longitude=task_data.get('longitude'),
        completed=task_data.get('completed', False),
        priority=task_data.get('priority', 2),
        reminder_minutes=task_data.get('reminder_minutes', 0),
        category=task_data.get('category', '일반'),
        owner_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return TaskResponse.from_orm(db_task)

@router.get("/{task_id}", response_model=TaskResponse)
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

    return TaskResponse.from_orm(task)

@router.put("/{task_id}", response_model=TaskResponse)
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
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return TaskResponse.from_orm(task)

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
    return {"message": "일정이 삭제되었습니다"}

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
    db.commit()
    db.refresh(task)
    return TaskResponse.from_orm(task)

@router.get("/today/count")
async def get_today_tasks_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    오늘의 일정 개수 조회
    """
    from datetime import date
    today = date.today()

    total_count = db.query(Task).filter(
        and_(Task.owner_id == current_user.id, Task.date == today)
    ).count()

    completed_count = db.query(Task).filter(
        and_(
            Task.owner_id == current_user.id,
            Task.date == today,
            Task.completed == True
        )
    ).count()

    return {
        "total": total_count,
        "completed": completed_count,
        "remaining": total_count - completed_count
    }
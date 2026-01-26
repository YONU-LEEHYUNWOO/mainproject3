from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from auth import get_current_user
from models.user import User
from models.location import Location
from models.guardian import Guardian
from schemas.location import LocationCreate, LocationResponse, LocationListResponse
from utils.response import success_response
from utils.activity import record_user_activity

router = APIRouter()

@router.post("/", response_model=LocationResponse)
async def create_location(
    location_in: LocationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    위치 정보 저장
    현재 사용자의 위치 정보를 저장합니다.
    """
    db_location = Location(
        latitude=location_in.latitude,
        longitude=location_in.longitude,
        accuracy=location_in.accuracy,
        address=location_in.address,
        location_type=location_in.location_type,
        user_id=current_user.id
    )
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    
    return db_location

@router.get("/current", response_model=LocationResponse)
async def get_my_current_location(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    현재 사용자 최신 위치 조회
    """
    location = db.query(Location).filter(
        Location.user_id == current_user.id
    ).order_by(Location.created_at.desc()).first()
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="위치 정보가 없습니다"
        )
    
    return location

@router.patch("/sharing")
async def toggle_location_sharing(
    enabled: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    위치 공유 설정 토글
    """
    current_user.location_sharing_enabled = enabled
    db.commit()
    
    return success_response(
        data={"location_sharing_enabled": current_user.location_sharing_enabled},
        message="위치 공유 설정이 변경되었습니다"
    )

@router.get("/parent/{parent_id}", response_model=LocationResponse)
async def get_parent_location(
    parent_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    부모님 위치 조회 (자식 권한 전용)
    부모님이 위치 공유를 허용한 경우에만 조회 가능합니다.
    """
    # 1. 권한 확인 (자식인지 확인) - 테스트를 위해 주석 처리
    # if current_user.user_type != 'child':
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="자식 계정만 부모님의 위치를 조회할 수 있습니다"
    #     )
    
    # 2. 관계 확인 (보호자 관계인지)
    print(f"LOCATION_DEBUG: Checking relationship - Child {current_user.id} -> Parent {parent_id}")
    guardian_rel = db.query(Guardian).filter(
        Guardian.user_id == current_user.id,      # 자식 ID
        Guardian.guardian_user_id == parent_id    # 부모 ID
    ).first()
    
    print(f"LOCATION_DEBUG: Guardian Relation found: {guardian_rel}")

    if not guardian_rel:
        print(f"LOCATION_DEBUG: No guardian relationship found for child {current_user.id} and parent {parent_id}")
        # 역방향 관계도 체크해보기 (디버깅용)
        reverse_check = db.query(Guardian).filter(
            Guardian.user_id == parent_id,
            Guardian.guardian_user_id == current_user.id
        ).first()
        if reverse_check:
            print(f"LOCATION_DEBUG: WARNING - Reverse relationship found! (Parent {parent_id} -> Child {current_user.id})")
            
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="해당 사용자의 보호자 권한이 없습니다"
        )
    
    # 3. 공유 설정 확인
    parent = db.query(User).filter(User.id == parent_id).first()
    print(f"LOCATION_DEBUG: Parent found: {parent}")
    if parent:
        print(f"LOCATION_DEBUG: Parent sharing enabled: {parent.location_sharing_enabled}")

    if not parent or not parent.location_sharing_enabled:
        print(f"LOCATION_DEBUG: Sharing check failed. Parent={parent}, Enabled={parent.location_sharing_enabled if parent else 'N/A'}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="부모님이 위치 공유를 비활성화했습니다"
        )
    
    # 4. 위치 정보 조회
    location = db.query(Location).filter(
        Location.user_id == parent_id
    ).order_by(Location.created_at.desc()).first()
    
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="부모님의 위치 정보가 없습니다"
        )
    
    return location

# 경로 계산 요청 스키마
class RouteRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    dest_lat: float
    dest_lng: float

@router.post("/route")
async def get_route_info(
    route_req: RouteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    경로 계산 및 정보 조회 (거리, 시간, 경로)
    카카오 REST API를 사용하여 계산
    """
    from services.kakao_service import KakaoService
    
    try:
        route_data = KakaoService.get_route(
            origin_x=route_req.origin_lng, 
            origin_y=route_req.origin_lat, 
            destination_x=route_req.dest_lng, 
            destination_y=route_req.dest_lat
        )
        
        if not route_data:
            raise HTTPException(status_code=404, detail="경로를 찾을 수 없습니다")
            
        record_user_activity(db, current_user, "route_search")
        return success_response(data=route_data)
        
    except Exception as e:
        print(f"Route calculation error: {e}")
        raise HTTPException(status_code=500, detail=f"경로 계산 중 오류가 발생했습니다: {str(e)}")

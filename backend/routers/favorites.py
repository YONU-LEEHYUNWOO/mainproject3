from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models.user import User
from models.favorite_place import FavoritePlace
from models.guardian import Guardian
from auth import get_current_user
from utils.response import success_response

router = APIRouter(tags=["favorites"])

# Pydantic Schemas
class FavoritePlaceCreate(BaseModel):
    name: str
    category: str = "other"
    address: str
    latitude: float
    longitude: float
    is_primary: bool = False

class FavoritePlaceResponse(FavoritePlaceCreate):
    id: int
    user_id: int
    is_primary: bool
    
    class Config:
        from_attributes = True

# Endpoints
@router.get("/")
def get_favorites(
    user_id: Optional[int] = Query(None, description="조회할 사용자 ID (보호자용)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """즐겨찾기 목록 조회"""
    target_user_id = current_user.id
    
    # 다른 사용자의 정보를 조회하려는 경우 (자녀가 부모 정보를 조회)
    if user_id and user_id != current_user.id:
        # 권한 확인: 현재 사용자가 대상 사용자의 보호자인지 확인
        is_guardian = db.query(Guardian).filter(
            Guardian.guardian_user_id == current_user.id,
            Guardian.user_id == user_id
        ).first()
        
        if not is_guardian:
            raise HTTPException(status_code=403, detail="조회 권한이 없습니다.")
        target_user_id = user_id
        
    favorites = db.query(FavoritePlace).filter(FavoritePlace.user_id == target_user_id).all()
    return success_response(
        data=[FavoritePlaceResponse.model_validate(f).dict() for f in favorites],
        message="성공"
    )

@router.post("/")
def create_favorite(
    favorite: FavoritePlaceCreate,
    user_id: Optional[int] = Query(None, description="대상 사용자 ID (보호자용)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """즐겨찾기 추가"""
    target_user_id = current_user.id
    
    if user_id and user_id != current_user.id:
        is_guardian = db.query(Guardian).filter(
            Guardian.guardian_user_id == current_user.id,
            Guardian.user_id == user_id
        ).first()
        if not is_guardian:
            raise HTTPException(status_code=403, detail="추가 권한이 없습니다.")
        target_user_id = user_id

    db_favorite = FavoritePlace(
        **favorite.dict(),
        user_id=target_user_id
    )
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    
    return success_response(
        data=FavoritePlaceResponse.model_validate(db_favorite).dict(),
        message="즐겨찾기가 추가되었습니다",
        status_code=status.HTTP_201_CREATED
    )

@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_favorite(
    favorite_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """즐겨찾기 삭제"""
    favorite = db.query(FavoritePlace).filter(FavoritePlace.id == favorite_id).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite place not found")
    
    # 내 장소이거나, 내가 그 사용자의 보호자인 경우 삭제 가능
    if favorite.user_id != current_user.id:
        is_guardian = db.query(Guardian).filter(
            Guardian.guardian_user_id == current_user.id,
            Guardian.user_id == favorite.user_id
        ).first()
        if not is_guardian:
            raise HTTPException(status_code=403, detail="삭제 권한이 없습니다.")
        
    db.delete(favorite)
    db.commit()
    return None

@router.patch("/{favorite_id}/set-primary", response_model=FavoritePlaceResponse)
def set_primary_favorite(
    favorite_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """카테고리별 기본 장소 설정"""
    favorite = db.query(FavoritePlace).filter(FavoritePlace.id == favorite_id).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite place not found")
    
    # 내 장소이거나, 내가 그 사용자의 보호자인 경우 설정 가능
    if favorite.user_id != current_user.id:
        is_guardian = db.query(Guardian).filter(
            Guardian.guardian_user_id == current_user.id,
            Guardian.user_id == favorite.user_id
        ).first()
        if not is_guardian:
            raise HTTPException(status_code=403, detail="설정 권한이 없습니다.")
    
    # 해당 사용자의 동일 카테고리 다른 장소들의 is_primary를 False로 설정
    db.query(FavoritePlace).filter(
        FavoritePlace.user_id == favorite.user_id,
        FavoritePlace.category == favorite.category,
        FavoritePlace.id != favorite_id
    ).update({"is_primary": False})
    
    # 선택한 장소를 기본으로 설정
    favorite.is_primary = True
    db.commit()
    db.refresh(favorite)
    
    return favorite

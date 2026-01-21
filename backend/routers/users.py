from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from auth import get_current_user
from models.user import User

router = APIRouter()

@router.get("/search")
async def search_user_by_phone(
    phone: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    전화번호로 사용자 검색 (보호자/자녀 연결용)
    전화번호 형식(하이픈 등)에 관계없이 숫자만 추출하여 검색합니다.
    """
    # 1. 입력된 전화번호 정규화 (숫자만 남김)
    normalized_phone = "".join(filter(str.isdigit, phone))
    
    print(f"DEBUG [users/search]: 검색 요청 - raw={phone}, normalized={normalized_phone}")
    
    # 2. 정규화된 번호로 검색 (테스트를 위해 자기 자신 제외 로직을 잠시 뺍니다)
    user = db.query(User).filter(
        User.phone == normalized_phone
    ).first()
    
    if not user:
        # 하이픈이 포함된 채로 저장되었을 가능성도 대비하여 원본으로도 한번 더 시도
        user = db.query(User).filter(
            User.phone == phone
        ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 전화번호로 가입된 사용자를 찾을 수 없습니다"
        )
    
    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "phone": user.phone,
        "user_type": user.user_type
    }

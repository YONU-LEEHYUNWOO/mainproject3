"""
인증 관련 Pydantic 스키마
로그인, 토큰 관리 등을 위한 모델입니다.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    """JWT 토큰 응답 스키마"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # 만료까지 남은 시간 (초)
    user_id: int

class TokenData(BaseModel):
    """토큰 데이터 스키마"""
    username: Optional[str] = None
    user_id: Optional[int] = None

class LoginRequest(BaseModel):
    """로그인 요청 스키마"""
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=100)

class RegisterRequest(BaseModel):
    """회원가입 요청 스키마"""
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    password: str = Field(..., min_length=6, max_length=100)
    full_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    user_type: str = Field('parent', pattern='^(parent|child)$')  # 'parent' or 'child'

class PasswordChangeRequest(BaseModel):
    """비밀번호 변경 요청 스키마"""
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)

class PasswordResetRequest(BaseModel):
    """비밀번호 재설정 요청 스키마"""
    email: str
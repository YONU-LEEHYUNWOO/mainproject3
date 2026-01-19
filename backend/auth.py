"""
JWT 인증 및 보안 관련 모듈
사용자 인증, 토큰 생성/검증, 비밀번호 해싱 등을 처리합니다.
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .database import get_db
from .models.user import User
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# 비밀번호 해싱 컨텍스트 (bcrypt 호환성 개선)
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__default_rounds=12,  # bcrypt 라운드 수 설정
)

# OAuth2 스키마
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

class TokenData(BaseModel):
    """토큰 데이터"""
    username: Optional[str] = None
    user_id: Optional[int] = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증 (bcrypt 72바이트 제한 고려)"""
    # 긴 패스워드는 SHA256으로 먼저 해시한 후 검증
    password_bytes = plain_password.encode('utf-8')
    if len(password_bytes) > 72:
        import hashlib
        plain_password = hashlib.sha256(password_bytes).hexdigest()
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """비밀번호 해시 생성 (bcrypt 72바이트 제한 고려)"""
    # bcrypt는 72바이트 제한이 있으므로 긴 패스워드는 해시하기 전에 자름
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        # 긴 패스워드는 SHA256으로 먼저 해시한 후 bcrypt 적용
        import hashlib
        password = hashlib.sha256(password_bytes).hexdigest()
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """JWT 액세스 토큰 생성"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, expire

def verify_token(token: str) -> Optional[TokenData]:
    """JWT 토큰 검증"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        if username is None:
            return None
        return TokenData(username=username, user_id=user_id)
    except JWTError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """현재 인증된 사용자 가져오기"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 정보가 유효하지 않습니다",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token_data = verify_token(token)
    if token_data is None:
        raise credentials_exception

    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비활성화된 계정입니다"
        )

    return user

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    """활성화된 사용자만 허용"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="비활성화된 사용자입니다")
    return current_user

async def get_current_superuser(current_user: User = Depends(get_current_user)):
    """관리자 권한이 있는 사용자만 허용"""
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다"
        )
    return current_user

def authenticate_user(db: Session, username: str, password: str):
    """사용자 인증"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def register_user(db: Session, username: str, email: str, password: str, **kwargs):
    """새 사용자 등록"""
    # 중복 사용자명 확인
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용중인 사용자명입니다"
        )

    # 중복 이메일 확인
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용중인 이메일입니다"
        )

    # 비밀번호 해싱
    hashed_password = get_password_hash(password)

    # 사용자 생성
    db_user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        **kwargs
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_last_login(db: Session, user: User):
    """마지막 로그인 시간 업데이트"""
    user.last_login = datetime.utcnow()
    db.commit()
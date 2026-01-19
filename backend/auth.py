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
from sqlalchemy import text
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
    try:
        # bcrypt를 직접 사용하여 호환성 문제 해결
        import bcrypt
        
        # 긴 패스워드는 SHA256으로 먼저 해시한 후 검증
        password_bytes = plain_password.encode('utf-8')
        password_to_check = plain_password
        if len(password_bytes) > 72:
            import hashlib
            password_to_check = hashlib.sha256(password_bytes).hexdigest()
        
        # bcrypt 직접 사용
        try:
            result = bcrypt.checkpw(
                password_to_check.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
            print(f"AUTH DEBUG: 비밀번호 검증 결과 (bcrypt 직접) - {result}")
            return result
        except (ValueError, TypeError) as e:
            # passlib을 fallback으로 사용
            print(f"AUTH DEBUG: bcrypt 직접 사용 실패, passlib 사용 - {e}")
            result = pwd_context.verify(password_to_check, hashed_password)
            print(f"AUTH DEBUG: 비밀번호 검증 결과 (passlib) - {result}")
            return result
    except Exception as e:
        print(f"AUTH ERROR: 비밀번호 검증 중 오류 - {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

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
    try:
        print(f"AUTH DEBUG: 사용자 조회 시작 - username={username}")
        user = db.query(User).filter(User.username == username).first()
        print(f"AUTH DEBUG: 사용자 조회 결과 - user={user}")
        
        if not user:
            print(f"AUTH DEBUG: 사용자를 찾을 수 없음")
            return False
        
        print(f"AUTH DEBUG: 비밀번호 검증 시작")
        if not verify_password(password, user.hashed_password):
            print(f"AUTH DEBUG: 비밀번호 불일치")
            return False
        
        print(f"AUTH DEBUG: 인증 성공 - user_id={user.id}")
        return user
    except Exception as e:
        print(f"AUTH ERROR: 인증 중 오류 발생 - {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def register_user(db: Session, username: str, email: str, password: str, **kwargs):
    """새 사용자 등록"""
    print(f"REGISTER: register_user 함수 시작 - username={username}")
    
    # get_db()에서 이미 테이블을 확인하고 생성하므로 여기서는 바로 쿼리 진행
    
    # 중복 사용자명 확인
    try:
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 사용중인 사용자명입니다"
            )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if "no such table" in error_msg:
            print(f"REGISTER ERROR: {e}")
            print("REGISTER: Attempting to create table directly in session...")
            # 세션에서 직접 테이블 생성 시도
            try:
                db.execute(text("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username VARCHAR(50) NOT NULL UNIQUE,
                        email VARCHAR(100) NOT NULL UNIQUE,
                        hashed_password VARCHAR(255) NOT NULL,
                        full_name VARCHAR(100),
                        phone VARCHAR(20),
                        user_type VARCHAR(20) NOT NULL DEFAULT 'parent',
                        is_active BOOLEAN NOT NULL DEFAULT 1,
                        is_superuser BOOLEAN NOT NULL DEFAULT 0,
                        last_login DATETIME,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                """))
                db.commit()
                print("REGISTER SUCCESS: Table created via session!")
                # 다시 시도
                existing_user = db.query(User).filter(User.username == username).first()
                if existing_user:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="이미 사용중인 사용자명입니다"
                    )
            except Exception as create_error:
                print(f"REGISTER ERROR creating table: {create_error}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"데이터베이스 테이블 생성 실패: {str(create_error)}"
                )
        else:
            raise

    # 중복 이메일 확인
    try:
        existing_email = db.query(User).filter(User.email == email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 사용중인 이메일입니다"
            )
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e).lower()
        if "no such table" in error_msg:
            print(f"REGISTER ERROR during email check: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"데이터베이스 오류: {str(e)}"
            )
        else:
            raise

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
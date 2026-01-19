"""
인증 API 라우터
로그인, 회원가입, 토큰 검증 등의 인증 관련 엔드포인트를 제공합니다.
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import (
    authenticate_user, register_user, get_current_user,
    create_access_token, update_last_login, ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..schemas.auth import (
    Token, LoginRequest, RegisterRequest, PasswordChangeRequest
)
from ..schemas.user import UserResponse
from ..models.user import User

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    사용자 로그인
    사용자명과 비밀번호로 인증하여 JWT 토큰을 발급합니다.
    """
    try:
        print(f"📥 로그인 요청: username={credentials.username}")
        
        # 사용자 인증
        try:
            user = authenticate_user(db, credentials.username, credentials.password)
        except Exception as auth_error:
            print(f"❌ 인증 중 오류: {type(auth_error).__name__}: {str(auth_error)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"인증 처리 중 오류가 발생했습니다: {str(auth_error)}"
            )
        
        if not user:
            print(f"❌ 인증 실패: username={credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="잘못된 사용자명 또는 비밀번호입니다",
                headers={"WWW-Authenticate": "Bearer"},
            )

        print(f"✅ 인증 성공: user_id={user.id}, username={user.username}")

        # 마지막 로그인 시간 업데이트
        try:
            update_last_login(db, user)
            print(f"✅ 로그인 시간 업데이트 완료")
        except Exception as update_error:
            print(f"⚠️ 로그인 시간 업데이트 실패 (계속 진행): {type(update_error).__name__}: {str(update_error)}")
            # 로그인 시간 업데이트 실패해도 계속 진행

        # 액세스 토큰 생성
        try:
            access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token, expire_time = create_access_token(
                data={"sub": user.username, "user_id": user.id},
                expires_delta=access_token_expires
            )
            print(f"✅ 토큰 생성 완료: user_id={user.id}")
        except Exception as token_error:
            print(f"❌ 토큰 생성 오류: {type(token_error).__name__}: {str(token_error)}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"토큰 생성 중 오류가 발생했습니다: {str(token_error)}"
            )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=int(access_token_expires.total_seconds()),
            user_id=user.id
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 로그인 처리 중 오류: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"로그인 처리 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/register", response_model=UserResponse)
async def register_new_user(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    새 사용자 등록
    새로운 사용자 계정을 생성합니다.
    """
    try:
        print(f"📥 [REGISTER] 회원가입 요청 받음: username={user_data.username}, email={user_data.email}")
        
        user = register_user(
            db=db,
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name,
            phone=user_data.phone,
            user_type=user_data.user_type
        )
        
        print(f"✅ [REGISTER] 사용자 생성 완료: user_id={user.id}, username={user.username}")
        response = UserResponse.model_validate(user)
        print(f"✅ [REGISTER] 응답 전송 준비 완료")
        return response
    except HTTPException as http_exc:
        print(f"❌ [REGISTER] HTTP 예외: {http_exc.status_code} - {http_exc.detail}")
        raise
    except Exception as e:
        print(f"❌ [REGISTER] 예외 발생: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"사용자 등록 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    현재 사용자 정보 조회
    JWT 토큰에서 현재 인증된 사용자의 정보를 반환합니다.
    """
    return UserResponse.model_validate(current_user)

@router.post("/logout")
async def logout():
    """
    로그아웃
    클라이언트 측에서 토큰을 삭제하도록 안내합니다.
    실제로는 토큰 블랙리스트 등의 추가 구현이 필요할 수 있습니다.
    """
    return {"message": "로그아웃되었습니다. 클라이언트에서 토큰을 삭제해주세요."}

@router.post("/change-password")
async def change_password(
    password_data: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    비밀번호 변경
    현재 사용자의 비밀번호를 변경합니다.
    """
    from ..auth import verify_password, get_password_hash

    # 현재 비밀번호 검증
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="현재 비밀번호가 올바르지 않습니다"
        )

    # 새 비밀번호 해싱 및 저장
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    return {"message": "비밀번호가 성공적으로 변경되었습니다"}

# 개발용 엔드포인트 (프로덕션에서는 제거)
@router.get("/test-token")
async def test_token(current_user: User = Depends(get_current_user)):
    """토큰 테스트용 엔드포인트 (개발용)"""
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }
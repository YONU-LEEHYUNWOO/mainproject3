"""
로깅 유틸리티
uvicorn 기본 logger와 충돌하지 않도록 안전한 로깅 함수 제공
"""

import logging
import sys
from typing import Optional


# 애플리케이션 전용 로거 생성 (uvicorn.access와 완전히 분리)
app_logger = logging.getLogger("app")
app_logger.setLevel(logging.INFO)
# 상위 로거로 전파되지 않도록 설정 (uvicorn 로거와 충돌 방지)
app_logger.propagate = False

# 콘솔 핸들러가 없으면 추가
if not app_logger.handlers:
    # stderr를 사용하여 stdout과 분리 (uvicorn은 stdout 사용)
    console_handler = logging.StreamHandler(sys.stderr)
    console_handler.setLevel(logging.INFO)
    
    # 간단한 포맷터 (uvicorn 포맷과 충돌하지 않도록 단순화)
    formatter = logging.Formatter(
        fmt='[APP] %(message)s',
        datefmt=None  # 날짜 제거하여 단순화
    )
    console_handler.setFormatter(formatter)
    app_logger.addHandler(console_handler)


def log_info(message: str, *args, **kwargs):
    """
    정보 로그 출력
    uvicorn 기본 logger와 충돌하지 않도록 app 로거 사용
    
    Args:
        message: 로그 메시지
        *args, **kwargs: 추가 인자 (logger.info에 전달)
    """
    if args or kwargs:
        app_logger.info(message.format(*args, **kwargs) if args or kwargs else message)
    else:
        app_logger.info(message)


def log_error(message: str, exc_info: Optional[Exception] = None, *args, **kwargs):
    """
    에러 로그 출력 (traceback 포함)
    
    Args:
        message: 에러 메시지
        exc_info: 예외 객체 (있으면 traceback 출력)
        *args, **kwargs: 추가 인자
    """
    if exc_info:
        app_logger.error(message, exc_info=exc_info, *args, **kwargs)
    else:
        if args or kwargs:
            app_logger.error(message.format(*args, **kwargs) if args or kwargs else message)
        else:
            app_logger.error(message)


def log_warning(message: str, *args, **kwargs):
    """
    경고 로그 출력
    
    Args:
        message: 경고 메시지
        *args, **kwargs: 추가 인자
    """
    if args or kwargs:
        app_logger.warning(message.format(*args, **kwargs) if args or kwargs else message)
    else:
        app_logger.warning(message)


def log_debug(message: str, *args, **kwargs):
    """
    디버그 로그 출력
    
    Args:
        message: 디버그 메시지
        *args, **kwargs: 추가 인자
    """
    if args or kwargs:
        app_logger.debug(message.format(*args, **kwargs) if args or kwargs else message)
    else:
        app_logger.debug(message)

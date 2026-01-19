"""
API 응답 형식 통일 유틸리티
모든 API 응답을 일관된 형식으로 반환하기 위한 헬퍼 함수들
"""

from typing import Any, Optional, Dict
import json
from fastapi import status
from fastapi.responses import JSONResponse, Response
from .serializer import serialize_datetime_objects


def success_response(
    data: Any = None,
    message: str = "성공",
    status_code: int = status.HTTP_200_OK
) -> Response:
    """
    성공 응답 형식 생성
    모든 datetime/time/date 객체를 문자열로 변환하여 JSON 직렬화 문제를 완전히 방지합니다.
    
    통일된 응답 형식:
    {
        "status": 200,
        "message": "성공 메시지",
        "data": {...}
    }
    
    Args:
        data: 응답 데이터 (dict, list, ORM 객체, 또는 단일 값)
        message: 성공 메시지
        status_code: HTTP 상태 코드 (기본값: 200)
    
    Returns:
        Response 객체 (JSON 문자열을 직접 포함)
    """
    # data가 None이 아닌 경우 datetime 객체 변환
    if data is not None:
        data = serialize_datetime_objects(data)
    
    # 응답 구조 생성
    response_content = {
        "status": status_code,
        "message": message,
        "data": data
    }
    
    # 최종 응답도 재귀적으로 변환 (이중 안전장치)
    response_content = serialize_datetime_objects(response_content)
    
    # JSON 문자열로 직접 변환하여 FastAPI 기본 직렬화 과정 완전히 우회
    try:
        json_str = json.dumps(response_content, ensure_ascii=False, default=str)
        return Response(
            content=json_str,
            media_type="application/json",
            status_code=status_code
        )
    except (TypeError, ValueError) as e:
        # JSON 직렬화 실패 시 한 번 더 변환 시도
        response_content = serialize_datetime_objects(response_content)
        json_str = json.dumps(response_content, ensure_ascii=False, default=str)
        return Response(
            content=json_str,
            media_type="application/json",
            status_code=status_code
        )


def error_response(
    message: str,
    status_code: int = status.HTTP_400_BAD_REQUEST,
    detail: Optional[Any] = None
) -> JSONResponse:
    """
    에러 응답 형식 생성
    
    Args:
        message: 에러 메시지
        status_code: HTTP 상태 코드 (기본값: 400)
        detail: 추가 상세 정보 (선택적)
    
    Returns:
        JSONResponse 객체:
        {
            "detail": "에러 메시지",
            ... (detail이 있으면 추가 정보)
        }
    """
    content = {"detail": message}
    if detail:
        content.update(detail)
    
    return JSONResponse(
        status_code=status_code,
        content=content
    )

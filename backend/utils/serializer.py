"""
SQLAlchemy ORM 객체 직렬화 유틸리티
datetime/time/date 객체를 안전하게 문자열로 변환하는 공통 함수들
"""

from typing import Any, Dict, Optional
from datetime import date, time, datetime


def serialize_datetime_objects(obj: Any) -> Any:
    """
    재귀적으로 datetime, date, time 객체를 문자열로 변환
    SQLAlchemy ORM 객체나 dict, list 등 모든 구조에서 안전하게 변환
    
    Args:
        obj: 변환할 객체 (dict, list, ORM 객체 등)
    
    Returns:
        모든 datetime/time/date 객체가 문자열로 변환된 객체
    """
    # time 객체를 HH:MM 형식 문자열로 변환
    if isinstance(obj, time):
        return obj.strftime("%H:%M")
    
    # date 객체를 ISO 형식 문자열로 변환 (YYYY-MM-DD)
    if isinstance(obj, date) and not isinstance(obj, datetime):
        return obj.isoformat()
    
    # datetime 객체를 ISO 형식 문자열로 변환
    if isinstance(obj, datetime):
        return obj.isoformat()
    
    # dict인 경우 모든 값에 대해 재귀적으로 변환
    if isinstance(obj, dict):
        return {key: serialize_datetime_objects(value) for key, value in obj.items()}
    
    # list인 경우 모든 항목에 대해 재귀적으로 변환
    if isinstance(obj, list):
        return [serialize_datetime_objects(item) for item in obj]
    
    # tuple인 경우 변환 후 tuple로 반환
    if isinstance(obj, tuple):
        return tuple(serialize_datetime_objects(item) for item in obj)
    
    # SQLAlchemy ORM 객체인 경우 dict로 변환
    if hasattr(obj, '__dict__') and not isinstance(obj, (str, int, float, bool, type(None))):
        # ORM 객체의 __dict__를 사용하여 변환
        result = {}
        for key, value in obj.__dict__.items():
            # SQLAlchemy 내부 속성 제외
            if not key.startswith('_'):
                result[key] = serialize_datetime_objects(value)
        return result
    
    # 그 외의 경우 그대로 반환
    return obj


def orm_to_dict(orm_obj: Any, exclude: Optional[list] = None) -> Dict[str, Any]:
    """
    SQLAlchemy ORM 객체를 dict로 변환하고 모든 datetime/time/date를 문자열로 변환
    
    Args:
        orm_obj: SQLAlchemy ORM 객체
        exclude: 제외할 필드 목록 (예: ['_sa_instance_state'])
    
    Returns:
        모든 datetime/time/date가 문자열로 변환된 dict
    """
    if orm_obj is None:
        return None
    
    exclude = exclude or ['_sa_instance_state']
    
    result = {}
    for key, value in orm_obj.__dict__.items():
        # 제외할 필드 스킵
        if key in exclude:
            continue
        
        # datetime/time/date 객체를 문자열로 변환
        result[key] = serialize_datetime_objects(value)
    
    return result


def model_to_dict(model_obj: Any) -> Dict[str, Any]:
    """
    Pydantic 모델 또는 SQLAlchemy ORM 객체를 dict로 변환
    모든 datetime/time/date를 문자열로 변환
    
    Args:
        model_obj: Pydantic 모델 또는 SQLAlchemy ORM 객체
    
    Returns:
        모든 datetime/time/date가 문자열로 변환된 dict
    """
    if model_obj is None:
        return None
    
    # Pydantic 모델인 경우
    if hasattr(model_obj, 'model_dump'):
        result = model_obj.model_dump()
    elif hasattr(model_obj, 'dict'):
        result = model_obj.dict()
    # SQLAlchemy ORM 객체인 경우
    elif hasattr(model_obj, '__dict__'):
        result = orm_to_dict(model_obj)
    # 이미 dict인 경우
    elif isinstance(model_obj, dict):
        result = model_obj
    else:
        # 그 외의 경우 문자열로 변환
        result = str(model_obj)
    
    # 최종적으로 datetime 객체 변환
    return serialize_datetime_objects(result)

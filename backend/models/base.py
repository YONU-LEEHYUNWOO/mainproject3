"""
베이스 모델 정의
모든 모델의 공통 속성과 메서드를 정의합니다.
"""

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, DateTime, func, text
from datetime import datetime

# 베이스 클래스 생성
Base = declarative_base()

class BaseModel(Base):
    """모든 모델의 베이스 클래스"""
    __abstract__ = True

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    def to_dict(self):
        """모델 인스턴스를 딕셔너리로 변환"""
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}

    def update(self, **kwargs):
        """모델 속성 업데이트"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()
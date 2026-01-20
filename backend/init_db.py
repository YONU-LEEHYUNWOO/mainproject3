#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
데이터베이스 초기화 및 마이그레이션 실행 스크립트
"""

import sys
import os
from pathlib import Path

# 프로젝트 루트 경로 추가
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# 백엔드 모듈 경로 추가
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

def init_database():
    """데이터베이스 초기화 및 마이그레이션 실행"""
    try:
        # 데이터베이스 모델 임포트 (테이블 생성)
        from models import base
        from database import engine, SessionLocal
        from models.guardian import Guardian
        from models.user import User

        print("데이터베이스 테이블 생성 중...")
        base.Base.metadata.create_all(bind=engine)
        print("[OK] 데이터베이스 테이블 생성 완료")

        # Alembic 마이그레이션 실행
        print("마이그레이션 실행 중...")
        os.system("alembic upgrade head")
        print("[OK] 마이그레이션 완료")

        # 테스트용 Guardian 데이터 추가
        add_test_guardian_data()

        print("성공: 데이터베이스 초기화가 완료되었습니다!")

    except Exception as e:
        print(f"오류: 데이터베이스 초기화 중 오류 발생: {e}")
        return False

    return True

def add_test_guardian_data():
    """테스트용 보호자 관계 데이터 추가"""
    try:
        from database import SessionLocal
        from models.guardian import Guardian
        from models.user import User

        db = SessionLocal()

        # 기존 사용자 조회 (parent와 child 타입의 사용자들)
        parent_users = db.query(User).filter(User.user_type == "parent").all()
        child_users = db.query(User).filter(User.user_type == "child").all()

        print(f"부모 사용자 수: {len(parent_users)}")
        print(f"자식 사용자 수: {len(child_users)}")

        if not parent_users or not child_users:
            print("부모 또는 자식 사용자가 없습니다.")
            db.close()
            return

        # 각 자식 사용자에게 첫 번째 부모를 보호자로 설정
        for child in child_users:
            # 이미 보호자 관계가 있는지 확인
            existing_guardian = db.query(Guardian).filter(Guardian.user_id == child.id).first()

            if not existing_guardian:
                # 보호자 관계 생성
                guardian = Guardian(
                    user_id=child.id,  # 자식의 ID
                    name=f"{parent_users[0].full_name or parent_users[0].username} (보호자)",
                    phone=parent_users[0].phone,
                    email=parent_users[0].email,
                    relationship_type="parent",
                    is_primary=True,
                    emergency_contact=True,
                    notification_enabled=True,
                    access_level="view"
                )

                db.add(guardian)
                print(f"보호자 관계 생성: {child.username} -> {parent_users[0].username}")
            else:
                print(f"이미 보호자 관계 존재: {child.username}")

        db.commit()
        print("✅ 테스트용 보호자 관계 추가 완료")

        # 생성된 관계 확인
        all_guardians = db.query(Guardian).all()
        print(f"총 보호자 관계 수: {len(all_guardians)}")

        for g in all_guardians:
            child_user = db.query(User).filter(User.id == g.user_id).first()
            print(f"  - {child_user.username if child_user else 'Unknown'}의 보호자: {g.name}")

        db.close()

    except Exception as e:
        print(f"❌ Guardian 데이터 추가 중 오류: {e}")

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
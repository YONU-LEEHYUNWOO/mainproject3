#!/usr/bin/env python
"""
간단하게 Guardian 데이터 추가
"""

import sqlite3
import os

# 데이터베이스 경로
db_path = "care_assistant.db"

def add_guardian():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Guardian 데이터 추가 (user_id=2로 가정)
        cursor.execute("""
            INSERT INTO guardians (user_id, name, phone, email, relationship, is_primary, emergency_contact, notification_enabled, access_level, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        """, (2, "부모님", "010-1234-5678", "parent@test.com", "parent", 1, 1, 1, "view"))

        conn.commit()
        print("✅ Guardian 데이터 추가 성공")

        # 확인
        cursor.execute("SELECT * FROM guardians")
        guardians = cursor.fetchall()
        print(f"총 Guardian 수: {len(guardians)}")

        conn.close()

    except Exception as e:
        print(f"❌ 오류: {e}")

if __name__ == "__main__":
    add_guardian()
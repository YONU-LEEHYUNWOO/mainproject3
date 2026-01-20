-- Guardian 데이터 수동 추가 SQL
-- 이 파일의 내용을 SQLite에서 실행하세요

-- 1. 현재 사용자 확인
SELECT id, username, user_type, full_name FROM users;

-- 2. Guardian 테이블 확인
SELECT * FROM guardians;

-- 3. 자식 사용자에게 보호자 관계 추가 (예시)
-- INSERT INTO guardians (user_id, name, phone, email, relationship_type, is_primary, emergency_contact, notification_enabled, access_level, created_at, updated_at)
-- VALUES (2, '김부모 (보호자)', '010-1234-5678', 'parent@example.com', 'parent', 1, 1, 1, 'view', datetime('now'), datetime('now'));

-- 실제 사용자 ID에 맞게 수정해서 사용하세요
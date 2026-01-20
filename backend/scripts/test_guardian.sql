-- 테스트 Guardian 데이터 추가
-- 현재 데이터베이스의 사용자들을 확인하고 Guardian 관계를 설정

-- 1. 사용자 확인
SELECT id, username, user_type, full_name FROM users;

-- 2. Guardian 관계 추가 (자식 ID: 2, 부모 ID: 1로 가정)
INSERT INTO guardians (
    name, phone, email, relationship_type, is_primary,
    emergency_contact, notification_enabled, access_level,
    user_id, guardian_user_id, created_at, updated_at
) VALUES (
    '테스트 부모', '010-1234-5678', 'parent@test.com', 'parent', 1,
    1, 1, 'view',
    2, 1, datetime('now'), datetime('now')
);

-- 3. 추가된 Guardian 확인
SELECT * FROM guardians;
"""
API 라우터 패키지
모든 API 엔드포인트 라우터들을 포함합니다.
"""

# run.py에서 sys.path에 backend를 추가하므로 절대 import 사용
# 상대 import는 "attempted relative import beyond top-level package" 오류 발생
# __init__.py에서 import하지 않고, main.py에서 직접 import하도록 변경
__all__ = ["auth", "tasks", "ai", "guardians", "medicine", "notification_logs"]
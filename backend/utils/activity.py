from datetime import datetime
from sqlalchemy.orm import Session
from models.user import User
from models.inactivity import InactivityLog

def record_user_activity(db: Session, user: User, activity_type: str = "general"):
    """사용자의 활동을 기록하고 무활동 로그를 해결 처리합니다."""
    try:
        now = datetime.utcnow()
        user.last_activity_at = now
        db.add(user)
        
        # 미해결된 무활동 로그들을 'resolved' 상태로 변경
        active_logs = db.query(InactivityLog).filter(
            InactivityLog.user_id == user.id,
            InactivityLog.status.in_(["detected", "alerted"])
        ).all()
        
        for log in active_logs:
            log.status = "resolved"
            log.reminder_count = 0
            log.resolved_at = now
            db.add(log)
            
        # 🔗 무활동 관련 NotificationLog도 모두 읽음 처리
        from models.notification_log import NotificationLog
        db.query(NotificationLog).filter(
            NotificationLog.user_id == user.id,
            NotificationLog.notification_type == "inactivity_danger",
            NotificationLog.is_read == False
        ).update({"is_read": True})
        
        db.commit()
        # 세션 만료 처리를 통해 다음 조회 시 DB에서 다시 읽어오도록 유도
        db.expire(user)
        print(f"🚀 [ACTIVITY-SUCCESS] User {user.id} action: {activity_type} at {now}")
        return True
    except Exception as e:
        db.rollback()
        print(f"❌ [ACTIVITY-ERROR] Failed to record user activity: {e}")
        return False

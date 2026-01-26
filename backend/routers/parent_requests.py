from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.parent_request import ParentRequest
from models.frequent_item import FrequentItem
from models.guardian import Guardian
from models.notification_log import NotificationLog
from auth import get_current_user
from schemas.parent_request import ParentRequestCreate, ParentRequestResponse
from utils.response import success_response
from typing import List
from utils.activity import record_user_activity

router = APIRouter(tags=["이거부탁해"])

@router.post("/")
def create_request(req: ParentRequestCreate, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_req = ParentRequest(content=req.content, user_id=u.id)
    db.add(db_req); db.commit(); db.refresh(db_req)
    
    # 보호자들에게 알림 생성
    gs = db.query(Guardian).filter(Guardian.user_id == u.id).all()
    for g in gs:
        if g.guardian_user_id:
            n = NotificationLog(
                user_id=g.guardian_user_id,
                notification_type="parent_request",
                title=f"{u.full_name or u.username}님의 새로운 요청",
                message=req.content
            )
            db.add(n)
    record_user_activity(db, u, "request_create")
    db.commit()
    return success_response(data=ParentRequestResponse.model_validate(db_req).dict())

@router.get("/")
def get_requests(user_id: int = Query(None), u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tid = user_id or u.id
    rs = db.query(ParentRequest).filter(ParentRequest.user_id == tid).all()
    return success_response(data=[ParentRequestResponse.model_validate(r).dict() for r in rs])

@router.delete("/{rid}")
def del_req(rid: int, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = db.query(ParentRequest).filter(ParentRequest.id == rid).first()
    if not r: return success_response(message="이미 삭제되었거나 찾을 수 없음")
    db.delete(r); db.commit(); return success_response(message="삭제됨")

@router.patch("/{rid}/toggle")
def toggle_req(rid: int, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = db.query(ParentRequest).filter(ParentRequest.id == rid).first()
    if not r: raise HTTPException(404, "항목 없음")
    r.is_completed = not r.is_completed
    record_user_activity(db, u, f"request_toggle_{rid}")
    db.commit(); return success_response(data=ParentRequestResponse.model_validate(r).dict())

@router.patch("/{rid}")
def update_req(rid: int, req: ParentRequestCreate, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = db.query(ParentRequest).filter(ParentRequest.id == rid).first()
    if not r: raise HTTPException(404, "항목 없음")
    r.content = req.content; db.commit(); return success_response(data=ParentRequestResponse.model_validate(r).dict())

# 자주 사는 상품 API
@router.get("/frequent")
def get_freq(u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(FrequentItem).filter(FrequentItem.user_id == u.id).all()
    return success_response(data=[{"id": i.id, "name": i.name} for i in items])

@router.post("/frequent")
def add_freq(data: dict, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = FrequentItem(name=data['name'], user_id=u.id)
    db.add(item); db.commit(); db.refresh(item)
    return success_response(data={"id": item.id, "name": item.name})

@router.delete("/frequent/{iid}")
def del_freq(iid: int, u: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(FrequentItem).filter(FrequentItem.id == iid).first()
    if not item: return success_response(message="이미 삭제되었거나 찾을 수 없음")
    db.delete(item); db.commit(); return success_response(message="삭제됨")

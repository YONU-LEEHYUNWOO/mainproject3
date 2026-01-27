from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import httpx
import os
from database import get_db
from models.weather import WeatherRecord
from schemas.weather import WeatherCreate, WeatherResponse, WeatherFetchRequest
from auth import get_current_user
from models.user import User
from config import KOREA_WEATHER_API_KEY

router = APIRouter(tags=["weather"])

@router.post("/fetch-kma", response_model=WeatherResponse)
async def fetch_from_kma(
    request: WeatherFetchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """기상청 API로부터 날씨 정보를 가져와 저장합니다. (CORS 우회용 프록시)"""
    if not KOREA_WEATHER_API_KEY:
        raise HTTPException(status_code=500, detail="Weather API key not configured")

    from datetime import datetime, timedelta
    
    # 1. 캐싱 로직: 최근 30분 이내에 동일한 좌표로 저장된 데이터가 있는지 확인
    thirty_minutes_ago = datetime.utcnow() - timedelta(minutes=30)
    cached_weather = db.query(WeatherRecord)\
        .filter(
            WeatherRecord.user_id == current_user.id,
            WeatherRecord.nx == request.nx,
            WeatherRecord.ny == request.ny,
            WeatherRecord.created_at >= thirty_minutes_ago
        )\
        .order_by(WeatherRecord.created_at.desc())\
        .first()
    
    if cached_weather:
        print(f"♻️ Using cached weather data for user {current_user.id}")
        return cached_weather

    url = f"https://apihub.kma.go.kr/api/typ02/openApi/VilageFcstInfoService_2.0/getUltraSrtNcst?pageNo=1&numOfRows=1000&dataType=JSON&base_date={request.base_date}&base_time={request.base_time}&nx={request.nx}&ny={request.ny}&authKey={KOREA_WEATHER_API_KEY}"

    data = None
    # SSL 인증서 검증 비활성화 (보안 통신 오류 해결)
    async with httpx.AsyncClient(verify=False) as client:
        try:
            response = await client.get(url, timeout=10.0)
            
            # 로그 출력 (디버깅용)
            print(f"📡 KMA API Request: {url}")
            print(f"📩 KMA API Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
            else:
                print(f"⚠️ KMA API returned {response.status_code}: {response.text}")
            
        except Exception as e:
            print(f"❌ KMA Request Failed: {e}")
            # 에러 발생 시 아래 Failover 로직으로 넘어감

    # 2. Failover 로직: API 호출 실패 시 DB의 최신 데이터 반환
    if not data or data.get("response", {}).get("header", {}).get("resultCode") != "00":
        if data:
            msg = data.get("response", {}).get("header", {}).get("resultMsg", "Unknown Error")
            print(f"⚠️ KMA API Logic Error: {msg}")
        
        print(f"🔄 Attempting Failover: Returning latest available data from DB")
        latest = db.query(WeatherRecord)\
            .filter(WeatherRecord.user_id == current_user.id)\
            .order_by(WeatherRecord.created_at.desc())\
            .first()
        
        if latest:
            return latest
        
        # DB에도 데이터가 없는 경우에만 최종 에러 반환
        error_detail = "기상청 API 통신 실패 및 저장된 데이터가 없습니다."
        if data:
            error_detail = f"기상청 API 에러: {data.get('response', {}).get('header', {}).get('resultMsg')}"
        raise HTTPException(status_code=502, detail=error_detail)

    body = data.get("response", {}).get("body", {})
    items = body.get("items", {}).get("item", [])
    
    def get_value(category):
        item = next((it for it in items if it.get("category") == category), None)
        return item.get("obsrValue") if item else None

    temp = get_value("T1H")
    humidity = get_value("REH")
    rain_type = get_value("PTY")
    rain_amount = get_value("RN1")

    # DB 저장
    db_weather = WeatherRecord(
        user_id=current_user.id,
        temp=float(temp) if temp else None,
        humidity=int(humidity) if humidity else None,
        rain_type=rain_type,
        rain_amount=rain_amount,
        base_date=request.base_date,
        base_time=request.base_time,
        nx=request.nx,
        ny=request.ny,
        sky_status="정보없음"
    )
    db.add(db_weather)
    db.commit()
    db.refresh(db_weather)
    return db_weather

@router.post("/current", response_model=WeatherResponse)
async def update_current_weather(
    weather_data: WeatherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """현재 날씨 정보를 저장합니다."""
    db_weather = WeatherRecord(
        user_id=current_user.id,
        **weather_data.dict()
    )
    db.add(db_weather)
    db.commit()
    db.refresh(db_weather)
    return db_weather

@router.get("/latest", response_model=WeatherResponse)
async def get_latest_weather(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """가장 최근에 저장된 날씨 정보를 가져옵니다."""
    weather = db.query(WeatherRecord)\
        .filter(WeatherRecord.user_id == current_user.id)\
        .order_by(WeatherRecord.created_at.desc())\
        .first()
    
    if not weather:
        raise HTTPException(status_code=404, detail="Weather information not found")
    
    return weather

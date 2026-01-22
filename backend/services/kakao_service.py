import requests
import json
from config import KAKAO_REST_API_KEY

class KakaoService:
    @staticmethod
    def get_route(origin_x: float, origin_y: float, destination_x: float, destination_y: float):
        """
        카카오 모빌리티 길찾기 API 호출 (도보/차량)
        현재는 자동차 경로(directions) API를 사용 (가장 범용적)
        """
        if not KAKAO_REST_API_KEY:
            raise Exception("KAKAO_REST_API_KEY is not configured")

        url = "https://apis-navi.kakaomobility.com/v1/directions"
        
        headers = {
            "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}",
            "Content-Type": "application/json"
        }
        
        params = {
            "origin": f"{origin_x},{origin_y}",
            "destination": f"{destination_x},{destination_y}",
            "priority": "RECOMMEND", # 추천 경로
            # "car_type": 1, # 1: 승용차 (기본값)
            # "car_fuel": "GASOLINE", # 기본값
        }

        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            # 응답 데이터 가공
            routes = data.get("routes", [])
            if not routes:
                return None
                
            summary = routes[0].get("summary", {})
            sections = routes[0].get("sections", [])
            
            # 경로 좌표 추출 (Polyline 그리기 용)
            path_points = []
            for section in sections:
                for road in section.get("roads", []):
                    vertexes = road.get("vertexes", [])
                    # vertexes는 [x, y, x, y, ...] 형태의 1차원 배열임
                    for i in range(0, len(vertexes), 2):
                        path_points.append({
                            "lng": vertexes[i],
                            "lat": vertexes[i+1]
                        })
                        
            return {
                "distance": summary.get("distance", 0), # 미터 단위
                "duration": summary.get("duration", 0), # 초 단위
                "fare": summary.get("fare", {}).get("taxi", 0), # 택시비
                "path": path_points
            }
            
        except requests.exceptions.HTTPError as e:
            print(f"Kakao API Error: {e.response.text}")
            raise e
        except Exception as e:
            print(f"Unexpected Error: {e}")
            raise e

#!/usr/bin/env python
import requests
import json

# 로그인 API 테스트
url = "http://localhost:8000/api/auth/login"
headers = {
    "Content-Type": "application/json",
}

# 잘못된 데이터로 테스트
data = {
    "username": "",  # 빈 값
    "password": "test"
}

print("Testing login API with invalid data...")
try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status Code: {response.status_code}")
    print(f"Response Text: {response.text}")

    if response.status_code >= 400:
        try:
            error_data = response.json()
            print("Error details:")
            print(json.dumps(error_data, indent=2, ensure_ascii=False))
        except:
            print("Could not parse error response as JSON")

except Exception as e:
    print(f"Error: {e}")
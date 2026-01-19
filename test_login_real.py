#!/usr/bin/env python
import requests
import json

# 실제 로그인 시도 (존재하지 않는 사용자)
url = "http://localhost:8000/api/auth/login"
headers = {
    "Content-Type": "application/json",
}

data = {
    "username": "nonexistent",
    "password": "wrongpass"
}

print("Testing login with non-existent user...")
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
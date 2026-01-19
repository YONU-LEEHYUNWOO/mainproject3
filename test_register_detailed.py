#!/usr/bin/env python
import requests
import json

# 회원가입 API 테스트 (상세 로깅)
url = "http://localhost:8000/api/auth/register"
headers = {
    "Content-Type": "application/json",
}

data = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "full_name": "테스트 유저",
    "phone": "010-1234-5678"
}

print("Testing register API...")
print(f"URL: {url}")
print(f"Headers: {headers}")
print(f"Data: {json.dumps(data, indent=2, ensure_ascii=False)}")
print()

try:
    response = requests.post(url, headers=headers, data=json.dumps(data), timeout=10)
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text}")

    if response.status_code >= 400:
        print("\nError details:")
        try:
            error_data = response.json()
            print(json.dumps(error_data, indent=2, ensure_ascii=False))
        except:
            print("Could not parse error response as JSON")

except requests.exceptions.Timeout:
    print("Request timed out")
except requests.exceptions.RequestException as e:
    print(f"Request error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
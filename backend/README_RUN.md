# 백엔드 실행 가이드

## 실행 방법

**권장 실행 방식 (단일 진입점):**

```bash
python backend/run.py
```

또는 backend 폴더에서:

```bash
cd backend
python run.py
```

## 실행 구조

```
run.py (진입점)
  └─> sys.path에 backend 추가
      └─> main.py import
          └─> FastAPI app 생성
              └─> 라우터 등록
```

## Import 방식

- **절대 import 사용**: `run.py`가 `sys.path`에 backend를 추가하므로 모든 파일에서 절대 import 사용
- 예: `from database import get_db`, `from models.task import Task`
- 상대 import(`..`) 사용 금지

## 로깅

- `utils.logger` 모듈의 `log_info`, `log_error` 함수 사용
- uvicorn 기본 logger와 충돌하지 않음
- 에러 발생 시 traceback 자동 출력

## API 응답 형식

모든 API는 `success_response` 함수를 사용하여 통일된 형식으로 응답:

```python
{
    "status": 200,
    "message": "성공 메시지",
    "data": {...}
}
```

## Datetime 직렬화

- 모든 datetime/time/date 객체는 `utils.serializer`를 통해 자동으로 문자열로 변환
- ORM 객체는 `orm_to_dict()` 함수 사용
- JSON 직렬화 오류 방지

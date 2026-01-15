# 함께잇다 (Together Connected)

멀리 있어서 잘 챙겨주지 못하는 자식/손주들을 위한 돌봄 서비스

부모님/조부모님들이 자식들에게 손을 벌리지 않아도, 그들의 마음을 전달받고 함께 이 시대를 편리하게 살아갈 수 있도록 돕습니다.

## 서비스 소개

함께잇다는 멀리 떨어져 사는 가족들이 부모님/조부모님의 하루를 함께 이어주는 서비스입니다.

- **부모님/조부모님**: 자식들에게 부담을 주지 않고, 자연스럽게 도움을 받을 수 있습니다
- **자식/손주**: 멀리 있어도 부모님의 일상을 함께하고, 필요한 순간에 도움을 드릴 수 있습니다
- **함께**: 돌봄과 기술을 부드럽게 잇고, 멀리 있어도 마음은 이어져 있습니다

일정 관리, 이동 지원, 건강 모니터링을 통해 가족 간의 지속적인 연결(continuity)을 만들어갑니다.

## 🚀 시작하기

### 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_MODEL=gemini-2.5-flash
VITE_KOREA_WEATHER_API_KEY=your_korea_weather_api_key_here
VITE_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
```

**중요**:
- `VITE_GEMINI_API_KEY`: Google Gemini API 키 (필수)
- `VITE_KOREA_WEATHER_API_KEY`: 한국 공공데이터 기상청 API 키 (선택, 없으면 시뮬레이션 데이터 사용)
- `VITE_KAKAO_MAP_API_KEY`: 카카오맵 API 키 (선택, 없으면 시뮬레이션 데이터 사용)

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

## 📋 주요 기능

- **일정 관리**: 자연스러운 대화로 일정을 등록하고 관리합니다
- **자동 완료 감지**: 대화를 통해 일정 완료를 자동으로 인식합니다
- **이동 지원**: 병원, 집, 마트 등 어디든 편하게 가는 길을 안내합니다
- **가족과 함께**: 멀리 있는 가족이 부모님의 하루를 함께 볼 수 있는 대시보드
- **다국어 지원**: 한국어, 영어, 일본어로 편리하게 사용할 수 있습니다

## ⚙️ 기술 스택

- React 18
- Vite
- Tailwind CSS
- Google Gemini API
- Lucide React (아이콘)
- Recharts (차트)

## 🔧 API 호출 최적화

토큰 사용을 최소화하기 위해 다음 최적화를 적용했습니다:

1. **로컬 처리 우선**: 일정 완료 감지, 간단한 일정 추출은 API 호출 없이 처리
2. **토큰 제한**: `maxOutputTokens: 500`으로 출력 토큰 제한
3. **재시도 감소**: API 호출 실패 시 재시도 2회로 제한
4. **필요 시에만 호출**: 복잡한 일정 분석이 필요한 경우에만 API 호출

## 📝 API 키 발급 방법

### Google Gemini API (필수)
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. API 키 생성
3. `.env` 파일에 `VITE_GEMINI_API_KEY` 값 설정

### 한국 공공데이터 기상청 API (선택)
1. [공공데이터 포털](https://www.data.go.kr/) 접속
2. 회원가입 및 로그인
3. "기상청_단기예보 ((구)_동네예보) 조회서비스" 검색
4. 서비스 신청 및 활용신청
5. 마이페이지 > 활용신청 관리에서 인증키 확인
6. `.env` 파일에 `VITE_KOREA_WEATHER_API_KEY` 값 설정

### 카카오맵 API (선택)
1. [카카오 개발자 센터](https://developers.kakao.com/) 접속
2. 애플리케이션 등록
3. REST API 키 발급
4. `.env` 파일에 `VITE_KAKAO_MAP_API_KEY` 값 설정

## 🛠️ 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## 📄 라이선스

이 프로젝트는 개인 사용 목적으로 개발되었습니다.
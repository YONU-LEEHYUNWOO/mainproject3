# 프론트엔드 실행 가이드

## 📋 프론트엔드 개요

React + TypeScript + Vite + Tailwind CSS 기반의 케어비서 웹 애플리케이션입니다.

### 주요 기능
- 🔐 사용자 인증 (로그인/회원가입)
- 📅 일정 관리
- 💊 약 관리
- 👥 보호자 관리
- 🤖 AI 채팅
- 📊 대시보드

## 🚀 실행 방법

### 1. 환경 설정
프로젝트 루트에서 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```bash
# 백엔드 API URL
VITE_API_BASE_URL=http://localhost:8000

# 지도 API 키 (선택사항)
# VITE_KAKAO_MAP_API_KEY=your-kakao-api-key-here

# 날씨 API 키 (선택사항)
# VITE_KOREA_WEATHER_API_KEY=your-weather-api-key-here
```

### 2. 의존성 설치
```bash
cd frontend
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

서버가 정상 실행되면 다음과 같은 메시지가 표시됩니다:
```
VITE v5.0.0  ready in 300 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.xxx:5173/
➜  press h to show help
```

## 🔍 상태 확인

### 브라우저에서 확인
- **메인 페이지**: `http://localhost:5173/`
- 로그인 페이지에서 테스트 가능

### API 연결 확인
프론트엔드에서 백엔드 API 호출이 정상적으로 작동하는지 확인하세요.

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── components/          # 재사용 컴포넌트
│   │   ├── Layout.tsx      # 레이아웃 컴포넌트
│   │   └── ProtectedRoute.tsx  # 인증 보호 라우트
│   ├── contexts/
│   │   └── AuthContext.tsx # 인증 컨텍스트
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Login.tsx       # 로그인 페이지
│   │   ├── Dashboard.tsx   # 대시보드
│   │   ├── Tasks.tsx       # 일정 관리
│   │   ├── Medicine.tsx    # 약 관리
│   │   ├── Guardians.tsx   # 보호자 관리
│   │   ├── Chat.tsx        # AI 채팅
│   │   └── Settings.tsx    # 설정
│   ├── services/
│   │   └── api.ts          # API 호출 함수
│   ├── App.tsx             # 메인 앱 컴포넌트
│   ├── main.tsx            # 앱 진입점
│   └── index.css           # 전역 스타일
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 🎨 스타일링

- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Lucide React**: 아이콘 라이브러리
- **Responsive Design**: 모바일 친화적 디자인

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 린트 검사
npm run lint

# 빌드 미리보기
npm run preview
```

## 🌐 API 연동

### 백엔드 연결
- 기본 URL: `http://localhost:8000`
- 인증: JWT 토큰 기반
- API 클라이언트: Axios

### 주요 API 엔드포인트
- `POST /api/auth/login` - 로그인
- `GET /api/tasks/` - 일정 조회
- `POST /api/ai/chat` - AI 채팅
- `GET /api/medicine/` - 약 정보 조회

## 📱 주요 페이지

### 1. 로그인 페이지 (`/login`)
- 이메일/비밀번호 로그인
- 회원가입 링크

### 2. 대시보드 (`/dashboard`)
- 일정 요약
- 건강 정보
- 빠른 액션 버튼

### 3. 일정 관리 (`/tasks`)
- 일정 CRUD
- 캘린더 뷰
- 알림 설정

### 4. 약 관리 (`/medicine`)
- 약 복용 일정
- 알림 설정
- 복용 기록

### 5. 보호자 관리 (`/guardians`)
- 보호자 정보 관리
- 연락처 관리
- 권한 설정

### 6. AI 채팅 (`/chat`)
- 실시간 AI 대화
- 음성 입력 지원 (추후)
- 채팅 기록

## 🔐 인증 시스템

- **JWT 토큰**: 로컬 스토리지 저장
- **보호된 라우트**: 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
- **자동 로그아웃**: 토큰 만료 시 자동 로그아웃

## 📊 차트 및 시각화

- **Recharts**: 데이터 시각화 라이브러리
- 건강 데이터 차트
- 일정 통계
- 약 복용 패턴 분석

## 🗺️ 지도 기능 (선택사항)

- **Leaflet**: 오픈소스 지도 라이브러리
- 위치 기반 서비스
- 약국/병원 찾기

## 🎯 개발 팁

- Vite의 Hot Module Replacement으로 빠른 개발 가능
- TypeScript로 타입 안전성 보장
- ESLint로 코드 품질 유지
- Tailwind CSS로 빠른 스타일링

## 📞 지원

프론트엔드 관련 문의사항이 있으면 다음을 확인하세요:
1. 브라우저 콘솔 로그
2. Network 탭의 API 요청 상태
3. 백엔드 서버 상태 확인
4. 환경 변수 설정 확인
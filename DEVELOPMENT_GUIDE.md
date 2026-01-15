# 🚀 AI 케어비서 - 개발 협업 가이드

> **함께잇다 AI 케어비서** 개발자를 위한 협업 가이드

## 👋 환영합니다!

이 가이드는 **함께잇다 AI 케어비서** 프로젝트의 새로운 개발자를 위한 **협업 가이드**입니다.
코드를 한눈에 파악하고, 효율적으로 협업할 수 있도록 구성되었습니다.

---

## 🎯 빠른 시작: 기능 찾는 방법

### 💡 "이 기능 어디에 있나?" - 즉시 답변

| 화면/기능 | 찾아야 할 폴더 | 주요 파일들 |
|----------|---------------|-------------|
| **채팅 화면** | `src/features/chat/` | `ChatFeature.jsx`, `useChatVoice.js` |
| **지도/길찾기** | `src/features/location/` | `LocationMapSection.jsx` |
| **병원 이동** | `src/features/hospital/transport/` | `HospitalMapSection.jsx` |
| **약 알림 설정** | `src/features/medicine/modals/` | `MedicineAlarmModalFeature.jsx` |
| **보호자 모니터링** | `src/features/guardian/` | `GuardianActivityCharts.jsx` |
| **일정 관리** | `src/features/schedule/` | `ScheduleModals.jsx` |
| **설정 모달들** | `src/features/*/components/` | `*SettingsModalFeature.jsx` |

### 🔍 폴더별 우선순위 탐색

**수정 빈도가 높은 순서대로 폴더를 확인하세요:**

1. **`chat/`** - AI 대화, 음성 기능, 메시지 처리
2. **`location/`** - 지도, 주소 검색, 위치 서비스
3. **`medicine/`** - 약 알림, 복용 관리, 일정 연동
4. **`guardian/`** - 보호자 모니터링, 활동 추적
5. **`layout/`** - 앱 레이아웃, 모달 관리
6. **`app/`** - 전역 상태, 앱 초기화

---

## 📁 프로젝트 구조도

```
🤖 AI 케어비서 프로젝트
├── 📚 README.md (프로젝트 개요)
├── 📋 DEVELOPMENT_GUIDE.md (이 파일)
├── ⚙️ HANDOVER.MD (진행 상황 기록)
│
└── 📂 src/
    ├── 🔧 features/ (기능별 모듈)
    │   ├── 💬 chat/ (AI 채팅 시스템)
    │   ├── 📍 location/ (지도/위치 서비스)
    │   ├── 👥 guardian/ (보호자 모니터링)
    │   ├── 🏥 hospital/ (병원 이동)
    │   ├── 💊 medicine/ (약 관리)
    │   ├── 🎨 layout/ (UI 레이아웃)
    │   ├── 🔧 app/ (앱 핵심 로직)
    │   └── 📚 [13개 추가 기능 폴더들]
    │
    ├── 🧩 components/ (공통 컴포넌트)
    ├── 🔗 handlers/ (이벤트 핸들러)
    ├── 🪝 hooks/ (커스텀 훅)
    ├── 🛠️ utils/ (유틸리티 함수)
    └── 🌐 i18n/ (다국어 지원)
```

---

## 🎨 기능별 상세 가이드

### 💬 채팅 시스템 (`chat/`)
**가장 많이 수정되는 핵심 기능**

```
chat/
├── components/
│   ├── ChatFeature.jsx         # 메인 채팅 컴포넌트
│   ├── ChatHeader.jsx          # 채팅 헤더
│   ├── ChatHistory.jsx         # 채팅 히스토리
│   ├── ChatInput.jsx           # 입력창
│   └── AssistantMessage.jsx    # AI 응답
├── hooks/
│   ├── useChatVoice.js         # 음성 합성/인식
│   └── useChatAutoScroll.js    # 자동 스크롤
└── utils/
    └── tts.js                  # 텍스트 음성 변환
```

**수정 시나리오:**
- 새 메시지 타입 추가 → `AssistantMessage.jsx`
- 음성 기능 개선 → `useChatVoice.js`
- 채팅 UI 변경 → `ChatFeature.jsx`

### 📍 위치 서비스 (`location/`)
**지도, 검색, 위치 기반 기능**

```
location/
├── components/
│   ├── LocationMapSection.jsx      # 지도 표시
│   └── LocationDestinationSelection.jsx # 목적지 선택
├── modals/
│   ├── components/
│   │   ├── HospitalListSection.jsx # 병원 목록
│   │   ├── MartListSection.jsx     # 마트 목록
│   │   └── PharmacyListSection.jsx # 약국 목록
│   └── hooks/
│       └── useLocationSettingsModal.js
└── handlers/
    ├── locationHandlers.js     # 위치 핸들러
    └── locationModalHandlers.js # 모달 핸들러
```

**수정 시나리오:**
- 지도 기능 개선 → `LocationMapSection.jsx`
- 새 장소 타입 추가 → `modals/components/`
- 위치 검색 로직 → `locationHandlers.js`

### 💊 약 관리 (`medicine/`)
**알림 설정, 복용 관리, 일정 연동**

```
medicine/
├── components/
│   └── MedicineSettingsModal.jsx
└── modals/
    ├── components/
    │   ├── MedicineAlarmModalFeature.jsx # 메인 모달
    │   ├── MedicineNameInput.jsx         # 약 이름 입력
    │   ├── MealTimingSelector.jsx        # 복용 시기 선택
    │   ├── TimeSelector.jsx             # 시간 설정
    │   ├── DaySelector.jsx              # 요일 선택
    │   ├── DurationSettings.jsx         # 기간 설정
    │   └── AlarmToggle.jsx              # 알림 토글
    └── hooks/
        └── useMedicineAlarmModal.js     # 복잡한 로직
```

**수정 시나리오:**
- 새 알림 옵션 추가 → `DurationSettings.jsx`
- 복용 패턴 변경 → `MealTimingSelector.jsx`
- 알림 로직 개선 → `useMedicineAlarmModal.js`

### 👥 보호자 기능 (`guardian/`)
**활동 모니터링, 실시간 추적**

```
guardian/
├── components/
│   ├── GuardianActivityCharts.jsx    # 활동 차트
│   ├── GuardianLiveLocation.jsx      # 실시간 위치
│   ├── GuardianActionButtons.jsx     # 액션 버튼
│   └── GuardianModals.jsx           # 모달들
└── hooks/
    └── useGuardianDashboard.js       # 데이터 관리
```

**수정 시나리오:**
- 차트 개선 → `GuardianActivityCharts.jsx`
- 새 모니터링 기능 → `GuardianModals.jsx`
- 데이터 처리 → `useGuardianDashboard.js`

### 🏥 병원 이동 (`hospital/transport/`)
**이동 계획, 교통편, 길 안내**

```
hospital/transport/
├── components/
│   ├── HospitalMapSection.jsx      # 이동 지도
│   ├── HospitalRequirements.jsx    # 준비사항
│   ├── HospitalTrafficSummary.jsx  # 교통 상황
│   └── HospitalWeatherCard.jsx     # 날씨 정보
└── hooks/
    └── useHospitalTransport.js     # 이동 로직
```

**수정 시나리오:**
- 새 교통편 추가 → `useHospitalTransport.js`
- 길 안내 개선 → `HospitalMapSection.jsx`
- 준비사항 업데이트 → `HospitalRequirements.jsx`

---

## 🛠️ 개발 워크플로우

### 1. **새 기능 추가하기**

```bash
# 1. 기능 폴더 생성
mkdir -p src/features/newFeature/{components,hooks,utils}

# 2. 메인 컴포넌트 생성
touch src/features/newFeature/components/NewFeature.jsx

# 3. AppModals.jsx에 등록 (모달인 경우)
# 4. 테스트 및 검증
```

### 2. **기존 기능 수정하기**

```bash
# 1. 기능 파악
# README.md 또는 이 가이드에서 폴더 찾기

# 2. 관련 파일 수정
# - UI 변경 → components/
# - 로직 변경 → hooks/
# - 이벤트 → handlers/

# 3. 테스트 및 검증
```

### 3. **컴포넌트 구조 이해**

```
Feature 폴더 구조:
├── components/     # UI 컴포넌트들
├── hooks/         # 비즈니스 로직, 상태 관리
├── handlers/      # 사용자 이벤트 처리
└── utils/         # 공통 함수, 헬퍼
```

---

## 📝 코딩 규칙 및 팁

### 파일 네이밍
- **컴포넌트**: `FeatureName.jsx`
- **Feature 컴포넌트**: `FeatureNameFeature.jsx`
- **Hook**: `useFeatureName.js`
- **Handler**: `featureNameHandlers.js`
- **Util**: `featureNameUtils.js`

### Import 경로
```javascript
// ✅ 올바른 상대 경로
import { useChat } from '../../../hooks/useChat';

// ❌ 잘못된 절대 경로 (피하기)
import { useChat } from 'src/hooks/useChat';
```

### Props 관리
```javascript
// ✅ 구조 분해로 명확하게
const ChatFeature = ({ messages, onSend, language }) => {

// ❌ ...props로 모호하게 (가능한 피하기)
const ChatFeature = ({ ...props }) => {
```

---

## 🔍 문제 해결 가이드

### "파일을 찾을 수 없음" 에러
1. **import 경로 확인**: `../../../../` 계산 정확한지
2. **파일 존재 확인**: `src/features/{폴더}/` 내에 있는지
3. **대소문자 확인**: 파일명 정확한지

### "컴포넌트가 렌더링되지 않음"
1. **export 확인**: `export default ComponentName`
2. **import 확인**: 파일명과 컴포넌트명 일치하는지
3. **Props 확인**: 필수 props가 전달되는지

### "Hook 에러"
1. **Hook 규칙 준수**: 조건문이나 반복문에서 사용하지 말기
2. **의존성 배열**: `useEffect`의 deps 정확히 명시

---

## 🤝 협업 팁

### 코드 리뷰 시 확인사항
- [ ] 파일 위치가 적절한가? (기능별 폴더)
- [ ] 컴포넌트 구조가 명확한가?
- [ ] Props 인터페이스가 명확한가?
- [ ] 에러 처리 로직이 있는가?

### 커밋 메시지 규칙
```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
docs: 문서 수정
style: 스타일 수정
```

---

## 📞 도움이 필요할 때

1. **이 가이드 다시 보기** 🔄
2. **README.md 참고** 📚
3. **기존 코드 패턴 분석** 🔍
4. **팀원에게 질문** 💬

---

## 🎉 시작하세요!

이 가이드를 따라 프로젝트 구조를 익히고, 자신있게 코드를 수정해보세요!

**궁금한 점이 있으면 언제든 물어보세요!** 🚀

---

*마지막 업데이트: 2026년 1월 15일*
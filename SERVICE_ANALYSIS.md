# 🔍 AI 케어비서 서비스 분석 보고서

> **협업 환경에서 안전하게 기능을 수정하기 위한 가이드**

## 📊 프로젝트 개요

**함께잇다 (Together Connected)** - 멀리 떨어져 사는 가족들을 위한 AI 케어비서 서비스

### 핵심 가치
- **부모님/조부모님**: 자식들에게 부담 없이 자연스럽게 도움 받기
- **자식/손주**: 멀리 있어도 부모님의 일상을 함께하고 필요한 순간 도움
- **함께**: 돌봄과 기술을 부드럽게 연결

---

## 🏗️ 아키텍처 구조

### Facade Pattern 기반 모듈화

프로젝트는 **Facade Pattern**을 사용하여 기능별로 명확하게 분리되어 있습니다:

```
📁 구조 계층
├── 🎯 Facade Layer (src/features/) - 기능별 인터페이스
│   └── 각 기능의 진입점과 공개 API
│
├── 🔧 Implementation Layer - 실제 구현
│   ├── src/components/ - 공통 컴포넌트
│   ├── src/hooks/ - 커스텀 훅
│   ├── src/handlers/ - 이벤트 핸들러
│   └── src/utils/ - 유틸리티 함수
│
└── 🌐 Integration Layer (AppFeature.jsx) - 통합
    └── 모든 기능을 연결하는 중앙 컴포넌트
```

### 핵심 원칙
1. **기능별 독립성**: 각 feature는 독립적으로 수정 가능
2. **명확한 인터페이스**: Facade를 통해 접근
3. **최소한의 의존성**: 다른 기능에 직접 의존하지 않음

---

## 📋 주요 기능 모듈 분석

### 1. 💬 채팅 시스템 (`src/features/chat/`)

**책임**: AI와의 대화 인터페이스, 음성 인식/합성

**주요 파일**:
- `components/ChatFeature.jsx` - 메인 채팅 컴포넌트
- `hooks/useChatVoice.js` - 음성 인식/합성 로직
- `hooks/useChatAutoScroll.js` - 자동 스크롤
- `utils/tts.js` - 텍스트 음성 변환

**의존성**:
- ✅ 독립적 (다른 기능에 의존하지 않음)
- ⚠️ AppFeature에서 상태 관리 (`chatHistory`, `selectedDate` 등)

**수정 시 주의사항**:
- `useChatVoice.js`는 채팅 입력과 긴밀하게 연결되어 있음
- 음성 인식 결과가 채팅 입력으로 직접 연결됨
- **완전 분리 시 기능 깨질 가능성 높음** (REFACTORING_ANALYSIS.md 참고)

---

### 2. 📍 위치 서비스 (`src/features/location/`)

**책임**: 지도 표시, 장소 검색, 경로 안내

**주요 파일**:
- `components/LocationMapSection.jsx` - 지도 표시 (카카오맵)
- `components/LocationDestinationSelection.jsx` - 목적지 선택
- `handlers/locationHandlers.js` - 위치 관련 이벤트 처리
- `modals/components/` - 병원/마트/약국 목록

**의존성**:
- ⚠️ `OpenStreetMapView.jsx` (Leaflet 기반)와 공존
- ⚠️ `HospitalMapSection.jsx`와 별도로 동작
- ✅ 각 지도 컴포넌트는 독립적

**수정 시 주의사항**:
- 지도 로드 로직이 중복되어 있음 (`mapLoader.js`로 분리 가능)
- 각 지도가 다른 API와 목적으로 사용됨 (카카오맵 vs Leaflet)
- **통합 시 기능 제한 발생 가능** (REFACTORING_ANALYSIS.md 참고)

---

### 3. 🏥 병원 이동 (`src/features/hospital/transport/`)

**책임**: 병원 이동 계획, 교통편 안내, 준비사항

**주요 파일**:
- `components/HospitalMapSection.jsx` - 병원 경로 지도 (Leaflet)
- `components/HospitalRequirements.jsx` - 준비사항
- `components/HospitalTrafficSummary.jsx` - 교통 상황
- `hooks/useHospitalTransport.js` - 이동 로직

**의존성**:
- ✅ 독립적
- ⚠️ `LocationMapSection.jsx`와 별도 지도 사용

**수정 시 주의사항**:
- 병원 이동은 독립적인 기능으로 안전하게 수정 가능
- 지도는 Leaflet 기반 (카카오맵과 다름)

---

### 4. 💊 약 관리 (`src/features/medicine/`)

**책임**: 약 복용 알림 설정, 복용 관리

**주요 파일**:
- `modals/components/MedicineAlarmModalFeature.jsx` - 메인 모달
- `modals/components/` - 약 이름 입력, 시간 설정, 요일 선택 등
- `hooks/useMedicineAlarmModal.js` - 복잡한 로직

**의존성**:
- ✅ 독립적
- ⚠️ 일정 관리와 연동 가능 (약 복용 일정)

**수정 시 주의사항**:
- 약 알림 설정은 독립적으로 수정 가능
- 일정 연동 부분만 주의 (schedule 기능과의 연결)

---

### 5. 📅 일정 관리 (`src/features/schedule/`)

**책임**: 일정 등록/수정/삭제, 달력 표시

**주요 파일**:
- `components/ScheduleModals.jsx` - 일정 모달들
- `components/CalendarView.jsx` - 달력 컴포넌트
- `handlers/scheduleHandlers.js` - 일정 이벤트 처리
- `utils/dateFormat.js` - 날짜 포맷팅

**의존성**:
- ⚠️ `ScheduleList.jsx` (src/components/)와 긴밀하게 연결
- ⚠️ 같은 상태(`confirmedTasks`) 공유
- ⚠️ 같은 핸들러(`scheduleHandlers.js`) 사용

**수정 시 주의사항**:
- 달력과 일정 목록이 같은 데이터 공유
- UI/UX 일관성 유지 필요
- **분리 가능하지만 리스크 높음** (REFACTORING_ANALYSIS.md 참고)

---

### 6. 👥 보호자 모니터링 (`src/features/guardian/`)

**책임**: 활동 추적, 실시간 위치, 대시보드

**주요 파일**:
- `components/GuardianActivityCharts.jsx` - 활동 차트
- `components/GuardianLiveLocation.jsx` - 실시간 위치
- `components/GuardianActionButtons.jsx` - 액션 버튼
- `hooks/useGuardianDashboard.js` - 데이터 관리

**의존성**:
- ✅ 독립적
- ⚠️ 채팅 기능과 연동 (보호자 메시지 수신)

**수정 시 주의사항**:
- 보호자 기능은 독립적으로 수정 가능
- 채팅 연동 부분만 주의 (`guardianMessageReceive.js`)

---

### 7. 🎨 레이아웃 (`src/features/layout/`)

**책임**: 앱 레이아웃, 모달 관리, 뷰 전환

**주요 파일**:
- `components/AppLayout.jsx` - 메인 레이아웃
- `components/AppModals.jsx` - 모든 모달 통합 관리
- `components/AppViewSwitch.jsx` - 뷰 전환
- `components/AppRoot.jsx` - 루트 컴포넌트

**의존성**:
- ⚠️ **모든 기능에 의존** (통합 계층)
- ⚠️ 수정 시 다른 기능에 영향 가능성 높음

**수정 시 주의사항**:
- **가장 위험한 수정 영역**
- 다른 기능의 모달/레이아웃에 영향
- **협업 중에는 최대한 건드리지 말 것**

---

### 8. 🔧 앱 핵심 (`src/features/app/`)

**책임**: 전역 상태 관리, 앱 초기화, 부수효과

**주요 파일**:
- `components/AppFeature.jsx` - 메인 앱 컴포넌트
- `hooks/useAppStates.js` - 모든 상태 관리
- `hooks/useAppSideEffects.js` - 자동저장, 스케줄 등 부수효과
- `utils/storage.js` - 로컬 스토리지 관리

**의존성**:
- ⚠️ **모든 기능에 의존** (통합 계층)
- ⚠️ 수정 시 전체 앱에 영향

**수정 시 주의사항**:
- **가장 위험한 수정 영역**
- 상태 구조 변경 시 모든 기능에 영향
- **협업 중에는 최대한 건드리지 말 것**

---

## ⚠️ 협업 시 수정 가이드라인

### ✅ 안전하게 수정 가능한 영역

1. **기능별 컴포넌트** (`features/{기능}/components/`)
   - UI 변경, 스타일 수정
   - 컴포넌트 내부 로직 개선
   - **조건**: Props 인터페이스 유지

2. **기능별 훅** (`features/{기능}/hooks/`)
   - 비즈니스 로직 개선
   - 상태 관리 최적화
   - **조건**: 반환값 인터페이스 유지

3. **기능별 핸들러** (`features/{기능}/handlers/`)
   - 이벤트 처리 로직 개선
   - **조건**: 함수 시그니처 유지

4. **유틸리티 함수** (`features/{기능}/utils/` 또는 `src/utils/`)
   - 헬퍼 함수 개선
   - **조건**: 함수 시그니처 유지

### ⚠️ 주의해서 수정해야 하는 영역

1. **상태 인터페이스 변경**
   - `useAppStates.js`의 상태 구조
   - Props 인터페이스 변경
   - **영향**: 다른 기능에 영향 가능

2. **핸들러 시그니처 변경**
   - `scheduleHandlers.js`, `locationHandlers.js` 등
   - **영향**: AppFeature에서 호출하는 부분에 영향

3. **모달 Props 변경**
   - `AppModals.jsx`에서 전달하는 Props
   - **영향**: 모든 모달에 영향

### ❌ 협업 중 수정 금지 영역

1. **AppFeature.jsx**
   - 전체 앱 통합 로직
   - 상태 구조 변경
   - **이유**: 모든 기능에 영향

2. **AppModals.jsx**
   - 모달 통합 관리
   - **이유**: 모든 모달에 영향

3. **useAppStates.js**
   - 전역 상태 구조
   - **이유**: 모든 기능이 의존

4. **buildAppRootProps.js**
   - Props 빌드 로직
   - **이유**: 모든 컴포넌트에 영향

---

## 🎯 기능별 수정 우선순위

### Phase 1: 독립적 기능 (안전하게 수정 가능)

1. **💊 약 관리** (`medicine/`)
   - 독립적
   - UI/UX 개선 가능
   - 알림 로직 개선 가능

2. **🏥 병원 이동** (`hospital/transport/`)
   - 독립적
   - 교통편 정보 개선 가능
   - 준비사항 업데이트 가능

3. **👥 보호자 모니터링** (`guardian/`)
   - 독립적
   - 차트 개선 가능
   - 모니터링 기능 추가 가능

### Phase 2: 약한 의존성 (주의해서 수정)

1. **💬 채팅 시스템** (`chat/`)
   - 독립적이지만 음성 기능과 긴밀하게 연결
   - UI 개선은 안전
   - 음성 로직 변경 시 주의

2. **📍 위치 서비스** (`location/`)
   - 독립적이지만 지도 로직 중복
   - UI 개선은 안전
   - 지도 로직 변경 시 주의

### Phase 3: 강한 의존성 (최소한의 수정만)

1. **📅 일정 관리** (`schedule/`)
   - 달력과 일정 목록이 긴밀하게 연결
   - UI 개선은 가능
   - 데이터 구조 변경 시 주의

### Phase 4: 통합 계층 (수정 금지)

1. **🎨 레이아웃** (`layout/`)
2. **🔧 앱 핵심** (`app/`)

---

## 🔍 수정 전 체크리스트

### 기능 수정 전 확인사항

- [ ] 수정하려는 기능이 어떤 폴더에 있는지 확인
- [ ] 다른 기능과의 의존성 확인
- [ ] Props/함수 시그니처 변경 여부 확인
- [ ] 상태 구조 변경 여부 확인
- [ ] 다른 팀원이 사용하는 부분인지 확인

### 수정 후 확인사항

- [ ] 해당 기능이 정상 작동하는지 확인
- [ ] 다른 기능에 영향이 없는지 확인
- [ ] Props/함수 시그니처가 유지되는지 확인
- [ ] 에러가 발생하지 않는지 확인

---

## 📝 수정 예시

### ✅ 좋은 수정 예시

```javascript
// features/medicine/modals/components/MedicineAlarmModalFeature.jsx
// UI 개선: 버튼 스타일 변경
// ✅ Props 인터페이스 유지
// ✅ 기능 동작 유지
// ✅ 다른 기능에 영향 없음

const MedicineAlarmModalFeature = ({ isOpen, onClose, ... }) => {
  // 기존 로직 유지
  // UI만 개선
  return (
    <Modal>
      {/* 스타일만 변경 */}
      <button className="new-style">저장</button>
    </Modal>
  );
};
```

### ⚠️ 주의 필요한 수정 예시

```javascript
// features/schedule/handlers/scheduleHandlers.js
// 함수 시그니처 변경
// ⚠️ AppFeature에서 호출하는 부분도 수정 필요
// ⚠️ 다른 기능에 영향 가능

// Before
export const handleScheduleAdd = (task) => { ... }

// After
export const handleScheduleAdd = (task, options) => { ... }
// ⚠️ AppFeature.jsx에서도 수정 필요
```

### ❌ 수정 금지 예시

```javascript
// features/app/hooks/useAppStates.js
// 상태 구조 변경
// ❌ 모든 기능에 영향
// ❌ 협업 중 수정 금지

// Before
const [chatHistory, setChatHistory] = useState([]);

// After
const [chatHistory, setChatHistory] = useState({ messages: [], metadata: {} });
// ❌ ChatFeature.jsx, AppFeature.jsx 등 모든 곳 수정 필요
```

---

## 🚀 다음 단계

1. **수정할 기능 선택**
   - Phase 1 (독립적 기능)부터 시작 권장
   - Phase 4 (통합 계층)는 피하기

2. **의존성 확인**
   - 해당 기능 폴더 내 파일만 수정
   - 다른 기능 폴더는 건드리지 않기

3. **인터페이스 유지**
   - Props, 함수 시그니처 유지
   - 내부 구현만 개선

4. **테스트**
   - 해당 기능 테스트
   - 다른 기능 영향 확인

---

## 📚 참고 문서

- `COLLABORATION_GUIDE.md` - 협업 가이드
- `REFACTORING_ANALYSIS.md` - 리팩토링 분석
- `DEVELOPMENT_GUIDE.md` - 개발 가이드

---

**마지막 업데이트**: 2026년 1월 15일

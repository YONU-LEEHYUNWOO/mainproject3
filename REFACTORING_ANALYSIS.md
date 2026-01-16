# 🔧 리팩토링 분석 및 개선 계획

> **현재 기능 구현을 유지하면서 안전하게 구조를 개선하는 방안**

## 📊 현재 기능 연결 관계 분석 결과

### ✅ 1. 달력-일정 기능 연결 (`CalendarView.jsx` ↔ `ScheduleList.jsx`)

**현재 상태:**
```
CalendarView.jsx ──┐
                   ├── 같은 데이터: confirmedTasks
                   │   같은 핸들러: scheduleHandlers.js
ScheduleList.jsx ──┘
```

**연결 강도:** ⭐⭐⭐⭐⭐ (매우 강함)
- 같은 상태(`confirmedTasks`) 공유
- 같은 이벤트 핸들러(`handleDateClick`, `deleteTask` 등) 사용
- UI 상호작용이 긴밀하게 연결됨

**안전성 평가:**
- ✅ **분리 가능하지만 리스크 높음**
- ✅ **기능 구현에는 영향 없음**
- ⚠️ **UI/UX 일관성 유지 필요**

### ✅ 2. 지도 기능 분산 (`OpenStreetMapView.jsx` ↔ `LocationMapSection.jsx` ↔ `HospitalMapSection.jsx`)

**현재 상태:**
```
OpenStreetMapView.jsx    # Leaflet 기반 기본 지도
├── LocationMapSection.jsx   # 카카오맵 + 경로 표시
├── HospitalMapSection.jsx   # Leaflet + 병원 경로
└── SimpleRouteMap.jsx       # SVG 기반 경로 표시
```

**연결 강도:** ⭐⭐⭐ (중간)
- 각 컴포넌트가 서로 다른 용도로 사용됨
- 공통 인터페이스(`trafficData`)로 연결
- Leaflet 로드 로직 중복

**안전성 평가:**
- ✅ **분리 가능하지만 복잡함**
- ⚠️ **각 지도가 다른 목적으로 사용되어 통합 시 기능 손실 위험**
- ✅ **중복 로드 로직 제거는 안전**

### ✅ 3. 채팅-음성 기능 통합 (`ChatFeature.jsx` ↔ `useChatVoice.js`)

**현재 상태:**
```
ChatFeature.jsx
├── useChatVoice.js      # 음성 인식 로직
├── speechRecognition    # 음성 인식 유틸리티
└── voiceCommandProcessor # 음성 명령 처리
```

**연결 강도:** ⭐⭐⭐⭐⭐ (매우 강함)
- 채팅 입력과 음성 입력이 동일한 로직 공유
- UI 상태(`isVoiceRecording`)가 긴밀하게 연결
- 음성 인식 결과가 채팅 입력으로 직접 연결

**안전성 평가:**
- ❌ **분리 위험 높음 - 현재 구조 유지 추천**
- ✅ **이미 useChatVoice.js로 어느 정도 분리됨**
- ✅ **더 분리할 경우 기능 깨질 가능성 높음**

---

## 🎯 안전한 개선 우선순위 (위험도 낮은 순)

### 1️⃣ **달력 컴포넌트 schedule/ 폴더로 이동** ⭐⭐⭐ (낮은 위험)

**현재 위치:** `src/components/CalendarView.jsx`
**제안 위치:** `src/features/schedule/components/CalendarView.jsx`

**이점:**
- 일정 관련 컴포넌트들이 한 곳에 모임
- 협업 시 일정 팀이 한 폴더에서 작업 가능
- 기능적 결합도가 높아 적합

**안전성:** ⭐⭐⭐⭐⭐
- 파일 이동만으로 완료
- import 경로만 변경하면 됨
- 기능 구현에 영향 없음

**실행 계획:**
```bash
# 1. 파일 이동
mv src/components/CalendarView.jsx src/features/schedule/components/

# 2. import 경로 업데이트 (사용하는 파일들에서)
# src/components/DashboardSidebar.jsx 등에서 경로 변경
```

### 2️⃣ **지도 로드 로직 중복 제거** ⭐⭐⭐⭐ (중간 위험)

**현재 문제:** Leaflet 로드 로직이 `OpenStreetMapView.jsx`에 중복

**해결 방안:** `utils/mapLoader.js` 생성

**이점:**
- 지도 로드 로직이 한 곳에 집중
- 유지보수성 향상

**안전성:** ⭐⭐⭐⭐⭐
- 기존 API 유지하면서 내부 로직만 분리
- 실패 시 fallback 로직 존재

### 3️⃣ **일정 핸들러 정리 (선택적)** ⭐⭐ (높은 위험)

**현재 구조:**
```
src/handlers/scheduleHandlers.js (실제 로직)
src/features/schedule/handlers/scheduleHandlers.js (재export)
```

**개선 방안:** 불필요한 재export 제거

**안전성:** ⭐⭐⭐⭐
- 단순한 구조 정리
- 기능 영향 최소

---

## ⚠️ 위험한 개선 방안 (실행 권장하지 않음)

### ❌ **지도 기능 완전 통합** (높은 위험)
```
현재: 각 기능이 독립된 지도 컴포넌트 사용
문제: 서로 다른 API와 목적으로 사용되어 통합 시 기능 제한 발생 가능
```

### ❌ **채팅-음성 기능 완전 분리** (매우 높은 위험)
```
현재: ChatFeature.jsx에 음성 기능이 긴밀하게 통합
문제: 분리 시 음성 입력 ↔ 채팅 입력 간 실시간 동기화 깨질 수 있음
```

---

## 🚀 권장 실행 계획

### Phase 1: 안전한 개선 (즉시 실행 가능)
1. **달력 컴포넌트 이동** → `schedule/components/`로
2. **지도 로드 로직 분리** → `utils/mapLoader.js` 생성

### Phase 2: 선택적 개선 (테스트 후 진행)
1. **일정 핸들러 구조 정리**
2. **컴포넌트 import 경로 최적화**

### Phase 3: 고위험 개선 (충분한 테스트 후)
- 지도 기능 재설계 (필요 시)
- 채팅 아키텍처 개선 (필요 시)

---

## 📋 테스트 및 검증 체크리스트

### 달력 이동 시 확인사항:
- [ ] 달력 클릭 시 일정 선택 기능 정상 작동
- [ ] 일정 추가/수정/삭제 기능 정상 작동
- [ ] 날짜 필터링 기능 정상 작동
- [ ] UI 스타일 유지됨

### 지도 로드 로직 분리 시 확인사항:
- [ ] 모든 지도 컴포넌트 정상 로드
- [ ] 지도 표시 및 경로 표시 기능 유지
- [ ] 에러 처리 및 fallback 동작 확인

---

## 🎯 결론

**현재 코드베이스는 기능적으로 잘 구현되어 있으며, 과도한 리팩토링은 오히려 위험할 수 있습니다.**

### 권장 접근법:
1. **Phase 1의 안전한 개선만 진행**
2. **기능 테스트 철저히 수행**
3. **문제가 생기면 즉시 원복**

### 기대 효과:
- 협업 시 폴더 구조가 더 명확해짐
- MERGE 충돌 위험 감소
- 유지보수성 약간 향상

**"작동하는 코드를 불필요하게 건드리지 말라"는 원칙을 따르는 것을 추천합니다.** 🚀
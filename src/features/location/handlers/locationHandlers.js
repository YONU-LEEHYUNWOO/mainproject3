// 위치 기능 핸들러 재-export
// - App.jsx는 기능별 features 경로만 import하도록 정리하기 위함
// - 실제 로직/동작은 기존 `src/handlers/locationHandlers.js`를 그대로 사용한다 (UI/로직 변경 금지)

export {
    handlePlaceSearch,
    handleSelectPlace,
    handleSchedulePlaceSearch,
    handleSelectSchedulePlace,
    handleTaskEditPlaceSearch,
    handleSelectTaskEditPlace
} from '../../../handlers/locationHandlers';


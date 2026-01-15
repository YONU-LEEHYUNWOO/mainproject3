import React from 'react';
import { useHospitalTransport } from '../features/hospital/transport/hooks/useHospitalTransport';
import HospitalDestinationCard from '../features/hospital/transport/components/HospitalDestinationCard';
import HospitalRequirements from '../features/hospital/transport/components/HospitalRequirements';
import HospitalTrafficSummary from '../features/hospital/transport/components/HospitalTrafficSummary';
import HospitalWeatherCard from '../features/hospital/transport/components/HospitalWeatherCard';
import HospitalMapSection from '../features/hospital/transport/components/HospitalMapSection';
import HospitalModals from '../features/hospital/transport/components/HospitalModals';
import { Navigation2, CheckCircle } from 'lucide-react';

/**
 * 병원 이동 지원 컴포넌트 (Refactored)
 */
const HospitalTransport = (props) => {
    const {
        task,
        language,
        locationInfo,
        currentGPSLocation,
        onCallTaxi,
        onPublicTransport,
        onArrival,
        onMovementStart
    } = props;

    // 1. 비즈니스 로직 및 상태 관리 훅
    const {
        transportStatus, setTransportStatus,
        selectedTransportMode, setSelectedTransportMode,
        checkedRequirements, setCheckedRequirements,
        showTaxiModal, setShowTaxiModal,
        showTransportModeModal, setShowTransportModeModal,
        showPublicTransportModal, setShowPublicTransportModal,
        weatherData,
        trafficData,
        visitType,
        originAddress
    } = useHospitalTransport({
        task,
        locationInfo,
        currentGPSLocation,
        onMovementStart
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 1. 병원 예약 정보 카드 */}
            <HospitalDestinationCard 
                task={task}
                visitType={visitType}
            />

            {/* 2. 방문 유형별 준비물 체크리스트 */}
            <HospitalRequirements 
                visitType={visitType}
                language={language}
                checkedRequirements={checkedRequirements}
                setCheckedRequirements={setCheckedRequirements}
            />

            {/* 3. 교통 정보 요약 */}
            <HospitalTrafficSummary 
                trafficData={trafficData}
            />

            {/* 4. 날씨 알림 카드 */}
            <HospitalWeatherCard 
                weatherData={weatherData}
            />

            {/* 5. 경로 지도 영역 */}
            <HospitalMapSection 
                trafficData={trafficData}
                transportStatus={transportStatus}
            />

            {/* 6. 액션 버튼 영역 */}
            <div className="pt-2">
                {transportStatus === 'preparation' ? (
                    <button
                        onClick={() => setShowTransportModeModal(true)}
                        className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all"
                    >
                        <Navigation2 size={24} />
                        이동 시작하기
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setTransportStatus('arrived');
                            if (onArrival) onArrival();
                        }}
                        className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-green-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-green-700 transition-all"
                    >
                        <CheckCircle size={24} />
                        병원 도착 확인
                    </button>
                )}
            </div>

            {/* 7. 기능 모달 묶음 */}
            <HospitalModals 
                task={task}
                showTransportModeModal={showTransportModeModal}
                setShowTransportModeModal={setShowTransportModeModal}
                showPublicTransportModal={showPublicTransportModal}
                setShowPublicTransportModal={setShowPublicTransportModal}
                showTaxiModal={showTaxiModal}
                setShowTaxiModal={setShowTaxiModal}
                trafficData={trafficData}
                onMovementStart={onMovementStart}
                setSelectedTransportMode={setSelectedTransportMode}
                setTransportStatus={setTransportStatus}
                onPublicTransport={onPublicTransport}
                originAddress={originAddress}
                onCallTaxi={onCallTaxi}
            />
        </div>
    );
};

export default HospitalTransport;

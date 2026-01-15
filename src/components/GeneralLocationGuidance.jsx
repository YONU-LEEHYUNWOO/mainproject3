import React from 'react';
import { useLocationService } from '../features/location/hooks/useLocationService';
import LocationDestinationCard from '../features/location/components/LocationDestinationCard';
import LocationTrafficSummary from '../features/location/components/LocationTrafficSummary';
import LocationWeatherCard from '../features/location/components/LocationWeatherCard';
import LocationMapSection from '../features/location/components/LocationMapSection';
import LocationModals from '../features/location/components/LocationModals';
import { Car, Train, Navigation2, CheckCircle, Activity, Phone } from 'lucide-react';
import { t } from '../i18n';

/**
 * 일반 위치 기반 안내 컴포넌트 (Refactored)
 */
const GeneralLocationGuidance = (props) => {
    const {
        destination,
        destinationType,
        language,
        locationInfo,
        currentGPSLocation,
        onCallTaxi,
        onPublicTransport,
        onArrival,
        onMovementStart,
        destinationPlace
    } = props;

    // 전용 훅 사용
    const {
        transportStatus, setTransportStatus,
        selectedTransportMode, setSelectedTransportMode,
        showTaxiModal, setShowTaxiModal,
        showTransportModeModal, setShowTransportModeModal,
        showPublicTransportModal, setShowPublicTransportModal,
        showNavigationModal, setShowNavigationModal,
        weatherData,
        trafficData,
        realtimeNavigation, setRealtimeNavigation,
        originAddress
    } = useLocationService({
        destination,
        destinationType,
        locationInfo,
        currentGPSLocation,
        onMovementStart,
        destinationPlace
    });

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 1. 목적지 정보 카드 */}
            <LocationDestinationCard 
                destination={destination}
                destinationType={destinationType}
                locationInfo={locationInfo}
            />

            {/* 2. 교통 정보 요약 */}
            <LocationTrafficSummary 
                trafficData={trafficData}
                language={language}
                destinationType={destinationType}
            />

            {/* 3. 날씨 정보 카드 */}
            <LocationWeatherCard 
                weatherData={weatherData}
                language={language}
            />

            {/* 4. 지도 영역 */}
            <LocationMapSection 
                trafficData={trafficData}
                currentGPSLocation={currentGPSLocation}
                transportStatus={transportStatus}
                selectedTransportMode={selectedTransportMode}
            />

            {/* 5. 액션 버튼 영역 */}
            <div className="grid grid-cols-2 gap-4">
                {transportStatus === 'preparation' ? (
                    <>
                        <button
                            onClick={() => setShowTransportModeModal(true)}
                            className="flex items-center justify-center gap-3 px-6 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl"
                        >
                            <Navigation2 size={24} /> 길 안내 시작
                        </button>
                        <button
                            onClick={() => setShowTaxiModal(true)}
                            className="flex items-center justify-center gap-3 px-6 py-5 bg-yellow-400 text-white rounded-2xl font-black text-lg shadow-xl"
                        >
                            <Car size={24} /> 택시 호출
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => {
                            setTransportStatus('arrived');
                            if (onArrival) onArrival();
                        }}
                        className="col-span-2 flex items-center justify-center gap-3 px-6 py-5 bg-green-600 text-white rounded-2xl font-black text-lg shadow-xl"
                    >
                        <CheckCircle size={24} /> 목적지 도착 확인
                    </button>
                )}
            </div>

            {/* 6. 모달 묶음 */}
            <LocationModals 
                destination={destination}
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
                setShowNavigationModal={setShowNavigationModal}
                onPublicTransport={onPublicTransport}
                originAddress={originAddress}
                currentGPSLocation={currentGPSLocation}
                locationInfo={locationInfo}
                onCallTaxi={onCallTaxi}
            />
        </div>
    );
};

export default GeneralLocationGuidance;

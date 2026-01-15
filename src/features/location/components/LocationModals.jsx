import React from 'react';
import { Car, Train, Activity, X, Navigation2, Clock, MapPin, AlertCircle, Loader2, Phone } from 'lucide-react';

/**
 * 위치 안내 관련 모달 묶음 컴포넌트
 */
const LocationModals = ({
    destination,
    showTransportModeModal, setShowTransportModeModal,
    showPublicTransportModal, setShowPublicTransportModal,
    showTaxiModal, setShowTaxiModal,
    trafficData,
    onMovementStart,
    setSelectedTransportMode,
    setTransportStatus,
    setShowNavigationModal,
    onPublicTransport,
    originAddress,
    currentGPSLocation,
    locationInfo,
    onCallTaxi
}) => {
    
    // 1. 이동 수단 선택 모달
    const renderTransportModeModal = () => (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowTransportModeModal(false)}
        >
            <div 
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-black text-slate-900 mb-2">{destination}로 가는 방법을 선택해주세요</h3>
                <p className="text-base text-slate-600 font-bold mb-6">어떤 방법으로 이동하시겠어요?</p>
                
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => {
                            setSelectedTransportMode('car');
                            setShowTransportModeModal(false);
                            setTransportStatus('navigating');
                            setShowNavigationModal(true);
                            if (onMovementStart) onMovementStart({ transportMode: 'car', from: originAddress, to: destination });
                        }}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[120px]"
                    >
                        <Car size={40} className="text-red-600" />
                        <span className="text-red-800">자동차/택시</span>
                    </button>
                    
                    <button
                        onClick={() => {
                            setSelectedTransportMode('publicTransport');
                            setShowTransportModeModal(false);
                            setTransportStatus('navigating');
                            if (onPublicTransport) onPublicTransport();
                            if (onMovementStart) onMovementStart({ transportMode: 'publicTransport', from: originAddress, to: destination });
                        }}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[120px]"
                    >
                        <Train size={40} className="text-blue-600" />
                        <span className="text-blue-800">대중교통</span>
                    </button>

                    <button
                        onClick={() => {
                            setSelectedTransportMode('walking');
                            setShowTransportModeModal(false);
                            setTransportStatus('navigating');
                            setShowNavigationModal(true);
                            if (onMovementStart) onMovementStart({ transportMode: 'walking', from: originAddress, to: destination });
                        }}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[120px]"
                    >
                        <Activity size={40} className="text-green-600" />
                        <span className="text-green-800">도보</span>
                    </button>
                    
                    <button
                        onClick={() => setShowTransportModeModal(false)}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[120px]"
                    >
                        <X size={40} className="text-slate-600" />
                        <span className="text-slate-700">취소</span>
                    </button>
                </div>
            </div>
        </div>
    );

    // 2. 대중교통 안내 모달
    const renderPublicTransportModal = () => (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowPublicTransportModal(false)}
        >
            <div 
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg">
                            <Train size={28} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">대중교통 안내</h3>
                            <p className="text-base text-slate-600 font-bold">{destination}로 가는 방법</p>
                        </div>
                    </div>
                    <button onClick={() => setShowPublicTransportModal(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>
                
                {trafficData.loading ? (
                    <div className="py-12 flex flex-col items-center"><Loader2 className="animate-spin text-blue-500 mb-4" /><p>조회 중...</p></div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-200">
                            <div className="flex justify-between items-center">
                                <span className="font-black text-blue-700">예상 소요 시간</span>
                                <span className="text-3xl font-black text-blue-900">{trafficData.publicTransportDuration || '정보 없음'}</span>
                            </div>
                        </div>
                        {trafficData.publicTransportTip && (
                            <div className="bg-white p-6 rounded-2xl border-2 border-blue-100">
                                <h4 className="font-black mb-2">추천 경로</h4>
                                <p className="font-bold text-slate-700 leading-relaxed">{trafficData.publicTransportTip}</p>
                            </div>
                        )}
                        <button
                            onClick={() => {
                                setShowPublicTransportModal(false);
                                setTransportStatus('navigating');
                                setShowNavigationModal(true);
                            }}
                            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg"
                        >
                            안내 시작
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    // 3. 택시 호출 모달
    const renderTaxiModal = () => (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowTaxiModal(false)}
        >
            <div 
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-2xl font-black text-slate-900 mb-4">택시 호출</h3>
                <p className="text-lg text-slate-700 font-bold mb-6">{destination}로 택시를 호출할까요?</p>
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            if (onCallTaxi) onCallTaxi();
                            setShowTaxiModal(false);
                        }}
                        className="w-full py-5 bg-yellow-400 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3"
                    >
                        <Car size={24} /> 카카오택시 호출
                    </button>
                    <button
                        onClick={() => setShowTaxiModal(false)}
                        className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-black"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {showTransportModeModal && renderTransportModeModal()}
            {showPublicTransportModal && renderPublicTransportModal()}
            {showTaxiModal && renderTaxiModal()}
        </>
    );
};

export default LocationModals;

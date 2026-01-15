import React from 'react';
import { Car, Train, Activity, X, Navigation2, Loader2 } from 'lucide-react';

/**
 * 병원 이동 관련 모달 묶음
 */
const HospitalModals = ({
    task,
    showTransportModeModal, setShowTransportModeModal,
    showPublicTransportModal, setShowPublicTransportModal,
    showTaxiModal, setShowTaxiModal,
    trafficData,
    onMovementStart,
    setSelectedTransportMode,
    setTransportStatus,
    onPublicTransport,
    originAddress,
    onCallTaxi
}) => {
    
    // 1. 이동 수단 선택 모달
    const renderTransportModeModal = () => (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowTransportModeModal(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-black text-slate-900 mb-2">{task?.location}로 어떻게 갈까요?</h3>
                <p className="text-base text-slate-600 font-bold mb-6">편리한 이동 수단을 선택해주세요.</p>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => {
                            setSelectedTransportMode('car');
                            setShowTransportModeModal(false);
                            setTransportStatus('navigating');
                            if (onMovementStart) onMovementStart({ transportMode: 'car', from: originAddress, to: task?.location });
                        }}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-red-50 border-2 border-red-200 rounded-2xl font-black text-red-800"
                    >
                        <Car size={40} />
                        <span>자동차/택시</span>
                    </button>
                    <button
                        onClick={() => {
                            setSelectedTransportMode('publicTransport');
                            setShowTransportModeModal(false);
                            setTransportStatus('navigating');
                            if (onPublicTransport) onPublicTransport();
                            if (onMovementStart) onMovementStart({ transportMode: 'publicTransport', from: originAddress, to: task?.location });
                        }}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl font-black text-blue-800"
                    >
                        <Train size={40} />
                        <span>대중교통</span>
                    </button>
                    <button onClick={() => setShowTransportModeModal(false)} className="col-span-2 py-4 bg-slate-100 rounded-xl font-black">취소</button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {showTransportModeModal && renderTransportModeModal()}
            {/* 필요시 택시/대중교통 상세 모달 추가 구현 */}
        </>
    );
};

export default HospitalModals;

import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { t } from '../i18n';

/**
 * 병원 도착 및 진료 진행 컴포넌트
 * 도착 확인, 대기 정보, 진료 시작/종료 기록
 */
const HospitalArrival = ({ task, language, onArrival, onTreatmentStart, onTreatmentEnd }) => {
    const [arrived, setArrived] = useState(false);
    const [treatmentStarted, setTreatmentStarted] = useState(false);
    const [treatmentEnded, setTreatmentEnded] = useState(false);

    // 시뮬레이션 대기 정보
    const waitingInfo = {
        number: 3,
        estimatedTime: '약 20분'
    };

    const handleArrival = () => {
        setArrived(true);
        if (onArrival) onArrival();
    };

    const handleTreatmentStart = () => {
        setTreatmentStarted(true);
        if (onTreatmentStart) onTreatmentStart();
    };

    const handleTreatmentEnd = () => {
        setTreatmentEnded(true);
        if (onTreatmentEnd) onTreatmentEnd();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* 도착 화면 */}
            {!arrived && (
                <div className="bg-pastel-green/30 rounded-3xl p-8 border-2 border-pastel-green/50 text-center">
                    <MapPin size={48} className="text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-green-900 mb-6">{task?.location || '병원'}</h3>
                    <button
                        onClick={handleArrival}
                        className="w-full px-8 py-6 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-3xl font-black text-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[80px]"
                    >
                        {t('arrived', language)}
                    </button>
                </div>
            )}

            {/* 대기 정보 */}
            {arrived && !treatmentStarted && (
                <div className="bg-pastel-blue/30 rounded-3xl p-6 border-2 border-pastel-blue/50">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock size={28} className="text-blue-600" />
                        <h4 className="font-black text-blue-900 text-xl">{t('waitingInfo', language)}</h4>
                    </div>
                    <div className="space-y-3 mb-5">
                        <div className="flex items-center justify-between">
                            <span className="text-lg text-blue-700 font-black">{t('waitingNumber', language)}</span>
                            <span className="text-3xl font-black text-blue-900">{waitingInfo.number}명</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-lg text-blue-700 font-black">{t('waitingTime', language)}</span>
                            <span className="text-3xl font-black text-blue-900">{waitingInfo.estimatedTime}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleTreatmentStart}
                        className="w-full px-8 py-6 bg-gradient-to-r from-pastel-purple to-pastel-pink text-white rounded-3xl font-black text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[80px]"
                    >
                        {t('treatmentStart', language)}
                    </button>
                </div>
            )}

            {/* 진료 진행 중 */}
            {treatmentStarted && !treatmentEnded && (
                <div className="bg-pastel-purple/30 rounded-3xl p-6 border-2 border-pastel-purple/50 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Clock size={32} className="text-purple-600 animate-pulse" />
                        <h4 className="font-black text-purple-900 text-2xl">{t('treatmentStart', language)}</h4>
                    </div>
                    <p className="text-lg text-purple-700 mb-6 font-bold">진료가 진행 중입니다...</p>
                    <button
                        onClick={handleTreatmentEnd}
                        className="w-full px-8 py-6 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-3xl font-black text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[80px]"
                    >
                        {t('treatmentEnd', language)}
                    </button>
                </div>
            )}

            {/* 진료 완료 */}
            {treatmentEnded && (
                <div className="bg-pastel-green/30 rounded-3xl p-8 border-2 border-pastel-green/50 text-center">
                    <CheckCircle2 size={64} className="text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-green-900 mb-3">{t('treatmentCompleted', language)}</h3>
                    <p className="text-lg text-green-700 font-bold">수고하셨습니다. 다음 행동을 안내해드리겠습니다.</p>
                </div>
            )}
        </div>
    );
};

export default HospitalArrival;


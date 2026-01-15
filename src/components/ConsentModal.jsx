import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, MapPin, Heart, CheckCircle, X, Volume2, VolumeX } from 'lucide-react';
import { t } from '../i18n';

/**
 * 동의 모달 컴포넌트
 * 위치 정보 및 건강정보 수집 동의 화면
 */
const ConsentModal = ({ 
    type, // 'location' | 'health'
    language,
    onConsent,
    onReject,
    ttsEnabled = true
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const speechSynthesisRef = useRef(null);

    // 동의 내용 텍스트 (다국어 지원)
    const consentTexts = {
        ko: {
            location: {
                title: '위치 정보 수집 및 이용 동의',
                description: '함께잇다 서비스는 다음과 같은 목적으로 위치 정보를 수집 및 이용합니다.',
                purposes: [
                    '길 안내 및 경로 추천 서비스 제공',
                    '주변 장소 검색 및 추천',
                    '실시간 위치 기반 안전 감지',
                    '보호자에게 위치 정보 전달 (긴급 상황 시)'
                ],
                dataTypes: [
                    '현재 위치 (GPS 좌표)',
                    '이동 경로 기록',
                    '방문 장소 정보'
                ],
                retention: '서비스 이용 기간 동안 보관하며, 회원 탈퇴 시 즉시 삭제됩니다.',
                consentText: '위치 정보 수집 및 이용에 동의하시겠습니까?',
                consentButton: '동의합니다',
                rejectButton: '동의하지 않습니다'
            },
            health: {
                title: '건강정보 수집 및 이용 동의',
                description: '함께잇다 서비스는 다음과 같은 목적으로 건강정보를 수집 및 이용합니다.',
                purposes: [
                    '약 복용 알림 및 관리',
                    '병원 일정 관리 및 추천',
                    '건강 패턴 분석 및 추천',
                    '보호자에게 건강 상태 전달 (긴급 상황 시)'
                ],
                dataTypes: [
                    '약 복용 기록',
                    '병원 방문 기록',
                    '활동량 정보',
                    '무활동 감지 기록'
                ],
                retention: '서비스 이용 기간 동안 보관하며, 회원 탈퇴 시 즉시 삭제됩니다.',
                consentText: '건강정보 수집 및 이용에 동의하시겠습니까?',
                consentButton: '동의합니다',
                rejectButton: '동의하지 않습니다'
            }
        },
        en: {
            location: {
                title: 'Location Information Collection and Use Consent',
                description: 'Together Connected collects and uses location information for the following purposes.',
                purposes: [
                    'Providing navigation and route recommendation services',
                    'Searching and recommending nearby places',
                    'Real-time location-based safety detection',
                    'Sending location information to guardians (in emergency situations)'
                ],
                dataTypes: [
                    'Current location (GPS coordinates)',
                    'Movement route records',
                    'Visited place information'
                ],
                retention: 'Data is stored during the service period and deleted immediately upon account withdrawal.',
                consentText: 'Do you agree to the collection and use of location information?',
                consentButton: 'I Agree',
                rejectButton: 'I Do Not Agree'
            },
            health: {
                title: 'Health Information Collection and Use Consent',
                description: 'Together Connected collects and uses health information for the following purposes.',
                purposes: [
                    'Medication reminder and management',
                    'Hospital schedule management and recommendations',
                    'Health pattern analysis and recommendations',
                    'Sending health status to guardians (in emergency situations)'
                ],
                dataTypes: [
                    'Medication records',
                    'Hospital visit records',
                    'Activity information',
                    'Inactivity detection records'
                ],
                retention: 'Data is stored during the service period and deleted immediately upon account withdrawal.',
                consentText: 'Do you agree to the collection and use of health information?',
                consentButton: 'I Agree',
                rejectButton: 'I Do Not Agree'
            }
        },
        ja: {
            location: {
                title: '位置情報の収集および利用に関する同意',
                description: 'Together Connectedは以下の目的で位置情報を収集・利用します。',
                purposes: [
                    '道案内および経路推奨サービスの提供',
                    '周辺場所の検索および推奨',
                    'リアルタイム位置ベースの安全検知',
                    '保護者への位置情報送信（緊急時）'
                ],
                dataTypes: [
                    '現在位置（GPS座標）',
                    '移動経路記録',
                    '訪問場所情報'
                ],
                retention: 'サービス利用期間中保管し、会員退会時に即座に削除されます。',
                consentText: '位置情報の収集および利用に同意されますか？',
                consentButton: '同意します',
                rejectButton: '同意しません'
            },
            health: {
                title: '健康情報の収集および利用に関する同意',
                description: 'Together Connectedは以下の目的で健康情報を収集・利用します。',
                purposes: [
                    '薬の服用リマインダーおよび管理',
                    '病院スケジュール管理および推奨',
                    '健康パターン分析および推奨',
                    '保護者への健康状態送信（緊急時）'
                ],
                dataTypes: [
                    '薬の服用記録',
                    '病院訪問記録',
                    '活動量情報',
                    '無活動検知記録'
                ],
                retention: 'サービス利用期間中保管し、会員退会時に即座に削除されます。',
                consentText: '健康情報の収集および利用に同意されますか？',
                consentButton: '同意します',
                rejectButton: '同意しません'
            }
        }
    };

    const consentData = consentTexts[language]?.[type] || consentTexts.ko[type];
    const fullText = `${consentData.title}. ${consentData.description} ${consentData.purposes.join(' ')} ${consentData.dataTypes.join(' ')} ${consentData.retention} ${consentData.consentText}`;

    // TTS 음성 재생
    const playConsentText = () => {
        if (!ttsEnabled || !('speechSynthesis' in window)) {
            return;
        }

        if (isPlaying) {
            // 재생 중이면 중지
            if (speechSynthesisRef.current) {
                window.speechSynthesis.cancel();
                speechSynthesisRef.current = null;
            }
            setIsPlaying(false);
            return;
        }

        // 음성 재생 시작
        const utterance = new SpeechSynthesisUtterance(fullText);
        utterance.lang = language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US';
        utterance.rate = 0.9; // 약간 느리게
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
            setIsPlaying(false);
            speechSynthesisRef.current = null;
        };

        utterance.onerror = () => {
            setIsPlaying(false);
            speechSynthesisRef.current = null;
        };

        window.speechSynthesis.speak(utterance);
        speechSynthesisRef.current = utterance;
        setIsPlaying(true);
    };

    // 컴포넌트 언마운트 시 음성 중지
    useEffect(() => {
        return () => {
            if (speechSynthesisRef.current) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div 
                className="bg-white rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {type === 'location' ? (
                            <MapPin size={48} className="text-blue-600" />
                        ) : (
                            <Heart size={48} className="text-red-600" />
                        )}
                        <h2 className="text-3xl font-black text-slate-900" style={{ fontSize: 'var(--font-size-3xl)' }}>
                            {consentData.title}
                        </h2>
                    </div>
                    {onReject && (
                        <button
                            onClick={onReject}
                            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                            style={{ minWidth: 'var(--button-size-min)', minHeight: 'var(--button-size-min)' }}
                        >
                            <X size={24} className="text-slate-600" />
                        </button>
                    )}
                </div>

                {/* 설명 */}
                <div className="space-y-6 mb-8">
                    <p className="text-lg text-slate-700 leading-relaxed" style={{ fontSize: 'var(--font-size-lg)' }}>
                        {consentData.description}
                    </p>

                    {/* 수집 목적 */}
                    <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                        <h3 className="text-xl font-black text-blue-900 mb-4" style={{ fontSize: 'var(--font-size-xl)' }}>
                            📋 수집 목적
                        </h3>
                        <ul className="space-y-2">
                            {consentData.purposes.map((purpose, index) => (
                                <li key={index} className="flex items-start gap-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                                    <CheckCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span>{purpose}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 수집 항목 */}
                    <div className="bg-green-50 rounded-2xl p-6 border-2 border-green-200">
                        <h3 className="text-xl font-black text-green-900 mb-4" style={{ fontSize: 'var(--font-size-xl)' }}>
                            📊 수집 항목
                        </h3>
                        <ul className="space-y-2">
                            {consentData.dataTypes.map((dataType, index) => (
                                <li key={index} className="flex items-start gap-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                                    <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>{dataType}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 보관 기간 */}
                    <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-200">
                        <h3 className="text-xl font-black text-purple-900 mb-2" style={{ fontSize: 'var(--font-size-xl)' }}>
                            ⏰ 보관 기간
                        </h3>
                        <p className="text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            {consentData.retention}
                        </p>
                    </div>
                </div>

                {/* 음성 재생 버튼 */}
                {ttsEnabled && (
                    <div className="mb-6 flex justify-center">
                        <button
                            onClick={playConsentText}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all duration-200 ${
                                isPlaying
                                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                            }`}
                            style={{ fontSize: 'var(--font-size-lg)', minHeight: 'var(--button-size-large)' }}
                        >
                            {isPlaying ? (
                                <>
                                    <VolumeX size={24} />
                                    음성 중지
                                </>
                            ) : (
                                <>
                                    <Volume2 size={24} />
                                    음성으로 듣기
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* 동의 문구 */}
                <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200 mb-6">
                    <p className="text-xl font-black text-slate-900 text-center" style={{ fontSize: 'var(--font-size-xl)' }}>
                        {consentData.consentText}
                    </p>
                </div>

                {/* 버튼 */}
                <div className="flex gap-4">
                    <button
                        onClick={onReject}
                        className="flex-1 px-6 py-5 bg-slate-200 text-slate-700 rounded-2xl font-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                        style={{ fontSize: 'var(--font-size-xl)', minHeight: 'var(--button-size-large)' }}
                    >
                        {consentData.rejectButton}
                    </button>
                    <button
                        onClick={onConsent}
                        className="flex-1 px-6 py-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl font-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                        style={{ fontSize: 'var(--font-size-xl)', minHeight: 'var(--button-size-large)' }}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <ShieldCheck size={24} />
                            {consentData.consentButton}
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConsentModal;

import React from 'react';
import ConsentModal from '../../../components/ConsentModal';

// 위치/건강 정보 동의 모달 묶음 컴포넌트
const ConsentModals = ({
    showLocationConsent,
    setShowLocationConsent,
    showHealthConsent,
    setShowHealthConsent,
    consentStatus,
    setConsentStatus,
    saveConsentStatus,
    ttsEnabled,
    language
}) => {
    return (
        <>
            {/* 위치 정보 동의 모달 */}
            {showLocationConsent && (
                <ConsentModal
                    type="location"
                    language={language}
                    ttsEnabled={ttsEnabled}
                    onConsent={() => {
                        const newConsentStatus = { ...consentStatus, location: true };
                        setConsentStatus(newConsentStatus);
                        saveConsentStatus(newConsentStatus);
                        setShowLocationConsent(false);
                        // 위치 정보 동의 후 건강정보 동의 확인
                        if (!consentStatus.health) {
                            setTimeout(() => {
                                setShowHealthConsent(true);
                            }, 500);
                        }
                    }}
                    onReject={() => {
                        // 동의 거부 시에도 모달 닫기 (나중에 다시 표시 가능)
                        setShowLocationConsent(false);
                    }}
                />
            )}

            {/* 건강정보 동의 모달 */}
            {showHealthConsent && (
                <ConsentModal
                    type="health"
                    language={language}
                    ttsEnabled={ttsEnabled}
                    onConsent={() => {
                        const newConsentStatus = { ...consentStatus, health: true };
                        setConsentStatus(newConsentStatus);
                        saveConsentStatus(newConsentStatus);
                        setShowHealthConsent(false);
                    }}
                    onReject={() => {
                        // 동의 거부 시에도 모달 닫기 (나중에 다시 표시 가능)
                        setShowHealthConsent(false);
                    }}
                />
            )}
        </>
    );
};

export default ConsentModals;

import React from 'react';
import CustomerSupportModal from '../../../components/modals/CustomerSupportModal';

// 고객지원 모달 진입 컴포넌트
const CustomerSupportModalFeature = ({
    showCustomerSupport,
    setShowCustomerSupport,
    customerSupportTab,
    setCustomerSupportTab,
    selectedScreenGuide,
    setSelectedScreenGuide,
    setChatHistory,
    setIsViewTransitioning,
    setCurrentView,
    consentStatus,
    setShowLocationConsent,
    setShowHealthConsent,
    language
}) => {
    return (
        <CustomerSupportModal
            showCustomerSupport={showCustomerSupport}
            setShowCustomerSupport={setShowCustomerSupport}
            customerSupportTab={customerSupportTab}
            setCustomerSupportTab={setCustomerSupportTab}
            selectedScreenGuide={selectedScreenGuide}
            setSelectedScreenGuide={setSelectedScreenGuide}
            setChatHistory={setChatHistory}
            setIsViewTransitioning={setIsViewTransitioning}
            setCurrentView={setCurrentView}
            consentStatus={consentStatus}
            setShowLocationConsent={setShowLocationConsent}
            setShowHealthConsent={setShowHealthConsent}
            language={language}
        />
    );
};

export default CustomerSupportModalFeature;

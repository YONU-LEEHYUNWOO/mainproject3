import React from 'react';
import { X } from 'lucide-react';
import { t } from '../../../../i18n';
import GPSSettingsSection from '../../../../components/modals/locationSettings/GPSSettingsSection';
import HomeAddressSection from '../../../../components/modals/locationSettings/HomeAddressSection';
import { useLocationSettingsModal } from '../hooks/useLocationSettingsModal';
import HospitalListSection from './HospitalListSection';
import MartListSection from './MartListSection';
import PharmacyListSection from './PharmacyListSection';

/**
 * 위치 설정 모달 메인 컴포넌트
 * GPS 설정, 집 주소 설정, 병원/마트/약국 관리를 통합
 */
const LocationSettingsModalFeature = ({
    showLocationSettings,
    setShowLocationSettings,
    locationInfo,
    setLocationInfo,
    currentGPSLocation,
    setCurrentGPSLocation,
    locationLoading,
    setLocationLoading,
    locationPermissionStatus,
    setLocationPermissionStatus,
    editingLocationType,
    setEditingLocationType,
    tempLocation,
    setTempLocation,
    placeSearchKeyword,
    setPlaceSearchKeyword,
    placeSearchResults,
    setPlaceSearchResults,
    placeSearchLoading,
    setPlaceSearchLoading,
    setChatHistory,
    language
}) => {
    // 모달 로직 훅 사용
    const {
        handleSearch,
        handleSelect,
        handleSave,
        handleCancel
    } = useLocationSettingsModal({
        placeSearchKeyword,
        setPlaceSearchKeyword,
        placeSearchResults,
        setPlaceSearchResults,
        placeSearchLoading,
        setPlaceSearchLoading,
        editingLocationType,
        setEditingLocationType,
        tempLocation,
        setTempLocation,
        locationInfo,
        setLocationInfo,
        setShowLocationSettings,
        setChatHistory,
        language
    });

    if (!showLocationSettings) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setShowLocationSettings(false)}
        >
            <div
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-slate-900">{t('locationSettings', language)}</h2>
                    <button
                        onClick={() => setShowLocationSettings(false)}
                        className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* GPS 위치 권한 설정 */}
                    <GPSSettingsSection
                        locationLoading={locationLoading}
                        setLocationLoading={setLocationLoading}
                        currentGPSLocation={currentGPSLocation}
                        setCurrentGPSLocation={setCurrentGPSLocation}
                        locationPermissionStatus={locationPermissionStatus}
                        setLocationPermissionStatus={setLocationPermissionStatus}
                        locationInfo={locationInfo}
                        setLocationInfo={setLocationInfo}
                    />

                    {/* 집 주소 설정 */}
                    <HomeAddressSection
                        editingLocationType={editingLocationType}
                        setEditingLocationType={setEditingLocationType}
                        tempLocation={tempLocation}
                        setTempLocation={setTempLocation}
                        locationInfo={locationInfo}
                        placeSearchKeyword={placeSearchKeyword}
                        setPlaceSearchKeyword={setPlaceSearchKeyword}
                        placeSearchResults={placeSearchResults}
                        setPlaceSearchResults={setPlaceSearchResults}
                        placeSearchLoading={placeSearchLoading}
                        setPlaceSearchLoading={setPlaceSearchLoading}
                        setLocationInfo={setLocationInfo}
                        setShowLocationSettings={setShowLocationSettings}
                        setChatHistory={setChatHistory}
                        language={language}
                    />

                    {/* 여러 병원/마트/약국 관리 섹션 */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border-2 border-purple-200">
                        <h3 className="text-xl font-black text-purple-900 mb-4">위치 정보 설정</h3>
                        <HospitalListSection
                            locationInfo={locationInfo}
                            setLocationInfo={setLocationInfo}
                            editingLocationType={editingLocationType}
                            setEditingLocationType={setEditingLocationType}
                            tempLocation={tempLocation}
                            setTempLocation={setTempLocation}
                            placeSearchKeyword={placeSearchKeyword}
                            setPlaceSearchKeyword={setPlaceSearchKeyword}
                            placeSearchResults={placeSearchResults}
                            setPlaceSearchResults={setPlaceSearchResults}
                            placeSearchLoading={placeSearchLoading}
                            setPlaceSearchLoading={setPlaceSearchLoading}
                            handleSearch={handleSearch}
                            handleSelect={handleSelect}
                            handleSave={handleSave}
                            handleCancel={handleCancel}
                            language={language}
                        />
                        <MartListSection
                            locationInfo={locationInfo}
                            setLocationInfo={setLocationInfo}
                            editingLocationType={editingLocationType}
                            setEditingLocationType={setEditingLocationType}
                            tempLocation={tempLocation}
                            setTempLocation={setTempLocation}
                            placeSearchKeyword={placeSearchKeyword}
                            setPlaceSearchKeyword={setPlaceSearchKeyword}
                            placeSearchResults={placeSearchResults}
                            setPlaceSearchResults={setPlaceSearchResults}
                            placeSearchLoading={placeSearchLoading}
                            setPlaceSearchLoading={setPlaceSearchLoading}
                            handleSearch={handleSearch}
                            handleSelect={handleSelect}
                            handleSave={handleSave}
                            handleCancel={handleCancel}
                            language={language}
                        />
                        <PharmacyListSection
                            locationInfo={locationInfo}
                            setLocationInfo={setLocationInfo}
                            editingLocationType={editingLocationType}
                            setEditingLocationType={setEditingLocationType}
                            tempLocation={tempLocation}
                            setTempLocation={setTempLocation}
                            placeSearchKeyword={placeSearchKeyword}
                            setPlaceSearchKeyword={setPlaceSearchKeyword}
                            placeSearchResults={placeSearchResults}
                            setPlaceSearchResults={setPlaceSearchResults}
                            placeSearchLoading={placeSearchLoading}
                            setPlaceSearchLoading={setPlaceSearchLoading}
                            handleSearch={handleSearch}
                            handleSelect={handleSelect}
                            handleSave={handleSave}
                            handleCancel={handleCancel}
                            language={language}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LocationSettingsModalFeature;
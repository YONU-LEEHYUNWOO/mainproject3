import React from 'react';
import { Home, ShoppingBag, Activity, MapPin, Navigation2 } from 'lucide-react';

/**
 * 목적지 정보를 표시하는 상단 카드 컴포넌트
 */
const LocationDestinationCard = ({ destination, destinationType, locationInfo }) => {
    // 목적지 타입별 UI 설정
    const getDestInfo = () => {
        switch (destinationType) {
            case 'home':
                return {
                    icon: <Home size={40} className="text-pastel-purple" />,
                    bgColor: 'from-pastel-purple/20 to-pastel-pink/20',
                    borderColor: 'border-pastel-purple/30',
                    textColor: 'text-pastel-purple',
                    textColorStrong: 'text-slate-800',
                    textColorLight: 'text-slate-500',
                    lightBg: 'bg-pastel-purple/5',
                    lightBorder: 'border-pastel-purple/10',
                    iconColor: 'text-pastel-purple'
                };
            case 'mart':
                return {
                    icon: <ShoppingBag size={40} className="text-blue-600" />,
                    bgColor: 'from-blue-50 to-blue-100',
                    borderColor: 'border-blue-200',
                    textColor: 'text-blue-700',
                    textColorStrong: 'text-blue-900',
                    textColorLight: 'text-blue-600',
                    lightBg: 'bg-blue-50',
                    lightBorder: 'border-blue-100',
                    iconColor: 'text-blue-500'
                };
            default:
                return {
                    icon: <MapPin size={40} className="text-slate-600" />,
                    bgColor: 'from-slate-50 to-slate-100',
                    borderColor: 'border-slate-200',
                    textColor: 'text-slate-700',
                    textColorStrong: 'text-slate-900',
                    textColorLight: 'text-slate-600',
                    lightBg: 'bg-slate-50',
                    lightBorder: 'border-slate-100',
                    iconColor: 'text-slate-500'
                };
        }
    };

    const destInfo = getDestInfo();

    // 상세 주소 결정 로직
    const getDisplayAddress = () => {
        if (destinationType === 'home' && locationInfo?.home?.address) {
            return locationInfo.home.address;
        }
        
        const findAddress = (list, frequent) => {
            if (frequent?.address && (destination.includes(frequent.address) || frequent.address.includes(destination))) {
                return frequent.name ? `${frequent.name} (${frequent.address})` : frequent.address;
            }
            const matched = (list || []).find(m => 
                m.address === destination || destination.includes(m.address) || m.address.includes(destination)
            );
            if (matched) return matched.name ? `${matched.name} (${matched.address})` : matched.address;
            return null;
        };

        if (destinationType === 'mart') {
            return findAddress(locationInfo?.marts, locationInfo?.frequentPlaces?.mart) || destination;
        }
        if (destinationType === 'pharmacy') {
            return findAddress(locationInfo?.pharmacies, locationInfo?.frequentPlaces?.pharmacy) || destination;
        }
        if (destinationType === 'hospital') {
            return findAddress(locationInfo?.hospitals, locationInfo?.frequentPlaces?.hospital) || destination;
        }
        
        return destination;
    };

    return (
        <div className={`bg-gradient-to-br ${destInfo.bgColor} rounded-3xl p-6 border-2 ${destInfo.borderColor}`}>
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-white/70 flex items-center justify-center shadow-lg ${destInfo.lightBg}`}>
                    {destInfo.icon}
                </div>
                <div>
                    <h4 className={`font-black ${destInfo.textColor} text-2xl`}>
                        {getDisplayAddress()}
                    </h4>
                    <p className="text-lg text-slate-600 font-bold mt-1">목적지</p>
                    {destinationType === 'home' && locationInfo?.home?.details && (
                        <p className="text-base text-slate-500 font-bold mt-1">{locationInfo.home.details}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationDestinationCard;

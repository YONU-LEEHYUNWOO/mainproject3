import React from 'react';
import { Clock, MapPin, AlertCircle } from 'lucide-react';

/**
 * 병원 목적지 및 예약 정보 카드
 */
const HospitalDestinationCard = ({ task, visitType }) => {
    const getTypeLabel = () => {
        switch (visitType) {
            case 'firstVisit': return '초진 (첫 방문)';
            case 'followUp': return '재진 (정기 방문)';
            case 'healthCheck': return '건강검진';
            case 'emergency': return '응급 진료';
            case 'surgery': return '수술/시술';
            default: return '일반 진료';
        }
    };

    return (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border-2 border-red-100 shadow-sm">
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-md">
                    <span className="text-3xl">🏥</span>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-lg text-xs font-black">
                            {getTypeLabel()}
                        </span>
                        <h4 className="text-xl font-black text-slate-800">{task?.location || '병원'}</h4>
                    </div>
                    <div className="space-y-1">
                        <p className="flex items-center gap-1.5 text-slate-600 font-bold">
                            <Clock size={16} />
                            예약 시간: {task?.time}
                        </p>
                        {task?.title && (
                            <p className="flex items-center gap-1.5 text-slate-500 text-sm font-bold">
                                <AlertCircle size={14} />
                                {task.title}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HospitalDestinationCard;

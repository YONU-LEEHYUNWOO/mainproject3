import React from 'react';
import { CheckSquare, Square, Package } from 'lucide-react';
import { getRequirementsByType } from '../utils/visitTypeUtils';

/**
 * 방문 유형별 준비물 체크리스트 컴포넌트
 */
const HospitalRequirements = ({ visitType, language, checkedRequirements, setCheckedRequirements }) => {
    const requirements = getRequirementsByType(visitType, language);

    const toggleCheck = (id) => {
        setCheckedRequirements(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-pastel-orange/20 rounded-xl flex items-center justify-center">
                    <Package size={24} className="text-orange-600" />
                </div>
                <h3 className="text-lg font-black text-slate-800">방문 전 준비물 확인</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
                {requirements.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                            checkedRequirements[item.id]
                                ? 'bg-green-50 border-green-200 shadow-inner'
                                : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                        }`}
                    >
                        {checkedRequirements[item.id] ? (
                            <CheckSquare size={24} className="text-green-600 shrink-0" />
                        ) : (
                            <Square size={24} className="text-slate-300 shrink-0" />
                        )}
                        <div>
                            <p className={`font-black ${checkedRequirements[item.id] ? 'text-green-800 line-through' : 'text-slate-800'}`}>
                                {item.label}
                            </p>
                            <p className="text-xs text-slate-500 font-bold mt-0.5">{item.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HospitalRequirements;

import React from 'react';
import { Home, MapPin, PlusSquare, ShoppingBag } from 'lucide-react';
import { t } from '../../../i18n';

/**
 * 목적지 선택 컴포넌트 (기존 기능 완전 복구)
 * 집으로, 병원, 약국, 마트, 기타 장소
 */
const LocationDestinationSelection = ({ 
    language, 
    setChatHistory, 
    locationInfo, 
    currentGPSLocation,
    confirmedTasks 
}) => {
    
    // 데이터 추출 (다양한 경로 확인)
    const allMarts = [
        ...(locationInfo?.marts || []),
        ...(locationInfo?.frequentPlaces?.mart ? [locationInfo.frequentPlaces.mart] : [])
    ].filter((v, i, a) => v.address && a.findIndex(t => t.address === v.address) === i); // 중복 제거

    const allPharmacies = [
        ...(locationInfo?.pharmacies || []),
        ...(locationInfo?.frequentPlaces?.pharmacy ? [locationInfo.frequentPlaces.pharmacy] : [])
    ].filter((v, i, a) => v.address && a.findIndex(t => t.address === v.address) === i); // 중복 제거
    
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const hospitalTasks = (confirmedTasks || []).filter(task => 
        task.category === 'hospital' && task.date === todayStr
    );
    const frequentHospital = locationInfo?.frequentPlaces?.hospital;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {/* 1. 집으로 가기 */}
                <button
                    onClick={() => {
                        const homeAddress = locationInfo?.home?.address;
                        const userMsg = { role: 'user', content: t('goHome', language) || '집으로 가기', timestamp: Date.now() };
                        let assistantMsg;

                        if (homeAddress) {
                            assistantMsg = {
                                role: 'assistant',
                                type: 'locationGuidance',
                                content: '집으로 가는 길을 안내해드릴게요.',
                                destination: homeAddress,
                                destinationType: 'home',
                                timestamp: Date.now()
                            };
                        } else {
                            assistantMsg = {
                                role: 'assistant',
                                content: '등록된 집 주소가 없습니다. 설정에서 주소를 등록해주세요.',
                                timestamp: Date.now()
                            };
                        }
                        setChatHistory(prev => [...prev, userMsg, assistantMsg]);
                    }}
                    className="flex flex-col items-center justify-center gap-3 px-6 py-8 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-3xl font-black text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[120px]"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center shadow-lg">
                        <Home size={32} className="text-white" />
                    </div>
                    <span className="text-purple-800">{t('goHome', language) || '집으로'}</span>
                </button>

                {/* 2. 병원 가기 */}
                <button
                    onClick={() => {
                        const userMsg = { role: 'user', content: t('goHospital', language), timestamp: Date.now() };
                        let assistantMsg;

                        if (hospitalTasks.length > 0) {
                            const task = hospitalTasks[0];
                            assistantMsg = {
                                role: 'assistant',
                                type: 'hospitalTransport',
                                content: `${task.time}까지 ${task.location || '병원'}에 도착하시려면 이동 준비가 필요합니다.`,
                                task: task,
                                timestamp: Date.now()
                            };
                        } else if (frequentHospital) {
                            assistantMsg = {
                                role: 'assistant',
                                type: 'locationGuidance',
                                content: `${frequentHospital.name || frequentHospital.address}으로 가는 길을 안내해드릴게요.`,
                                destination: frequentHospital.address,
                                destinationType: 'hospital',
                                timestamp: Date.now()
                            };
                        } else {
                            assistantMsg = {
                                role: 'assistant',
                                content: '등록된 병원 정보가 없습니다. 설정에서 병원을 등록해주세요.',
                                timestamp: Date.now()
                            };
                        }
                        setChatHistory(prev => [...prev, userMsg, assistantMsg]);
                    }}
                    className="flex flex-col items-center justify-center gap-3 px-6 py-8 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-3xl font-black text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[120px]"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-lg">
                        <span className="text-3xl">🏥</span>
                    </div>
                    <span className="text-red-800">{t('goHospital', language)}</span>
                </button>

                {/* 3. 약국 가기 (자주 가는 약국 목록) */}
                <button
                    onClick={() => {
                        const userMsg = { role: 'user', content: '약국 가기', timestamp: Date.now() };
                        let assistantMsg;
                        
                        if (allPharmacies.length === 0) {
                            assistantMsg = {
                                role: 'assistant',
                                content: '등록된 약국 정보가 없습니다. 설정에서 약국을 등록해주세요.',
                                timestamp: Date.now()
                            };
                        } else if (allPharmacies.length === 1) {
                            const p = allPharmacies[0];
                            assistantMsg = {
                                role: 'assistant',
                                type: 'locationGuidance',
                                content: `${p.name || p.address}으로 가는 길을 안내해드릴게요.`,
                                destination: p.address,
                                destinationType: 'pharmacy',
                                timestamp: Date.now()
                            };
                        } else {
                            assistantMsg = {
                                role: 'assistant',
                                type: 'pharmacySelection',
                                content: '어느 약국으로 가시겠어요?',
                                items: allPharmacies,
                                timestamp: Date.now()
                            };
                        }
                        setChatHistory(prev => [...prev, userMsg, assistantMsg]);
                    }}
                    className="flex flex-col items-center justify-center gap-3 px-6 py-8 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-3xl font-black text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[120px]"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg">
                        <PlusSquare size={32} className="text-white" />
                    </div>
                    <span className="text-green-800">약국</span>
                </button>

                {/* 4. 마트 가기 (자주 가는 마트 목록) */}
                <button
                    onClick={() => {
                        const userMsg = { role: 'user', content: '마트 가기', timestamp: Date.now() };
                        let assistantMsg;

                        if (allMarts.length === 0) {
                            assistantMsg = {
                                role: 'assistant',
                                content: '등록된 마트 정보가 없습니다. 설정에서 마트를 등록해주세요.',
                                timestamp: Date.now()
                            };
                        } else if (allMarts.length === 1) {
                            const m = allMarts[0];
                            assistantMsg = {
                                role: 'assistant',
                                type: 'locationGuidance',
                                content: `${m.name || m.address}으로 가는 길을 안내해드릴게요.`,
                                destination: m.address,
                                destinationType: 'mart',
                                timestamp: Date.now()
                            };
                        } else {
                            assistantMsg = {
                                role: 'assistant',
                                type: 'martSelection',
                                content: '어느 마트로 가시겠어요?',
                                items: allMarts,
                                timestamp: Date.now()
                            };
                        }
                        setChatHistory(prev => [...prev, userMsg, assistantMsg]);
                    }}
                    className="flex flex-col items-center justify-center gap-3 px-6 py-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-3xl font-black text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[120px]"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center shadow-lg">
                        <ShoppingBag size={32} className="text-white" />
                    </div>
                    <span className="text-blue-800">마트</span>
                </button>

                {/* 5. 기타 장소 (텍스트/음성 입력 유도) */}
                <button
                    onClick={() => {
                        setChatHistory(prev => [...prev, {
                            role: 'assistant',
                            type: 'placeSearchPrompt',
                            content: `어떤 장소로 가시겠어요? 장소 이름을 채팅이나 음성으로 말씀해주세요. ${currentGPSLocation ? '(현재 위치 기준으로 검색합니다)' : ''}`,
                            timestamp: Date.now()
                        }]);
                    }}
                    className="flex flex-col items-center justify-center gap-3 px-6 py-8 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-3xl font-black text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[120px] col-span-2"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center shadow-lg">
                        <MapPin size={32} className="text-white" />
                    </div>
                    <span className="text-slate-800">기타 장소</span>
                </button>
            </div>
        </div>
    );
};

export default LocationDestinationSelection;

import React from 'react';
import { Mic, Lightbulb, MapPin, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import HospitalTransport from '../../../components/HospitalTransport';
import HospitalArrival from '../../../components/HospitalArrival';
import ShoppingRecommendation from '../../../components/ShoppingRecommendation';
import MealRecommendation from '../../../components/MealRecommendation';
import GeneralLocationGuidance from '../../../components/GeneralLocationGuidance';
import { t } from '../../../i18n';
import { speakText } from '../../../utils/ttsUtils';
import { getMessageTextForTTS } from '../../../utils/formatUtils';
import { formatCompletedTime } from '../../../utils/dateFormat';

import LocationDestinationSelection from '../../location/components/LocationDestinationSelection';

/**
 * AI 비서 메시지 렌더링 컴포넌트
 */
const AssistantMessage = ({
    msg,
    language,
    ttsEnabled,
    speechSynthesisRef,
    // 핸들러/상태들
    confirmProposal,
    selectedTaskId,
    confirmedTasks,
    setConfirmedTasks,
    setSelectedTaskId,
    setChatHistory,
    locationInfo,
    currentGPSLocation,
    handleYesNoResponse,
    isTaskCompleted,
    completeTask,
    currentHospitalTask,
    hospitalArrivalState,
    setHospitalArrivalState,
    restMode,
    currentShoppingCart,
    // 누락된 위치 관련 핸들러 추가
    onCallTaxi,
    onPublicTransport,
    onArrival,
    onMovementStart
}) => {

    /**
     * 타입별 렌더러들
     */

    // 1. 행동 패턴 (behaviorPattern)
    const renderBehaviorPattern = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl">📋</span>
                    </div>
                    <div>
                        <p className="font-black text-slate-800" style={{ fontSize: 'var(--font-size-lg)' }}>행동 순서 안내</p>
                        <p className="text-slate-500" style={{ fontSize: 'var(--font-size-base)' }}>보호자로부터 행동 패턴이 전달되었습니다</p>
                    </div>
                </div>
                <button
                    onClick={() => speakText(getMessageTextForTTS(msg), language, ttsEnabled, speechSynthesisRef)}
                    className="rounded-xl bg-blue-500/20 hover:bg-blue-500/30 transition-colors shadow-sm flex items-center justify-center"
                    style={{ width: 'var(--button-size-medium)', height: 'var(--button-size-medium)' }}
                >
                    <Mic size={20} className="text-blue-600" />
                </button>
            </div>
            <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-lg">
                <ol className="space-y-4">
                    {msg.behaviorPattern?.steps?.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white flex items-center justify-center font-black">
                                {stepIdx + 1}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-800" style={{ fontSize: 'var(--font-size-lg)' }}>{step.action}</p>
                                {step.details && <p className="text-slate-600 mt-1" style={{ fontSize: 'var(--font-size-base)' }}>{step.details}</p>}
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
            {msg.behaviorPattern?.note && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                    <p className="text-amber-800 font-bold flex items-center gap-2" style={{ fontSize: 'var(--font-size-base)' }}>
                        <AlertTriangle size={18} />
                        {msg.behaviorPattern.note}
                    </p>
                </div>
            )}
            {!msg.confirmed && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => {
                            setChatHistory(prev => prev.map((m) =>
                                m === msg ? { ...m, confirmed: true } : m
                            ));

                            const confirmMsg = language === 'ko'
                                ? '네, 확인했습니다! 행동 순서를 참고해주세요.'
                                : language === 'en'
                                    ? 'Got it! Please refer to the action steps.'
                                    : 'はい、確認しました！行動順序를 참고してください。';

                            setChatHistory(prev => [...prev, {
                                role: 'assistant',
                                content: confirmMsg,
                                timestamp: Date.now()
                            }]);

                            if (ttsEnabled) speakText(confirmMsg, language, ttsEnabled, speechSynthesisRef);
                        }}
                        className="w-full px-8 py-6 bg-warmOrange text-white rounded-3xl font-black shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                        style={{ fontSize: 'var(--font-size-2xl)', minHeight: 'var(--button-size-xlarge)' }}
                    >
                        확인했습니다
                    </button>
                </div>
            )}
        </div>
    );

    // 2. 일정 제안 (proposal)
    const renderProposal = () => (
        <div className="space-y-5">
            <div className="font-black flex items-center gap-3 text-indigo-700" style={{ fontSize: 'var(--font-size-xl)' }}>
                <Lightbulb size={24} />
                <span>{msg.proposal.question}</span>
            </div>
            {msg.proposal.type !== 'delete' && (
                <div className="bg-white/70 p-4 rounded-2xl border-2 border-indigo-200 text-base space-y-2">
                    <p className="font-bold">📅 {msg.proposal.data.date} {msg.proposal.data.time}</p>
                    {msg.proposal.data.location && <p className="font-bold">📍 {msg.proposal.data.location}</p>}
                </div>
            )}
            <div className="flex gap-4">
                <button
                    onClick={() => confirmProposal(msg.proposal, selectedTaskId, confirmedTasks, setConfirmedTasks, setSelectedTaskId, setChatHistory, locationInfo, currentGPSLocation, language)}
                    className={`flex-1 px-8 py-5 ${msg.proposal.type === 'delete' ? 'bg-red-500' : 'bg-gradient-to-r from-pastel-purple to-pastel-pink'} text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[60px]`}
                >
                    {t('confirm', language)}
                </button>
                <button
                    onClick={() => handleYesNoResponse('no')}
                    className="flex-1 px-8 py-5 bg-slate-200 text-slate-700 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[60px]"
                >
                    {t('cancel', language)}
                </button>
            </div>
        </div>
    );

    // 3. 일정 목록 (schedule)
    const renderSchedule = () => (
        <div className="space-y-4">
            <p className="font-black text-slate-800" style={{ fontSize: 'var(--font-size-lg)' }}>{msg.content}</p>
            {msg.schedules && msg.schedules.length > 0 ? (
                <div className="space-y-3">
                    {msg.schedules.map((task, taskIdx) => {
                        const taskCompleted = isTaskCompleted(task);
                        return (
                            <div
                                key={taskIdx}
                                className={`p-5 rounded-2xl border-2 shadow-md transition-all ${taskCompleted
                                    ? 'bg-green-50 border-green-300 opacity-70'
                                    : 'bg-blue-50 border-blue-300 hover:shadow-lg'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-2xl">{task.category === 'hospital' ? '🏥' : task.category === 'meal' ? '🍽️' : task.category === 'shopping' ? '🛒' : task.category === 'medicine' ? '💊' : '📝'}</span>
                                            <h3 className={`font-black ${taskCompleted ? 'line-through text-green-700' : 'text-blue-800'}`} style={{ fontSize: 'var(--font-size-lg)' }}>
                                                {task.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-600 font-bold mb-1">{task.date} {task.time}</p>
                                        {task.location && (
                                            <p className="text-sm text-slate-600 flex items-center gap-1 mb-1">
                                                <MapPin size={14} />
                                                {task.location}
                                            </p>
                                        )}
                                        {taskCompleted && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <CheckCircle2 size={16} className="text-green-600" />
                                                <span className="text-xs text-green-700 font-bold">
                                                    {formatCompletedTime(task.completedAt)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {!taskCompleted && (
                                        <button
                                            onClick={() => completeTask(task.id, confirmedTasks, setConfirmedTasks, setChatHistory, language)}
                                            className="shrink-0 px-4 py-2 bg-green-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-green-600 hover:shadow-lg transition-all"
                                        >
                                            {t('complete', language)}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>등록된 일정이 없습니다.</p>
            )}
        </div>
    );

    // 4. 질문 (question)
    const renderQuestion = () => (
        <div className="space-y-4">
            <p className="font-black text-slate-800" style={{ fontSize: 'var(--font-size-lg)' }}>{msg.content}</p>
            <div className="flex gap-4">
                <button
                    onClick={() => handleYesNoResponse('yes')}
                    className="flex-1 px-8 py-5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[60px]"
                >
                    {t('yes', language)}
                </button>
                <button
                    onClick={() => handleYesNoResponse('no')}
                    className="flex-1 px-8 py-5 bg-slate-200 text-slate-700 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 min-h-[60px]"
                >
                    {t('no', language)}
                </button>
            </div>
        </div>
    );

    // 5. 긴급 (emergency)
    const renderEmergency = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emergencyRed rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                    <AlertCircle size={28} className="text-white" />
                </div>
                <div>
                    <h3 className="font-black text-emergencyRed" style={{ fontSize: 'var(--font-size-xl)' }}>긴급 상황</h3>
                    <p className="text-slate-500" style={{ fontSize: 'var(--font-size-base)' }}>즉시 조치가 필요합니다</p>
                </div>
            </div>
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5">
                <p className="text-slate-800 font-bold mb-4" style={{ fontSize: 'var(--font-size-lg)' }}>{msg.content}</p>
                {msg.actions && msg.actions.length > 0 && (
                    <div className="space-y-2">
                        {msg.actions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={action.handler}
                                className="w-full px-6 py-4 bg-emergencyRed text-white rounded-2xl font-black shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                                style={{ fontSize: 'var(--font-size-lg)' }}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // 6. 휴식 모드 (restMode)
    const renderRestMode = () => (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl">🌙</span>
                </div>
                <div>
                    <h3 className="font-black text-slate-800" style={{ fontSize: 'var(--font-size-xl)' }}>휴식 모드</h3>
                    <p className="text-slate-500" style={{ fontSize: 'var(--font-size-base)' }}>편안한 휴식을 취하세요</p>
                </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-5">
                <p className="text-slate-800 font-bold mb-3" style={{ fontSize: 'var(--font-size-lg)' }}>{msg.content}</p>
                {restMode && (
                    <p className="text-slate-600 font-bold" style={{ fontSize: 'var(--font-size-base)' }}>
                        현재 휴식 모드가 활성화되어 있습니다. 필요한 경우 언제든 말씀해주세요.
                    </p>
                )}
            </div>
        </div>
    );

    // 7. 알림 (notification)
    const renderNotification = () => (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <AlertCircle size={20} className="text-white" />
                </div>
                <p className="flex-1 text-slate-800 font-bold" style={{ fontSize: 'var(--font-size-lg)' }}>{msg.content}</p>
            </div>
        </div>
    );

    // 8. 쇼핑 추천 (shopping)
    const renderShopping = () => (
        <ShoppingRecommendation
            language={language}
            setChatHistory={setChatHistory}
            currentShoppingCart={currentShoppingCart}
        />
    );

    // 9. 식사 추천 (meal)
    const renderMeal = () => (
        <MealRecommendation
            language={language}
            setChatHistory={setChatHistory}
        />
    );

    // 10. 위치 안내 (locationGuidance / destinationSelection 등)
    const renderLocationRelated = () => {
        if (msg.type === 'hospitalTransport') {
            return <HospitalTransport task={msg.task} locationInfo={locationInfo} currentGPSLocation={currentGPSLocation} language={language} />;
        }
        if (msg.type === 'hospitalArrival') {
            return <HospitalArrival task={currentHospitalTask} arrivalState={hospitalArrivalState} setArrivalState={setHospitalArrivalState} language={language} />;
        }
        
        // 목적지 카테고리 선택 (마트, 약국, 병원 버튼들)
        if (msg.type === 'destinationSelection') {
            return (
                <LocationDestinationSelection 
                    language={language}
                    setChatHistory={setChatHistory}
                    locationInfo={locationInfo}
                    currentGPSLocation={currentGPSLocation}
                />
            );
        }

        // 특정 항목 선택 (병원이 여러 개일 때 등)
        if (msg.type === 'hospitalSelection' || msg.type === 'pharmacySelection' || msg.type === 'martSelection') {
            const items = msg.hospitals || msg.pharmacies || msg.marts || msg.items || [];
            return (
                <div className="space-y-4">
                    <p className="font-black text-slate-800" style={{ fontSize: 'var(--font-size-lg)' }}>{msg.content}</p>
                    <div className="grid grid-cols-1 gap-3">
                        {items.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setChatHistory(prev => [...prev, {
                                        role: 'user',
                                        content: item.name || item.address,
                                        timestamp: Date.now()
                                    }, {
                                        role: 'assistant',
                                        type: 'locationGuidance',
                                        content: `${item.name || item.address}으로 가는 길을 안내해드릴게요.`,
                                        destination: item.address,
                                        destinationType: msg.type.replace('Selection', ''),
                                        timestamp: Date.now()
                                    }]);
                                }}
                                className="w-full p-5 bg-white border-2 border-blue-200 rounded-2xl font-black text-blue-800 hover:bg-blue-50 shadow-md transition-all text-left flex items-center gap-3"
                            >
                                <MapPin size={20} />
                                <span>{item.name || item.address}</span>
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
        
        // 최종적으로 목적지가 확정된 경우에만 길 안내 본체 표시
        return (
            <GeneralLocationGuidance 
                destination={msg.destination || msg.content} 
                destinationType={msg.destinationType}
                destinationPlace={msg.destinationPlace}
                language={language} 
                locationInfo={locationInfo}
                currentGPSLocation={currentGPSLocation} 
                setChatHistory={setChatHistory} 
                confirmedTasks={confirmedTasks}
                onCallTaxi={onCallTaxi}
                onPublicTransport={onPublicTransport}
                onArrival={onArrival}
                onMovementStart={onMovementStart}
            />
        );
    };

    /**
     * 최종 렌더링 분기
     */
    const renderContent = () => {
        switch (msg.type) {
            case 'behaviorPattern': return renderBehaviorPattern();
            case 'proposal': return renderProposal();
            case 'schedule': return renderSchedule();
            case 'question': return renderQuestion();
            case 'emergency': return renderEmergency();
            case 'restMode': return renderRestMode();
            case 'notification': return renderNotification();
            case 'shopping': return renderShopping();
            case 'meal': return renderMeal();
            case 'hospitalTransport':
            case 'hospitalArrival':
            case 'destinationSelection':
            case 'hospitalSelection':
            case 'placeSearchPrompt':
            case 'locationGuidance':
                return renderLocationRelated();
            default:
                return (
                    <p className="text-slate-800 font-bold leading-relaxed whitespace-pre-wrap" style={{ fontSize: 'var(--font-size-lg)' }}>
                        {msg.content}
                    </p>
                );
        }
    };

    return (
        <div className="max-w-[85%] bg-white border-2 border-trustBlue/30 rounded-3xl rounded-tl-sm p-6 text-lg shadow-lg animate-slide-up relative">
            <button
                onClick={() => speakText(getMessageTextForTTS(msg), language, ttsEnabled, speechSynthesisRef)}
                className="absolute top-4 right-4 rounded-xl bg-trustBlue/20 hover:bg-trustBlue/30 transition-colors z-10 shadow-sm flex items-center justify-center"
                style={{ width: 'var(--button-size-medium)', height: 'var(--button-size-medium)' }}
                title="음성으로 듣기"
            >
                <Mic size={20} className="text-trustBlue" />
            </button>
            <div className="flex items-start gap-3 mb-2 pr-12">
                <span className="text-2xl">👦</span>
                <div className="flex-1">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AssistantMessage;

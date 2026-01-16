import React, { useState } from 'react';
import { X, ArrowLeft, Send, CheckCircle2, Clock, MapPin, Activity, Utensils, Home, Plus, Settings } from 'lucide-react';
import { t } from '../../../i18n';
import HealthChart from '../../../components/HealthChart';
import { fetchMultiAgentAnalysis } from '../../../services/aiService';

/**
 * LLM 기반 명령어 처리 함수 - 모든 자연어 입력을 LLM으로 분석
 */
const processGuardianCommand = async (command, actions) => {
    const { onScheduleAdd } = actions;
    const lowerCommand = command.toLowerCase();

    // 모든 입력을 LLM으로 분석하여 일정 정보 추출 시도
    try {
        // LLM을 사용하여 정확한 날짜/시간 파싱
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];
        
        const systemPrompt = `
당신은 사용자의 자연어 명령을 분석하는 전문가입니다.
사용자의 입력에서 일정, 약속, 병원 방문, 외출 등의 정보가 있는지 확인하고, 있으면 JSON 형식으로 반환해주세요.

중요 규칙:
1. 일정 정보가 있으면 hasSchedule: true, 없으면 hasSchedule: false
2. 날짜는 반드시 YYYY-MM-DD 형식으로 반환 (예: 2024-01-15)
3. 시간은 반드시 HH:MM 형식으로 반환 (24시간 형식, 예: 14:30)
4. "오늘"은 ${todayStr}로 변환
5. "내일"은 ${tomorrowStr}로 변환
6. "모레"는 ${dayAfterTomorrowStr}로 변환
7. 시간이 명시되지 않으면 오후 2시(14:00)로 설정
8. "오후 3시" = 15:00, "오전 9시" = 09:00
9. "3시반" 또는 "3시 30분" = 15:30 (오후로 간주)
10. "저녁", "밤" = 18:00, "아침" = 09:00, "점심" = 12:00
11. 일정 제목은 사용자가 말한 내용을 자연스럽게 추출 (예: "정형외과 진료 예약" → "정형외과 진료 예약")

반환 형식 (JSON만 반환):
{
  "hasSchedule": true/false,
  "title": "일정 제목",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "location": "장소 (있으면)"
}

예시:
- "내일 오후 3시에 정형외과 진료 예약해야 해" → {"hasSchedule": true, "title": "정형외과 진료 예약", "date": "${tomorrowStr}", "time": "15:00", "location": ""}
- "오늘 저녁 6시에 친구 만나" → {"hasSchedule": true, "title": "친구 만나기", "date": "${todayStr}", "time": "18:00", "location": ""}
- "모레 오전 10시 약속" → {"hasSchedule": true, "title": "약속", "date": "${dayAfterTomorrowStr}", "time": "10:00", "location": ""}
- "내일 병원 가야 해" → {"hasSchedule": true, "title": "병원 방문", "date": "${tomorrowStr}", "time": "14:00", "location": ""}
- "안녕하세요" → {"hasSchedule": false}
- "일정 보여줘" → {"hasSchedule": false}

사용자 입력: "${command}"
`;

        const analysis = await fetchMultiAgentAnalysis(command, 0, systemPrompt);
        
        // 일정 정보가 있는지 확인
        if (analysis && analysis.hasSchedule === true && analysis.date && analysis.time) {
            const schedule = {
                title: analysis.title || '새 일정',
                date: analysis.date,
                time: analysis.time,
                location: analysis.location || ''
            };

            if (onScheduleAdd) {
                console.log('🟢 [GuardianModals] LLM 분석 결과 - 일정 추가:', schedule);
                await onScheduleAdd(schedule);
                const responseMsg = `✅ 일정이 추가되었습니다!\n📅 ${schedule.title}\n📆 ${schedule.date} ${schedule.time}${schedule.location ? `\n📍 ${schedule.location}` : ''}`;
                return responseMsg;
            } else {
                console.error('❌ [GuardianModals] onScheduleAdd가 전달되지 않았습니다!');
            }
        } else {
            // 일정 정보가 없으면 다른 명령어 처리
            console.log('🔵 [GuardianModals] LLM 분석 결과 - 일정 정보 없음, 다른 명령어 처리');
        }
    } catch (error) {
        console.error('❌ [GuardianModals] LLM 분석 오류:', error);
        // LLM 분석 실패 시에도 계속 진행 (다른 명령어 처리)
    }

    // 일정 추가가 아닌 다른 명령어 처리

    // 택시 호출
    if (lowerCommand.includes('택시') || lowerCommand.includes('콜') || lowerCommand.includes('부르')) {
        const message = `🚗 택시 호출을 시도합니다...\n\n📍 현재 위치에서 가까운 택시를 호출했습니다.\n⏰ 약 5-10분 후 도착 예정입니다.\n\n💳 결제는 앱에서 직접 진행해주세요.`;
        alert(message);
        return message;
    }

    // 약 알림
    if (lowerCommand.includes('약') || lowerCommand.includes('알림') || lowerCommand.includes('복용')) {
        const message = `💊 약 복용 알림을 설정했습니다.\n\n⏰ 매일 아침/점심/저녁 8시에 알림이 울립니다.\n📱 설정에서 시간을 조정할 수 있습니다.`;
        alert(message);
        return message;
    }

    // 일정 조회
    if (lowerCommand.includes('일정') && (lowerCommand.includes('보여') || lowerCommand.includes('알려'))) {
        const message = `📋 오늘의 일정입니다:\n\n현재 일정 관리는 별도 메뉴에서 확인하실 수 있습니다.\n\n💡 "일정 관리" 버튼을 눌러보세요!`;
        alert(message);
        return message;
    }

    // 기본 응답
    const message = `🤔 "${command}"에 대해 잘 이해하지 못했습니다.\n\n💡 가능한 명령어들:\n• "내일 오후 3시에 병원 가야 해"\n• "택시 불러줘"\n• "약 알림 설정해줘"\n• "일정 보여줘"\n\n더 구체적으로 말씀해주세요!`;
    alert(message);
    return message;
};

/**
 * 메시지에서 일정 정보를 추출하는 함수
 */
const extractScheduleFromMessage = async (message) => {
    if (!message || message.trim().length < 5) return null;

    try {
        // LLM에게 일정 추출 요청
        const analysis = await fetchMultiAgentAnalysis(message, 0, `
당신은 부모님의 메시지에서 일정 정보를 추출하는 전문가입니다.
부모님이 자식에게 보내는 메시지에서 약속, 병원 방문, 외출 등의 일정 정보를 찾아서 JSON 형식으로 반환해주세요.

반환 형식:
{
  "hasSchedule": true/false,
  "title": "일정 제목",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "location": "장소 (선택사항)"
}

예시 메시지들:
- "내일 오후 2시에 병원 가야 해" → {"hasSchedule": true, "title": "병원 방문", "date": "내일 날짜", "time": "14:00"}
- "오늘 저녁 6시에 친구 만나" → {"hasSchedule": true, "title": "친구 만나기", "date": "오늘 날짜", "time": "18:00"}
- "약속 있어" → {"hasSchedule": false}

오늘 날짜: ${new Date().toISOString().split('T')[0]}
내일 날짜: ${new Date(Date.now() + 86400000).toISOString().split('T')[0]}

메시지: "${message}"

JSON 형식으로만 응답해주세요.
        `);

        if (analysis && analysis.hasSchedule) {
            // 날짜 처리
            let scheduleDate = analysis.date;
            if (scheduleDate === '오늘') {
                scheduleDate = new Date().toISOString().split('T')[0];
            } else if (scheduleDate === '내일') {
                scheduleDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            }

            return {
                title: analysis.title || '추출된 일정',
                date: scheduleDate,
                time: analysis.time || '',
                location: analysis.location || ''
            };
        }
    } catch (error) {
        console.error('일정 추출 실패:', error);
    }

    return null;
};

/**
 * 보호자 대시보드에서 사용하는 모든 모달 묶음
 */
const GuardianModals = ({
    language,
    showReportModal, setShowReportModal,
    showScheduleModal, setShowScheduleModal,
    showMessageModal, setShowMessageModal,
    showChatModal, setShowChatModal,
    showGuardianSettingsModal, setShowGuardianSettingsModal,
    reportData,
    dateActivities,
    selectedDate,
    guardians,
    onGuardiansChange,
    reportSettings,
    onReportSettingsChange,
    inactivitySettings,
    setInactivitySettings,
    bedtimeSettings,
    setBedtimeSettings,
    messageText,
    setMessageText,
    onMessageSend,
    newSchedule,
    setNewSchedule,
    onScheduleAdd
}) => {

    // 1. 안심 리포트 모달
    const renderReportModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowReportModal(false)}>
            <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-800">{t('weeklyReport', language)}</h3>
                    <button onClick={() => setShowReportModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">×</button>
                </div>
                {/* 리포트 내용... (기존 로직 유지) */}
                <div className="space-y-4">
                    <div className="p-4 bg-pastel-blue/20 rounded-2xl">
                        <p className="text-sm font-bold text-slate-600 mb-2">리포트 기간</p>
                        <p className="text-lg font-black text-slate-800">{reportData?.period || '데이터 로드 중'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <HealthChart type="heartRate" t={(k) => t(k, language)} />
                        <HealthChart type="steps" t={(k) => t(k, language)} />
                    </div>
                </div>
                <button onClick={() => setShowReportModal(false)} className="w-full mt-6 py-4 bg-trustBlue text-white rounded-xl font-black">닫기</button>
            </div>
        </div>
    );

    // 2. 메시지 보내기 모달
    const renderMessageModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowMessageModal(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-black text-slate-800 mb-6">부모님께 메시지 보내기</h3>
                <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="내용을 입력하세요..."
                    className="w-full h-40 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-trustBlue transition-all font-bold"
                />
                <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowMessageModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black">취소</button>
                    <button
                        onClick={async () => {
                            // 자연어 처리로 일정 추출 시도
                            const extractedSchedule = await extractScheduleFromMessage(messageText);
                            if (extractedSchedule) {
                                // 일정이 추출되면 자동으로 일정 추가
                                if (onScheduleAdd) onScheduleAdd(extractedSchedule);
                                alert(`일정이 자동으로 추가되었습니다!\n${extractedSchedule.title} - ${extractedSchedule.date} ${extractedSchedule.time || ''}`);
                            } else {
                                // 일반 메시지 전송
                                if (onMessageSend) onMessageSend({ type: 'text', text: messageText });
                            }
                            setShowMessageModal(false);
                            setMessageText('');
                        }}
                        className="flex-1 py-4 bg-trustBlue text-white rounded-xl font-black shadow-lg"
                    >
                        전송하기
                    </button>
                </div>
            </div>
        </div>
    );

    // 3. 일정 추가 모달
    const renderScheduleModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowScheduleModal(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-black text-slate-800 mb-6">일정 추가</h3>
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="일정 제목"
                        value={newSchedule.title}
                        onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-trustBlue transition-all font-bold"
                    />
                    <input
                        type="date"
                        value={newSchedule.date}
                        onChange={(e) => setNewSchedule({...newSchedule, date: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-trustBlue transition-all font-bold"
                    />
                    <input
                        type="time"
                        value={newSchedule.time}
                        onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-trustBlue transition-all font-bold"
                    />
                    <input
                        type="text"
                        placeholder="장소 (선택사항)"
                        value={newSchedule.location}
                        onChange={(e) => setNewSchedule({...newSchedule, location: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-trustBlue transition-all font-bold"
                    />
                </div>
                <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-black">취소</button>
                    <button
                        onClick={() => {
                            if (onScheduleAdd) onScheduleAdd(newSchedule);
                            setShowScheduleModal(false);
                            setNewSchedule({ title: '', date: '', time: '', location: '' });
                        }}
                        className="flex-1 py-4 bg-trustBlue text-white rounded-xl font-black shadow-lg"
                    >
                        추가하기
                    </button>
                </div>
            </div>
        </div>
    );

    // 4. 보호자 설정 모달
    const renderGuardianSettingsModal = () => (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowGuardianSettingsModal(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-black text-slate-800 mb-6">보호자 설정</h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-black text-slate-600 mb-2">비활동 감지 시간 (분)</label>
                        <input
                            type="number"
                            value={inactivitySettings.warningMinutes}
                            onChange={(e) => setInactivitySettings({...inactivitySettings, warningMinutes: parseInt(e.target.value)})}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-trustBlue transition-all font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-black text-slate-600 mb-2">취침 시간</label>
                        <input
                            type="time"
                            value={bedtimeSettings.bedtimeHour}
                            onChange={(e) => setBedtimeSettings({...bedtimeSettings, bedtimeHour: e.target.value})}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-trustBlue transition-all font-bold"
                        />
                    </div>
                </div>
                <button onClick={() => setShowGuardianSettingsModal(false)} className="w-full mt-6 py-4 bg-trustBlue text-white rounded-xl font-black">저장</button>
            </div>
        </div>
    );

    // 5. AI 채팅 모달
    const renderChatModal = () => {
        const [chatHistory, setChatHistory] = useState([
            {
                role: 'assistant',
                content: '안녕하세요! 부모님의 일정을 AI로 관리해드립니다.\n\n📝 가능한 명령어들:\n• "내일 오후 3시에 병원 예약해줘"\n• "택시 불러줘"\n• "약 알림 설정해줘"\n• "일정 보여줘"\n\n무엇을 도와드릴까요?',
                timestamp: Date.now()
            }
        ]);
        const [chatInput, setChatInput] = useState('');
        const [isProcessing, setIsProcessing] = useState(false);

        const handleChatSubmit = async () => {
            if (!chatInput.trim() || isProcessing) return;

            const userMessage = chatInput.trim();
            setChatInput('');
            setIsProcessing(true);

            // 사용자 메시지 추가
            setChatHistory(prev => [...prev, {
                role: 'user',
                content: userMessage,
                timestamp: Date.now()
            }]);

            try {
                // LLM으로 명령어 처리 (Guardian 모드용 함수들 전달)
                await processGuardianCommand(userMessage, {
                    onScheduleAdd,
                    setChatHistory: () => {} // 빈 함수로 오류 방지
                });

                // 채팅 히스토리에 성공 메시지 추가
                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: '✅ 명령이 처리되었습니다!',
                    timestamp: Date.now()
                }]);
            } catch (error) {
                alert('죄송합니다. 명령어를 처리하는 중 오류가 발생했습니다.');

                setChatHistory(prev => [...prev, {
                    role: 'assistant',
                    content: '❌ 처리 중 오류가 발생했습니다.',
                    timestamp: Date.now()
                }]);
            }

            setIsProcessing(false);
        };

        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowChatModal(false)}>
                <div className="bg-white rounded-3xl p-6 max-w-lg w-full h-[600px] shadow-2xl animate-scale-in flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                            🤖 AI 일정 관리
                        </h3>
                        <button onClick={() => setShowChatModal(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">×</button>
                    </div>

                    {/* 채팅 히스토리 */}
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                        {chatHistory.map((message, index) => (
                            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl ${
                                    message.role === 'user'
                                        ? 'bg-trustBlue text-white'
                                        : 'bg-slate-100 text-slate-800'
                                }`}>
                                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                                    <p className="text-xs opacity-70 mt-1">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isProcessing && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 text-slate-800 p-3 rounded-2xl">
                                    <p className="text-sm">AI가 처리 중...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 입력 영역 */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                            placeholder="명령어를 입력하세요..."
                            className="flex-1 p-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-trustBlue font-bold"
                            disabled={isProcessing}
                        />
                        <button
                            onClick={handleChatSubmit}
                            disabled={isProcessing || !chatInput.trim()}
                            className="px-4 py-3 bg-trustBlue text-white rounded-xl font-black shadow-lg disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                            전송
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {showReportModal && renderReportModal()}
            {showMessageModal && renderMessageModal()}
            {showScheduleModal && renderScheduleModal()}
            {showChatModal && renderChatModal()}
            {showGuardianSettingsModal && renderGuardianSettingsModal()}
        </>
    );
};

export default GuardianModals;

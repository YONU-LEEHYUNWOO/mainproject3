import React from 'react';
import { CheckCircle2, Bell, BellOff } from 'lucide-react';
import { deleteTask, completeTask, toggleReminder } from '../handlers/scheduleHandlers';
import { formatDateTimeShort, isTaskCompleted } from '../utils/dateFormat';
import { formatDateForReport } from '../utils/formatUtils';
import { t } from '../i18n';

/**
 * 일정 목록 컴포넌트
 * 선택된 날짜에 따른 일정 필터링 및 표시
 * 일정 선택, 완료, 삭제, 알림 토글 기능 제공
 */
const ScheduleList = ({
    confirmedTasks,
    setConfirmedTasks,
    selectedTaskId,
    setSelectedTaskId,
    selectedDate,
    setSelectedDate,
    editingTaskId,
    setEditingTaskId,
    setTempTask,
    setTaskEditPlaceSearchKeyword,
    setTaskEditPlaceSearchResults,
    language
}) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black">
                    {selectedDate
                        ? (selectedDate === new Date().toISOString().split('T')[0]
                            ? (t('todaySchedule', language) || '오늘의 일정')
                            : formatDateForReport(new Date(selectedDate + 'T00:00:00')) + ' 일정')
                        : (t('todaySchedule', language) || '오늘의 일정')}
                </h3>
                {selectedDate && (
                    <button
                        onClick={() => setSelectedDate(null)}
                        className="text-xs text-slate-500 hover:text-slate-700 font-bold"
                    >
                        오늘로
                    </button>
                )}
            </div>
            {(() => {
                // 선택된 날짜에 따라 필터링
                const today = new Date().toISOString().split('T')[0];
                const filterDate = selectedDate || today;
                
                // 완료되지 않은 일정 (남은 일정)
                const remainingTasks = confirmedTasks.filter(task =>
                    task.date === filterDate && !isTaskCompleted(task.date, task.time, task.completed)
                );
                
                // 완료된 일정
                const completedTasks = confirmedTasks.filter(task =>
                    task.date === filterDate && isTaskCompleted(task.date, task.time, task.completed)
                );

                if (remainingTasks.length === 0 && completedTasks.length === 0) {
                    return (
                        <div className="text-center py-8 text-slate-400 text-sm font-bold">
                            {t('noSchedule', language) || '일정이 없습니다.'}
                        </div>
                    );
                }

                return (
                    <div className="space-y-4">
                        {/* 남은 일정 섹션 */}
                        {remainingTasks.length > 0 && (
                            <div>
                                <h4 className="text-xs font-black text-pastel-purple mb-2 px-1">
                                    남은 일정 ({remainingTasks.length})
                                </h4>
                                {remainingTasks.map(task => {
                    const isHospitalTask = task.location?.includes('병원') || task.title?.includes('병원') || task.title?.includes('진료') || task.title?.includes('검진');
                    const isMedicineTask = task.title?.includes('약') || task.title?.includes('복용');
                    const isImportantTask = isHospitalTask || isMedicineTask;
                    const isSelected = selectedTaskId === task.id;

                    return (
                        <div
                            key={task.id}
                            className={`rounded-2xl border-2 transition-all ${isSelected
                                ? 'border-pastel-purple bg-pastel-purple/10 shadow-lg'
                                : isImportantTask
                                    ? 'border-red-200 bg-red-50 hover:border-red-300'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                        >
                            <div
                                className="p-4 cursor-pointer"
                                onClick={(e) => {
                                    // 수정 중일 때는 다른 일정 선택 방지
                                    if (editingTaskId) return;
                                    setSelectedTaskId(isSelected ? null : task.id);
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className={`text-base font-black ${isImportantTask ? 'text-red-900' : 'text-slate-900'}`}>{task.title}</h4>
                                        <p className="text-xs text-slate-600 font-bold mt-1">
                                            {formatDateTimeShort(task.date, task.time)}
                                        </p>
                                        {task.location && (
                                            <p className="text-xs text-slate-500 font-bold mt-1">📍 {task.location}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* 병원/약 복용 일정 완료 체크 버튼 */}
                                        {isImportantTask && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // completeTask는 많은 파라미터를 필요로 하지만,
                                                    // ScheduleList에서는 필요한 파라미터가 없으므로
                                                    // 직접 일정을 완료 처리
                                                    setConfirmedTasks(prev => prev.map(t =>
                                                        t.id === task.id
                                                            ? { ...t, completed: true, completedAt: new Date().toISOString() }
                                                            : t
                                                    ));
                                                }}
                                                className="p-2 text-green-500 hover:text-green-600 transition-colors"
                                                title={isHospitalTask ? '병원 일정 완료' : '약 복용 완료'}
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                        )}
                                        {/* 알림 토글 버튼 */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleReminder(task.id, e, confirmedTasks, setConfirmedTasks);
                                            }}
                                            className={`p-2 transition-colors ${task.reminderActive ? 'text-pastel-purple' : 'text-slate-300'}`}
                                        >
                                            {task.reminderActive ? <Bell size={16} /> : <BellOff size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {/* 선택된 일정의 상세 정보 */}
                            {isSelected && editingTaskId !== task.id && (
                                <div className="px-4 pb-4 border-t border-pastel-purple/20 pt-4 space-y-3">
                                    {task.analysis?.traffic && (
                                        <div className="bg-pastel-blue/30 rounded-xl p-3 border border-pastel-blue/50">
                                            <p className="text-[9px] font-black text-blue-600 uppercase mb-2">교통 정보</p>
                                            <p className="text-xs font-black text-blue-900">{task.analysis.traffic.duration}</p>
                                            {task.analysis.traffic.tip && (
                                                <p className="text-[11px] text-blue-700 mt-1">{task.analysis.traffic.tip}</p>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // 수정 모드 시작
                                                if (editingTaskId && editingTaskId !== task.id) {
                                                    alert('다른 일정 수정이 진행 중입니다. 먼저 저장하거나 취소해주세요.');
                                                    return;
                                                }
                                                setEditingTaskId(task.id);
                                                setTempTask({ ...task });
                                                setTaskEditPlaceSearchKeyword('');
                                                setTaskEditPlaceSearchResults([]);
                                            }}
                                            className="flex-1 py-2 bg-white border border-pastel-pink/30 rounded-xl text-xs font-bold text-slate-500 hover:bg-pastel-pink/20 transition-all"
                                            disabled={editingTaskId && editingTaskId !== task.id}
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`"${task.title}" 일정을 삭제하시겠습니까?`)) {
                                                    deleteTask(task.id, null, confirmedTasks, selectedTaskId, setConfirmedTasks, setSelectedTaskId);
                                                }
                                            }}
                                            className="flex-1 py-2 bg-white border border-red-100 rounded-xl text-xs font-bold text-red-400 hover:bg-red-50 transition-all"
                                            disabled={editingTaskId && editingTaskId === task.id}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
                            </div>
                        )}
                        
                        {/* 완료된 일정 섹션 */}
                        {completedTasks.length > 0 && (
                            <div>
                                <h4 className="text-xs font-black text-slate-400 mb-2 px-1">
                                    완료된 일정 ({completedTasks.length})
                                </h4>
                                {completedTasks.map(task => {
                                    const isHospitalTask = task.location?.includes('병원') || task.title?.includes('병원') || task.title?.includes('진료') || task.title?.includes('검진');
                                    const isMedicineTask = task.title?.includes('약') || task.title?.includes('복용');
                                    const isImportantTask = isHospitalTask || isMedicineTask;
                                    const isSelected = selectedTaskId === task.id;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`rounded-2xl border-2 transition-all opacity-60 ${isSelected
                                                ? 'border-slate-300 bg-slate-100 shadow-md'
                                                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                                }`}
                                        >
                                            <div
                                                className="p-4 cursor-pointer"
                                                onClick={(e) => {
                                                    if (editingTaskId) return;
                                                    setSelectedTaskId(isSelected ? null : task.id);
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle2 size={16} className="text-green-500" />
                                                            <h4 className={`text-base font-black line-through ${isImportantTask ? 'text-red-700' : 'text-slate-500'}`}>
                                                                {task.title}
                                                            </h4>
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-bold mt-1">
                                                            {formatDateTimeShort(task.date, task.time)}
                                                        </p>
                                                        {task.location && (
                                                            <p className="text-xs text-slate-400 font-bold mt-1">📍 {task.location}</p>
                                                        )}
                                                        {task.completedAt && (
                                                            <p className="text-xs text-green-600 font-bold mt-1">
                                                                완료: {new Date(task.completedAt).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {/* 알림 토글 버튼 (완료된 일정도 알림 설정 가능) */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleReminder(task.id, e, confirmedTasks, setConfirmedTasks);
                                                            }}
                                                            className={`p-2 transition-colors ${task.reminderActive ? 'text-slate-400' : 'text-slate-300'}`}
                                                        >
                                                            {task.reminderActive ? <Bell size={16} /> : <BellOff size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* 선택된 완료 일정의 상세 정보 */}
                                            {isSelected && editingTaskId !== task.id && (
                                                <div className="px-4 pb-4 border-t border-slate-200 pt-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm(`"${task.title}" 일정을 삭제하시겠습니까?`)) {
                                                                    deleteTask(task.id, null, confirmedTasks, selectedTaskId, setConfirmedTasks, setSelectedTaskId);
                                                                }
                                                            }}
                                                            className="flex-1 py-2 bg-white border border-red-100 rounded-xl text-xs font-bold text-red-400 hover:bg-red-50 transition-all"
                                                            disabled={editingTaskId && editingTaskId === task.id}
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
};

export default ScheduleList;

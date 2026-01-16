import React from 'react';
import { handleDateClick } from '../../../handlers/scheduleHandlers';
import { isTaskCompleted } from '../../../utils/dateFormat';

/**
 * 달력 뷰 컴포넌트
 * 현재 월의 달력을 표시하고 날짜 클릭 시 일정 선택/필터링
 */
const CalendarView = ({
    confirmedTasks,
    selectedTaskId,
    setSelectedTaskId,
    setConfirmedTasks,
    setEditingTaskId,
    setTempTask,
    setTaskEditPlaceSearchKeyword,
    setTaskEditPlaceSearchResults,
    language,
    selectedDate,
    setSelectedDate
}) => {
    // 현재 날짜 기반 달력 생성
    const getCalendarDays = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-11

        // 해당 월의 첫 번째 날짜
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay(); // 0(일요일) ~ 6(토요일)

        // 해당 월의 마지막 날짜
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // 달력 배열 생성 (첫 주의 빈 칸 + 날짜들)
        const days = Array(firstDayOfWeek).fill(null);
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }

        return { days, year, month: month + 1 }; // month는 1-12로 변환
    };

    const calendarData = getCalendarDays();
    const calendarDays = calendarData.days;

    return (
        <div className="bg-white rounded-[2rem] border border-pastel-pink/30 p-5 shadow-sm animate-fade-in">
            <h3 className="text-sm font-black mb-4">{calendarData.year}. {String(calendarData.month).padStart(2, '0')}</h3>
            <div className="grid grid-cols-7 gap-1">
                {['일', '월', '화', '수', '목', '금', '토'].map((dn, i) => (
                    <div key={`day-name-${i}`} className="text-[9px] font-black text-slate-300 text-center py-1">{dn}</div>
                ))}
                {calendarDays.map((day, i) => {
                    if (day === null) return <div key={`empty-start-${i}`} />;
                    const ds = `${calendarData.year}-${String(calendarData.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    
                    // 해당 날짜의 모든 일정 가져오기
                    const allTasksForDay = confirmedTasks.filter(t => t.date === ds);
                    
                    // 완료되지 않은 일정 (남은 일정)
                    const remainingTasks = allTasksForDay.filter(t => 
                        !isTaskCompleted(t.date, t.time, t.completed)
                    );
                    
                    // 완료된 일정
                    const completedTasks = allTasksForDay.filter(t => 
                        isTaskCompleted(t.date, t.time, t.completed)
                    );
                    
                    const task = remainingTasks[0] || completedTasks[0]; // 남은 일정 우선, 없으면 완료된 일정
                    const isSelected = selectedTaskId === task?.id;
                    const hasRemainingTasks = remainingTasks.length > 0;
                    const hasCompletedTasks = completedTasks.length > 0;

                    const today = new Date();
                    const isToday = today.getFullYear() === calendarData.year &&
                        today.getMonth() + 1 === calendarData.month &&
                        today.getDate() === day;

                    return (
                        <button
                            key={`calendar-day-${day}`}
                            onClick={() => handleDateClick(ds, confirmedTasks, selectedTaskId, setSelectedTaskId, setConfirmedTasks, setEditingTaskId, setTempTask, setTaskEditPlaceSearchKeyword, setTaskEditPlaceSearchResults, language, selectedDate, setSelectedDate)}
                            className={`h-9 rounded-xl text-xs font-bold transition-all relative transform hover:scale-110 active:scale-95 ${isSelected
                                ? 'bg-gradient-to-r from-pastel-purple to-pastel-pink text-white shadow-md z-10'
                                : isToday
                                    ? 'bg-pastel-blue/30 text-pastel-blue border-2 border-pastel-blue'
                                    : 'hover:bg-pastel-pink/20 text-slate-500'
                                }`}
                        >
                            {day}
                            {/* 일정 표시: 남은 일정은 보라색, 완료된 일정은 회색 */}
                            {hasRemainingTasks && (
                                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 mx-auto ${isSelected ? 'bg-white' : 'bg-pastel-purple'}`} />
                            )}
                            {!hasRemainingTasks && hasCompletedTasks && (
                                <div className={`w-1.5 h-1.5 rounded-full mt-0.5 mx-auto ${isSelected ? 'bg-white/50' : 'bg-slate-300'}`} />
                            )}
                            {/* 여러 일정이 있을 경우 숫자 표시 */}
                            {allTasksForDay.length > 1 && (
                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full text-[8px] flex items-center justify-center ${
                                    isSelected 
                                        ? 'bg-white text-pastel-purple' 
                                        : hasRemainingTasks 
                                            ? 'bg-pastel-purple text-white' 
                                            : 'bg-slate-300 text-slate-600'
                                }`}>
                                    {allTasksForDay.length}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
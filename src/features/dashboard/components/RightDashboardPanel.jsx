import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import CalendarView from '../../schedule/components/CalendarView';
import ScheduleList from '../../../components/ScheduleList';

// 데스크톱 우측 대시보드 패널
const RightDashboardPanel = ({
    confirmedTasks,
    selectedTaskId,
    setSelectedTaskId,
    setConfirmedTasks,
    editingTaskId,
    setEditingTaskId,
    setTempTask,
    setTaskEditPlaceSearchKeyword,
    setTaskEditPlaceSearchResults,
    language,
    selectedDate,
    setSelectedDate,
    t
}) => {
    return (
        <div className="hidden md:flex w-96 bg-white/80 backdrop-blur-sm flex-col border-l shrink-0 shadow-lg">
            <header className="h-16 border-b bg-white/80 backdrop-blur-sm flex items-center px-6 shrink-0">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    <LayoutDashboard size={14} /> {t('dashboard', language)}
                </span>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* 캘린더 */}
                <CalendarView
                    confirmedTasks={confirmedTasks}
                    selectedTaskId={selectedTaskId}
                    setSelectedTaskId={setSelectedTaskId}
                    setConfirmedTasks={setConfirmedTasks}
                    setEditingTaskId={setEditingTaskId}
                    setTempTask={setTempTask}
                    setTaskEditPlaceSearchKeyword={setTaskEditPlaceSearchKeyword}
                    setTaskEditPlaceSearchResults={setTaskEditPlaceSearchResults}
                    language={language}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />

                {/* 일정 목록 */}
                <ScheduleList
                    confirmedTasks={confirmedTasks}
                    setConfirmedTasks={setConfirmedTasks}
                    selectedTaskId={selectedTaskId}
                    setSelectedTaskId={setSelectedTaskId}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    editingTaskId={editingTaskId}
                    setEditingTaskId={setEditingTaskId}
                    setTempTask={setTempTask}
                    setTaskEditPlaceSearchKeyword={setTaskEditPlaceSearchKeyword}
                    setTaskEditPlaceSearchResults={setTaskEditPlaceSearchResults}
                    language={language}
                />
            </div>
        </div>
    );
};

export default RightDashboardPanel;

import { Bell, ShoppingBag, Clock, AlertTriangle, Pill, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { notificationLogsAPI, inactivityAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

export const NotificationCenter = ({ targetUserId }: { targetUserId?: number }) => {
    const [logs, setLogs] = useState<any[]>([])
    const nav = useNavigate()
    
    const ld = () => notificationLogsAPI.getLogs({ target_user_id: targetUserId, limit: 20 }).then(res => {
        const list = res.data.data?.notification_logs || res.data.notification_logs || []
        const unreadLogs = list.filter((l: any) => !l.is_read)
        console.log('📢 [알림센터] 전체:', list.length, '읽지않은:', unreadLogs.length, unreadLogs)
        setLogs(unreadLogs)
    }).catch(err => {
        console.error('❌ 알림 로드 오류:', err)
    })
    
    useEffect(() => { ld(); const t = setInterval(ld, 10000); return () => clearInterval(t) }, [targetUserId])

    // 일정/상태 알림과 약 알림 분리
    const scheduleAndStatusLogs = logs.filter(log => 
        log.notification_type !== 'medicine_skipped' && 
        !log.notification_type?.includes('medicine')
    )
    const medicineLogs = logs.filter(log => 
        log.notification_type === 'medicine_skipped' || 
        log.notification_type?.includes('medicine')
    )

    const handleClick = async (log: any) => {
        await notificationLogsAPI.markRead(log.id)
        if (log.notification_type === 'parent_request') nav('/child/request')
        if (log.notification_type === 'inactivity_danger') await inactivityAPI.updateActivity('parent_confirm')
        ld()
    }

    return (
        <div className="space-y-4">
            {/* 일정 및 현재 상태 알림 */}
            <div className="bg-white rounded-xl shadow-md border-2 border-indigo-200 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-indigo-100 to-blue-100 border-b-2 border-indigo-200 flex justify-between items-center">
                    <span className="flex items-center gap-2 font-bold text-indigo-900 text-base">
                        <Calendar size={18} className="text-indigo-600" /> 
                        📅 일정 및 현재 상태
                    </span>
                    {scheduleAndStatusLogs.length > 0 && (
                        <span className="px-2 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">
                            {scheduleAndStatusLogs.length}
                        </span>
                    )}
                </div>
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                    {scheduleAndStatusLogs.length === 0 && (
                        <p className="p-6 text-center text-gray-400">새로운 알림이 없습니다.</p>
                    )}
                    {scheduleAndStatusLogs.map(log => (
                        <div 
                            key={log.id} 
                            onClick={() => handleClick(log)}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-all flex items-start gap-3 border-l-4 ${
                                log.notification_type === 'emergency_alert' 
                                    ? 'bg-red-100 border-red-600 animate-pulse' 
                                    : log.notification_type === 'inactivity_danger' 
                                        ? 'bg-red-50 border-red-500' 
                                        : log.notification_type === 'parent_request' 
                                            ? 'bg-orange-50 border-orange-500' 
                                            : log.notification_type === 'task_reminder'
                                                ? 'bg-indigo-50 border-indigo-500'
                                                : 'bg-gray-50 border-gray-400'
                            }`}
                        >
                            {log.notification_type === 'emergency_alert' 
                                ? <Bell className="text-red-600 mt-1 animate-bounce" size={18} /> 
                                : log.notification_type === 'parent_request' 
                                    ? <ShoppingBag className="text-orange-500 mt-1" size={18} /> 
                                    : log.notification_type === 'inactivity_danger' 
                                        ? <AlertTriangle className="text-red-500 mt-1" size={18} /> 
                                        : log.notification_type === 'task_reminder'
                                            ? <Calendar className="text-indigo-600 mt-1" size={18} />
                                            : <Bell className="text-gray-500 mt-1" size={18} />
                            }
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm ${
                                    log.notification_type === 'emergency_alert' ? 'text-red-900' : 'text-gray-800'
                                }`}>{log.title}</p>
                                <p className={`text-xs mt-1 line-clamp-2 ${
                                    log.notification_type === 'emergency_alert' ? 'text-red-700' : 'text-gray-600'
                                }`}>{log.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock size={10} /> {new Date(log.created_at).toLocaleString('ko-KR')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 약 복용 알림 */}
            <div className="bg-white rounded-xl shadow-md border-2 border-amber-200 overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-amber-100 to-yellow-100 border-b-2 border-amber-200 flex justify-between items-center">
                    <span className="flex items-center gap-2 font-bold text-amber-900 text-base">
                        <Pill size={18} className="text-amber-600" /> 
                        💊 약 복용 알림
                    </span>
                    {medicineLogs.length > 0 && (
                        <span className="px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                            {medicineLogs.length}
                        </span>
                    )}
                </div>
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                    {medicineLogs.length === 0 && (
                        <p className="p-6 text-center text-gray-400">약 관련 알림이 없습니다.</p>
                    )}
                    {medicineLogs.map(log => (
                        <div 
                            key={log.id} 
                            onClick={() => handleClick(log)}
                            className="p-4 hover:bg-amber-50 cursor-pointer transition-all flex items-start gap-3 border-l-4 bg-amber-50/50 border-amber-500"
                        >
                            <Pill className="text-amber-600 mt-1" size={18} />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-amber-900">{log.title}</p>
                                <p className="text-xs mt-1 line-clamp-2 text-amber-700">{log.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                    <Clock size={10} /> {new Date(log.created_at).toLocaleString('ko-KR')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

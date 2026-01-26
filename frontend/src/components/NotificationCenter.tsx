import { Bell, ShoppingBag, Clock, AlertTriangle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { notificationLogsAPI, inactivityAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

export const NotificationCenter = ({ targetUserId }: { targetUserId?: number }) => {
    const [logs, setLogs] = useState<any[]>([])
    const nav = useNavigate()
    const ld = () => notificationLogsAPI.getLogs({ target_user_id: targetUserId, limit: 20 }).then(res => {
        const list = res.data.data?.notification_logs || res.data.notification_logs || []
        setLogs(list.filter((l: any) => !l.is_read))
    })
    useEffect(() => { ld(); const t = setInterval(ld, 10000); return () => clearInterval(t) }, [targetUserId])

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center font-bold text-gray-700">
                <span className="flex items-center gap-2"><Bell size={18} className="text-blue-500" /> 최근 알림 센터</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                {logs.length === 0 && <p className="p-8 text-center text-gray-400">새로운 알림이 없습니다.</p>}
                {logs.map(log => (
                    <div key={log.id} onClick={async () => {
                        await notificationLogsAPI.markRead(log.id)
                        if (log.notification_type === 'parent_request') nav('/child/request')
                        if (log.notification_type === 'inactivity_danger') await inactivityAPI.updateActivity('parent_confirm')
                        ld()
                    }}
                        className={`p-4 hover:bg-blue-50 cursor-pointer transition flex items-start gap-3 border-l-4 ${log.notification_type === 'inactivity_danger' ? 'bg-red-50 border-red-500' : 'bg-blue-50/30 border-blue-500'}`}>
                        {log.notification_type === 'parent_request' ? <ShoppingBag className="text-orange-500 mt-1" /> : log.notification_type === 'inactivity_danger' ? <AlertTriangle className="text-red-500 mt-1" /> : <Bell className="text-blue-400 mt-1" />}
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm">{log.title}</p>
                            <p className="text-gray-600 text-xs mt-1 line-clamp-1">{log.message}</p>
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={10} /> {new Date(log.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

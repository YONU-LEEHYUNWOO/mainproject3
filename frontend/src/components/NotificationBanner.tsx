import React, { useState, useEffect } from 'react'
import { Bell, AlertTriangle, X, ShoppingBag } from 'lucide-react'
import { inactivityAPI, notificationLogsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

interface NotificationBannerProps {
    mode: 'parent' | 'child'
    parentId?: number
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ mode, parentId }) => {
    const { user } = useAuth()
    const [alerts, setAlerts] = useState<any[]>([]), [inactStatus, setInactStatus] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false), [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // 1. 무활성 상태 체크
                const targetId = mode === 'child' ? parentId : user?.id
                if (targetId) {
                    const iRes = await inactivityAPI.getStatus(targetId)
                    const s = iRes.data.data; setInactStatus(s)
                    if (mode === 'parent' && s?.status === 'Danger') await inactivityAPI.incrementReminder(targetId)
                }

                // 2. 미독 알림 로그 체크
                const lRes = await notificationLogsAPI.getLogs({ limit: 10 })
                const logs = (lRes.data.data?.notification_logs || []).filter((l: any) => !l.is_read)
                setAlerts(logs)

                // 가시성 결정 (무활동은 본인일때 Danger/Inactive, 자녀일때 Active 제외)
                const hasInact = mode === 'parent' ? (inactStatus?.status === 'Danger' || inactStatus?.status === 'Inactive') : (inactStatus?.status !== 'Normal' && inactStatus?.status !== 'Active')
                setIsVisible(hasInact || logs.length > 0)
            } catch (e) { console.error('Alert fetch error:', e) }
        }
        fetchAll(); const t = setInterval(fetchAll, 10000); return () => clearInterval(t)
    }, [mode, parentId, user])

    const onCnfAll = async () => {
        setLoading(true); try {
            if (inactStatus?.status === 'Danger' || inactStatus?.status === 'Inactive') await inactivityAPI.updateActivity('parent_confirm')
            await notificationLogsAPI.markAllRead(); setAlerts([]); setIsVisible(false)
        } finally { setLoading(false) }
    }

    if (!isVisible) return null
    const curAlert = alerts[0], isDanger = inactStatus?.status === 'Danger', isInact = inactStatus?.status === 'Inactive'
    const dispTitle = isDanger ? inactStatus.message : isInact ? inactStatus.message : curAlert?.title
    const colorClass = isDanger ? 'bg-red-600' : isInact ? 'bg-pink-500' : curAlert?.notification_type === 'parent_request' ? 'bg-blue-600' : 'bg-amber-600'

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-in fade-in slide-in-from-top duration-500">
            <div className={`${colorClass} text-white shadow-xl p-4 border-b border-white/20`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        {isDanger ? <AlertTriangle className="animate-bounce" /> : <Bell className="animate-pulse" />}
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg leading-tight">{dispTitle}</span>
                            {curAlert?.message && <span className="text-sm opacity-90">{curAlert.message}</span>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {mode === 'parent' && (
                            <button onClick={onCnfAll} disabled={loading} className="bg-white text-zinc-900 px-6 py-2 rounded-full font-black shadow-lg hover:scale-105 transition-transform">확인/해제</button>
                        )}
                        <button onClick={() => setIsVisible(false)} className="p-2 hover:bg-black/20 rounded-full transition-colors"><X size={20} /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default NotificationBanner

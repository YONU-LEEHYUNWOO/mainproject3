import React, { useState, useEffect } from 'react'
import { Bell, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { inactivityAPI } from '../services/api'

interface NotificationBannerProps {
    mode: 'parent' | 'child'
    parentId?: number
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ mode, parentId }) => {
    const [status, setStatus] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [loading, setLoading] = useState(false)

    // 상태 체크 루프
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const targetId = mode === 'child' ? parentId : undefined
                if (mode === 'child' && !targetId) return

                // 현재 유저 정보 가져오기 (본인 확인용)
                const userStr = localStorage.getItem('user_info')
                if (!userStr) return
                const user = JSON.parse(userStr)
                const finalTargetId = targetId || user.id

                const response = await inactivityAPI.getStatus(finalTargetId)
                const data = response.data
                setStatus(data)

                // 무활동(Inactive) 또는 위험(Danger) 상태인 경우 배너 표시
                if (data.status === 'Inactive' || data.status === 'Danger') {
                    setIsVisible(true)
                } else {
                    setIsVisible(false)
                }
            } catch (error) {
                console.error('상태 체크 오류:', error)
            }
        }

        checkStatus()
        const timer = setInterval(checkStatus, 30000) // 30초마다 체크
        return () => clearInterval(timer)
    }, [mode, parentId])

    // 활동 확인 버튼 (무활동 해제)
    const handleConfirm = async () => {
        setLoading(true)
        try {
            await inactivityAPI.updateActivity('banner_click')
            setIsVisible(false)
            // 즉시 상태 갱신
            const userStr = localStorage.getItem('user_info')
            if (userStr) {
                const user = JSON.parse(userStr)
                const response = await inactivityAPI.getStatus(user.id)
                setStatus(response.data)
            }
        } catch (error) {
            console.error('활동 확인 오류:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!isVisible || !status) return null

    return (
        <div className={`fixed top-0 left-0 right-0 z-[100] animate-bounce-subtle`}>
            <div className={`${status.status === 'Danger' ? 'bg-red-600' : 'bg-amber-500'
                } text-white shadow-lg`}>
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between flex-wrap">
                        <div className="w-0 flex-1 flex items-center">
                            <span className="flex p-2 rounded-lg bg-white bg-opacity-20">
                                {status.status === 'Danger' ? (
                                    <AlertTriangle className="h-6 w-6 text-white" />
                                ) : (
                                    <Bell className="h-6 w-6 text-white" />
                                )}
                            </span>
                            <p className="ml-3 font-medium text-white truncate">
                                <span className="md:hidden">{status.message}</span>
                                <span className="hidden md:inline">
                                    {mode === 'parent'
                                        ? `[안전 확인] ${status.message} 건강에 이상이 없으시다면 버튼을 눌러주세요.`
                                        : `[무활동 감지] ${status.message} 부모님께 연락을 드려보세요.`
                                    }
                                </span>
                            </p>
                        </div>

                        {mode === 'parent' && (
                            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading}
                                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-amber-600 bg-white hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-white"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    건강합니다 (활동 확인)
                                </button>
                            </div>
                        )}

                        <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                            <button
                                onClick={() => setIsVisible(false)}
                                className="-mr-1 flex p-2 rounded-md hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white"
                            >
                                <X className="h-6 w-6 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationBanner

import { useState, useEffect } from 'react'
import { Sparkles, ArrowRight, Pill, MapPin } from 'lucide-react'
import { aiAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

interface ProactiveMessage {
    message: string
    action: {
        type: string
        query?: string
        alarm_id?: number
        task?: any
    } | null
}

export const AICareCenter = ({ mode }: { mode: 'parent' | 'child' }) => {
    const [data, setData] = useState<ProactiveMessage | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        if (mode === 'parent') {
            fetchMessage()
        }
    }, [mode])

    const fetchMessage = async () => {
        const CACHE_KEY = 'ai_proactive_message'
        const CACHE_TIME_KEY = 'ai_proactive_timestamp'
        const THIRTY_MINUTES = 30 * 60 * 1000

        try {
            // 캐시 확인
            const cachedData = localStorage.getItem(CACHE_KEY)
            const cachedTimestamp = localStorage.getItem(CACHE_TIME_KEY)
            const now = Date.now()

            if (cachedData && cachedTimestamp && (now - parseInt(cachedTimestamp) < THIRTY_MINUTES)) {
                console.log('📦 AI 메시지 캐시 사용')
                setData(JSON.parse(cachedData))
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            setError(null)
            const response = await aiAPI.getProactiveMessage()

            if (response.data && response.data.data) {
                const newMessage = response.data.data
                setData(newMessage)
                // 캐시 저장
                localStorage.setItem(CACHE_KEY, JSON.stringify(newMessage))
                localStorage.setItem(CACHE_TIME_KEY, now.toString())
            }
        } catch (error: any) {
            console.error('능동형 메시지 로드 실패:', error)
            setError(error.message || '메시지를 불러오지 못했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAction = () => {
        if (!data?.action) return

        const { type, query } = data.action
        if (type === 'SEARCH' || type === 'SEARCH_STORE') {
            navigate(`/parent/location?search=${query}`)
        } else if (type === 'MEDICINE_TAKEN') {
            navigate('/parent/medicine')
        } else if (type === 'ADD_TASK') {
            navigate('/parent/tasks')
        }
    }

    if (mode !== 'parent' || (!isLoading && !data)) return null

    return (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg overflow-hidden border-b-4 border-blue-800">
            <div className="px-5 py-4 flex items-center space-x-4">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm animate-pulse">
                    <Sparkles className="h-6 w-6 text-yellow-300" />
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <div className="h-4 bg-white/20 rounded w-3/4 animate-pulse"></div>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-white font-bold text-lg leading-tight">
                                {error ? (
                                    <span className="text-blue-100 text-sm font-normal">
                                        잠시 후 다시 확인해 주세요.
                                    </span>
                                ) : (
                                    data?.message
                                )}
                            </p>
                            {data?.action && (
                                <button
                                    onClick={handleAction}
                                    className="mt-2 inline-flex items-center text-xs font-bold bg-white text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                                >
                                    {data.action.type === 'SEARCH' && <MapPin className="h-3 w-3 mr-1" />}
                                    {data.action.type === 'MEDICINE_TAKEN' && <Pill className="h-3 w-3 mr-1" />}
                                    {data.action.type === 'ADD_TASK' && <ArrowRight className="h-3 w-3 mr-1" />}
                                    바로 확인하기
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

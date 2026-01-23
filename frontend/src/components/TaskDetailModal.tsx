import React, { useState, useEffect } from 'react'
import { X, MapPin, Clock, Calendar, Navigation, Info, Loader2, AlertCircle, CarFront } from 'lucide-react'
import { tasksAPI } from '../services/api'

interface TaskDetailModalProps {
    isOpen: boolean
    onClose: () => void
    onEdit?: (task: any) => void
    task: any
    currentLocation?: { latitude: number; longitude: number } | null
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
    isOpen,
    onClose,
    onEdit,
    task,
    currentLocation
}) => {
    const [analysis, setAnalysis] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && task && task.id) {
            fetchAnalysis()
        } else {
            setAnalysis(null)
            setError(null)
        }
    }, [isOpen, task, currentLocation])

    const fetchAnalysis = async () => {
        if (!task?.id) return

        setIsLoading(true)
        setError(null)
        try {
            const params: any = {}
            if (currentLocation) {
                params.lat = currentLocation.latitude
                params.lng = currentLocation.longitude
            }

            // tasksAPI에 analyze 엔드포인트가 정의되어 있지 않으므로 직접 호출하거나 api.ts 수정 필요
            // 여기서는 api.ts를 수정했다고 가정하고 tasksAPI.analyzeTask 사용
            const response = await (tasksAPI as any).analyzeTask(task.id, params)
            setAnalysis(response.data.data)
        } catch (err: any) {
            console.error('Failed to analyze task:', err)
            setError('이동 정보를 가져오는 데 실패했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    const openNavigation = () => {
        if (!task?.location || !task.latitude || !task.longitude) return
        const url = `https://map.kakao.com/link/to/${task.location},${task.latitude},${task.longitude}`
        window.open(url, '_blank')
    }

    if (!isOpen || !task) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-500" /> 일정 상세 보기
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 transition-colors">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Main Info */}
                    <div className="space-y-4">
                        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{task.title}</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <div>
                                    <div className="text-xs text-gray-400 font-medium">날짜</div>
                                    <div className="font-bold">{task.date}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <Clock className="h-5 w-5 text-orange-500" />
                                <div>
                                    <div className="text-xs text-gray-400 font-medium">시간</div>
                                    <div className="font-bold">{task.time || '시간 미지정'}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <MapPin className="h-5 w-5 text-red-500 mt-1" />
                            <div className="flex-1">
                                <div className="text-xs text-gray-400 font-medium">장소</div>
                                <div className="font-bold">{task.location || '장소 정보 없음'}</div>
                                {task.description && <p className="mt-2 text-sm text-gray-600 leading-relaxed">{task.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="bg-blue-100 p-1.5 rounded-lg">✨</span> AI 맞춤 생활 가이드
                            </h3>
                            {analysis && !isLoading && (
                                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase tracking-tighter">
                                    Personalized
                                </span>
                            )}
                        </div>

                        {isLoading ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 flex flex-col items-center justify-center animate-pulse">
                                <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-3" />
                                <p className="text-blue-600 font-medium text-sm">AI가 생활 가이드를 작성 중입니다...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        ) : analysis ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                {/* Route Info Cards */}
                                {analysis.route ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                            <div className="bg-blue-50 p-2 rounded-full mb-2">
                                                <CarFront className="h-5 w-5 text-blue-500" />
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">예상 소요 시간</div>
                                            <div className="text-lg font-black text-gray-900">
                                                약 {Math.round(analysis.route.duration / 60)}분
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                                            <div className="bg-indigo-50 p-2 rounded-full mb-2">
                                                <MapPin className="h-5 w-5 text-indigo-500" />
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">이동 거리</div>
                                            <div className="text-lg font-black text-gray-900">
                                                {(analysis.route.distance / 1000).toFixed(1)}km
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center text-gray-400 text-sm italic">
                                        이동 정보(경로)를 계산할 수 없습니다.
                                    </div>
                                )}

                                {/* AI Guide Text */}
                                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Info className="h-12 w-12" />
                                    </div>
                                    <p className="text-gray-800 leading-relaxed font-semibold whitespace-pre-wrap relative z-10 text-[15px]">
                                        {analysis.guide}
                                    </p>
                                    {analysis.departure_time && (
                                        <div className="mt-4 flex items-center gap-2 text-sm relative z-10">
                                            <span className="px-2 py-1 bg-yellow-400 text-black text-xs font-black rounded-lg shadow-sm">추천 출발</span>
                                            <span className="text-gray-900 font-black text-xl">{analysis.departure_time}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Info className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">장소 정보가 설정되면 AI 가이드가 활성화됩니다.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 bg-gray-50 border-t space-y-3">
                    <div className="flex gap-3">
                        <button
                            onClick={openNavigation}
                            disabled={!task.latitude}
                            className="flex-[2] bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-yellow-100"
                        >
                            <Navigation className="h-5 w-5" /> 길찾기
                        </button>
                        {onEdit && (
                            <button
                                onClick={() => onEdit(task)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg"
                            >
                                수정
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CheckCircle, Quote, TrendingUp } from 'lucide-react'
import { guardiansAPI } from '../services/api'

interface ReportData {
    task_stats: {
        total: number
        completed: number
        rate: number
        daily: any[]
    }
    medicine_stats: {
        total_alarms: number
        adherence_rate: number
    }
    insight: string
}

export const CareReport = ({ parentId }: { parentId: number | null }) => {
    const [data, setData] = useState<ReportData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (parentId) {
            fetchReport()
        }
    }, [parentId])

    const fetchReport = async () => {
        if (!parentId) return
        try {
            setIsLoading(true)
            const response = await guardiansAPI.getParentReport(parentId)
            setData(response.data.data)
        } catch (error) {
            console.error('리포트 로드 실패:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!parentId) return null
    if (isLoading) return <div className="p-8 text-center text-gray-500">리포트를 분석 중입니다...</div>
    if (!data) return null

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 일정 완료율 카드 */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-gray-700 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                            일정 이행 현황
                        </h4>
                        <span className="text-2xl font-black text-green-600">{data.task_stats.rate}%</span>
                    </div>
                    <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.task_stats.daily}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* AI 복약 분석 인사이트 */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl shadow-sm border border-indigo-100 relative overflow-hidden">
                    <TrendingUp className="absolute -right-4 -bottom-4 h-24 w-24 text-indigo-100" />
                    <h4 className="font-bold text-indigo-700 flex items-center mb-3">
                        <Quote className="h-5 w-5 mr-2 text-indigo-400" />
                        AI 분석 리포트
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed relative z-10 whitespace-pre-wrap">
                        {data.insight}
                    </p>
                </div>
            </div>

            {/* 요약 대시보드 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-3 gap-2">
                <div className="text-center p-2">
                    <p className="text-xs text-gray-500 mb-1">전체 일정</p>
                    <p className="font-bold text-lg">{data.task_stats.total}건</p>
                </div>
                <div className="text-center p-2 border-x border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">완료 일정</p>
                    <p className="font-bold text-lg text-green-600">{data.task_stats.completed}건</p>
                </div>
                <div className="text-center p-2">
                    <p className="text-xs text-gray-500 mb-1">복약 알림</p>
                    <p className="font-bold text-lg text-blue-600">{data.medicine_stats.total_alarms}개</p>
                </div>
            </div>
        </div>
    )
}

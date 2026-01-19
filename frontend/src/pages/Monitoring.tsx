import { useState } from 'react'
import { Activity, Heart, Footprints, AlertTriangle, Bell, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * Monitoring 페이지
 * 부모님 건강 모니터링 (자식 모드 전용)
 */
const Monitoring = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  // 샘플 데이터 (API 연동 전)
  const dailyData = [
    { date: '00:00', steps: 0, heartRate: 72 },
    { date: '04:00', steps: 500, heartRate: 68 },
    { date: '08:00', steps: 2000, heartRate: 75 },
    { date: '12:00', steps: 4500, heartRate: 78 },
    { date: '16:00', steps: 6500, heartRate: 80 },
    { date: '20:00', steps: 8000, heartRate: 72 },
  ]

  const weeklyData = [
    { day: '월', steps: 8000, heartRate: 75 },
    { day: '화', steps: 7500, heartRate: 73 },
    { day: '수', steps: 9200, heartRate: 76 },
    { day: '목', steps: 6800, heartRate: 74 },
    { day: '금', steps: 8500, heartRate: 75 },
    { day: '토', steps: 6000, heartRate: 72 },
    { day: '일', steps: 5500, heartRate: 71 },
  ]

  const monthlyData = [
    { week: '1주', steps: 52000, heartRate: 74 },
    { week: '2주', steps: 48000, heartRate: 73 },
    { week: '3주', steps: 55000, heartRate: 75 },
    { week: '4주', steps: 51000, heartRate: 74 },
  ]

  const currentData = period === 'daily' ? dailyData : period === 'weekly' ? weeklyData : monthlyData

  // 현재 상태 (샘플 데이터)
  const currentStatus = {
    heartRate: 75,
    steps: 8200,
    activityLevel: 'normal' as 'low' | 'normal' | 'high',
    lastUpdate: new Date()
  }

  // 이상 징후 감지 (샘플)
  const hasAnomaly = false
  const anomalies: string[] = []

  /**
   * 비상 알림 전송
   */
  const handleEmergencyAlert = () => {
    if (window.confirm('비상 알림을 전송하시겠습니까?')) {
      // TODO: API로 비상 알림 전송
      alert('비상 알림이 전송되었습니다.')
    }
  }

  return (
    <div className="space-y-6">
      {/* 제목 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">부모님 건강 모니터링 👴</h1>
        <p className="text-sm text-gray-500 mt-1">
          부모님의 건강 상태를 실시간으로 확인하세요
        </p>
      </div>

      {/* 현재 상태 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 심박수 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <h3 className="text-sm font-medium text-gray-600">심박수</h3>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              currentStatus.heartRate < 60 || currentStatus.heartRate > 100
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {currentStatus.heartRate < 60 || currentStatus.heartRate > 100 ? '주의' : '정상'}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{currentStatus.heartRate}</p>
          <p className="text-sm text-gray-500 mt-1">bpm</p>
        </div>

        {/* 걸음 수 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Footprints className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-600">걸음 수</h3>
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {currentStatus.steps.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">걸음</p>
        </div>

        {/* 활동량 */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <h3 className="text-sm font-medium text-gray-600">활동량</h3>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              currentStatus.activityLevel === 'high'
                ? 'bg-purple-100 text-purple-700'
                : currentStatus.activityLevel === 'low'
                ? 'bg-gray-100 text-gray-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {currentStatus.activityLevel === 'high' ? '높음' : currentStatus.activityLevel === 'low' ? '낮음' : '보통'}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {currentStatus.activityLevel === 'high' ? '높음' : currentStatus.activityLevel === 'low' ? '낮음' : '보통'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            마지막 업데이트: {currentStatus.lastUpdate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* 이상 징후 알림 */}
      {hasAnomaly && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-900 mb-2">이상 징후 감지</h3>
              <ul className="space-y-1">
                {anomalies.map((anomaly, index) => (
                  <li key={index} className="text-sm text-red-700">• {anomaly}</li>
                ))}
              </ul>
              <button
                onClick={handleEmergencyAlert}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Bell className="h-4 w-4" />
                <span>비상 알림 전송</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 활동량 차트 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">활동량 추이</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p === 'daily' ? '일간' : p === 'weekly' ? '주간' : '월간'}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          {period === 'daily' ? (
            <LineChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="steps"
                stroke="#3b82f6"
                strokeWidth={2}
                name="걸음 수"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="heartRate"
                stroke="#ef4444"
                strokeWidth={2}
                name="심박수 (bpm)"
              />
            </LineChart>
          ) : (
            <BarChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={period === 'weekly' ? 'day' : 'week'} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="steps"
                fill="#3b82f6"
                name="걸음 수"
              />
              <Bar
                yAxisId="right"
                dataKey="heartRate"
                fill="#ef4444"
                name="평균 심박수"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* 건강 데이터 요약 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">건강 데이터 요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">평균 심박수</h3>
            <p className="text-2xl font-bold text-gray-900">74 bpm</p>
            <p className="text-xs text-gray-500 mt-1">정상 범위: 60-100 bpm</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">평균 걸음 수</h3>
            <p className="text-2xl font-bold text-gray-900">7,200 걸음</p>
            <p className="text-xs text-gray-500 mt-1">권장: 6,000-10,000 걸음</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          * 실제 데이터는 API 연동 후 표시됩니다.
        </p>
      </div>

      {/* 비상 알림 버튼 (항상 표시) */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">비상 상황</h3>
            <p className="text-sm text-gray-500 mt-1">
              긴급한 상황이 발생했을 때 비상 알림을 전송할 수 있습니다.
            </p>
          </div>
          <button
            onClick={handleEmergencyAlert}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 font-medium"
          >
            <Bell className="h-5 w-5" />
            <span>비상 알림</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Monitoring

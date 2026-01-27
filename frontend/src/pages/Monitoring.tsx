import { useState, useEffect } from 'react'
import { Activity, Heart, Footprints, AlertTriangle, Bell, TrendingUp, TrendingDown, Droplet, Scale } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { healthAPI, guardiansAPI } from '../services/api'

/**
 * Monitoring 페이지
 * 부모님 건강 모니터링 (자식 모드 전용)
 */
const Monitoring = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [parentUserId, setParentUserId] = useState<number | null>(null)
  const [healthStats, setHealthStats] = useState<any>({
    blood_pressure: null,
    glucose: null,
    weight: null
  })

  // 부모 사용자 ID 가져오기 및 건강 기록 로드
  useEffect(() => {
    const loadParentHealthData = async () => {
      try {
        const managedRes = await guardiansAPI.getManagedUsers()
        const parentUser = managedRes.data.data?.managed_users?.[0]
        if (!parentUser) return
        
        const userId = parentUser.user_id || parentUser.id
        setParentUserId(userId)

        // 각 건강 기록 통계 가져오기
        const [bpRes, glucoseRes, weightRes] = await Promise.all([
          healthAPI.getStats('blood_pressure', 30, userId).catch(() => null),
          healthAPI.getStats('glucose', 30, userId).catch(() => null),
          healthAPI.getStats('weight', 30, userId).catch(() => null)
        ])

        setHealthStats({
          blood_pressure: bpRes?.data?.data || null,
          glucose: glucoseRes?.data?.data || null,
          weight: weightRes?.data?.data || null
        })
      } catch (error) {
        console.error('건강 데이터 로드 실패:', error)
      }
    }

    loadParentHealthData()
    const interval = setInterval(loadParentHealthData, 300000) // 5분마다 갱신
    return () => clearInterval(interval)
  }, [])

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

      {/* 건강 기록 카드 (혈압, 혈당, 체중) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">부모님 건강 기록</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 혈압 */}
          <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="h-5 w-5 text-red-600" />
              <h3 className="text-sm font-semibold text-red-900">혈압</h3>
            </div>
            {healthStats.blood_pressure?.latest_record ? (
              <>
                <p className="text-3xl font-bold text-red-900">
                  {healthStats.blood_pressure.latest_record.systolic}/{healthStats.blood_pressure.latest_record.diastolic}
                </p>
                <p className="text-xs text-red-700 mt-1">mmHg</p>
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-xs text-gray-600">
                    평균: {healthStats.blood_pressure.avg_systolic?.toFixed(0)}/{healthStats.blood_pressure.avg_diastolic?.toFixed(0)} mmHg
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(healthStats.blood_pressure.latest_record.measured_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">기록 없음</p>
            )}
          </div>

          {/* 혈당 */}
          <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Droplet className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-semibold text-blue-900">혈당</h3>
            </div>
            {healthStats.glucose?.latest_record ? (
              <>
                <p className="text-3xl font-bold text-blue-900">
                  {healthStats.glucose.latest_record.glucose}
                </p>
                <p className="text-xs text-blue-700 mt-1">mg/dL</p>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-600">
                    평균: {healthStats.glucose.avg_glucose?.toFixed(0)} mg/dL
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(healthStats.glucose.latest_record.measured_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">기록 없음</p>
            )}
          </div>

          {/* 체중 */}
          <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Scale className="h-5 w-5 text-green-600" />
              <h3 className="text-sm font-semibold text-green-900">체중</h3>
            </div>
            {healthStats.weight?.latest_record ? (
              <>
                <p className="text-3xl font-bold text-green-900">
                  {healthStats.weight.latest_record.weight}
                </p>
                <p className="text-xs text-green-700 mt-1">kg</p>
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-xs text-gray-600">
                    평균: {healthStats.weight.avg_weight?.toFixed(1)} kg
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(healthStats.weight.latest_record.measured_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">기록 없음</p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          💡 부모님께서 직접 기록하신 건강 정보입니다. (최근 30일 기준)
        </p>
      </div>

      {/* 건강 데이터 요약 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">활동 데이터 요약</h2>
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
          * 활동 데이터는 API 연동 후 표시됩니다.
        </p>
      </div>

    </div>
  )
}

export default Monitoring

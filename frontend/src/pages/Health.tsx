import { useState } from 'react'
import { Activity, Heart, Footprints, Download, FileText, TrendingUp } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * Health 페이지
 * 건강 데이터 시각화 및 리포트 (부모 모드)
 */
const Health = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  // 샘플 데이터 (API 연동 전)
  const weeklyHealthData = [
    { day: '월', steps: 8000, heartRate: 75, activity: 65 },
    { day: '화', steps: 7500, heartRate: 73, activity: 60 },
    { day: '수', steps: 9200, heartRate: 76, activity: 75 },
    { day: '목', steps: 6800, heartRate: 74, activity: 55 },
    { day: '금', steps: 8500, heartRate: 75, activity: 70 },
    { day: '토', steps: 6000, heartRate: 72, activity: 50 },
    { day: '일', steps: 5500, heartRate: 71, activity: 45 },
  ]

  const monthlyHealthData = [
    { week: '1주', steps: 52000, heartRate: 74, activity: 62 },
    { week: '2주', steps: 48000, heartRate: 73, activity: 58 },
    { week: '3주', steps: 55000, heartRate: 75, activity: 68 },
    { week: '4주', steps: 51000, heartRate: 74, activity: 64 },
  ]

  const currentData = period === 'weekly' ? weeklyHealthData : monthlyHealthData

  // 건강 요약 통계
  const healthSummary = {
    avgHeartRate: 74,
    avgSteps: 7200,
    avgActivity: 62,
    weeklyTrend: 'up' as 'up' | 'down' | 'stable'
  }

  /**
   * 리포트 생성
   */
  const handleGenerateReport = () => {
    // TODO: API로 리포트 생성
    alert('건강 리포트 생성 기능은 API 연동 후 사용 가능합니다.')
  }

  /**
   * 데이터 내보내기
   */
  const handleExportData = (format: 'csv' | 'json') => {
    // TODO: 데이터 내보내기
    alert(`${format.toUpperCase()} 형식으로 내보내기 기능은 API 연동 후 사용 가능합니다.`)
  }

  return (
    <div className="space-y-6">
      {/* 제목 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">내 건강 데이터 📈</h1>
        <p className="text-sm text-gray-500 mt-1">
          건강 데이터를 확인하고 리포트를 생성하세요
        </p>
      </div>

      {/* 건강 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" />
            <h3 className="text-sm font-medium text-gray-600">평균 심박수</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{healthSummary.avgHeartRate}</p>
          <p className="text-sm text-gray-500 mt-1">bpm (정상 범위)</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Footprints className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-600">평균 걸음 수</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {healthSummary.avgSteps.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-1">걸음/일</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="h-5 w-5 text-purple-500" />
            <h3 className="text-sm font-medium text-gray-600">평균 활동량</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{healthSummary.avgActivity}%</p>
          <div className="flex items-center mt-1">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <p className="text-sm text-gray-500">전주 대비 증가</p>
          </div>
        </div>
      </div>

      {/* 건강 데이터 차트 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">건강 데이터 추이</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-white text-gray-900 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p === 'weekly' ? '주간' : '월간'}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={currentData}>
            <defs>
              <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorHeartRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={period === 'weekly' ? 'day' : 'week'} />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="steps"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorSteps)"
              name="걸음 수"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="heartRate"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorHeartRate)"
              name="심박수 (bpm)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 활동량 차트 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">활동량 추이</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={period === 'weekly' ? 'day' : 'week'} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="activity"
              stroke="#8b5cf6"
              strokeWidth={2}
              name="활동량 (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 리포트 및 내보내기 */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">건강 리포트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleGenerateReport}
            className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FileText className="h-5 w-5" />
            <span>리포트 생성</span>
          </button>
          <div className="flex space-x-2">
            <button
              onClick={() => handleExportData('csv')}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>CSV 내보내기</span>
            </button>
            <button
              onClick={() => handleExportData('json')}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>JSON 내보내기</span>
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          * 리포트 생성 및 데이터 내보내기 기능은 API 연동 후 사용 가능합니다.
        </p>
      </div>
    </div>
  )
}

export default Health

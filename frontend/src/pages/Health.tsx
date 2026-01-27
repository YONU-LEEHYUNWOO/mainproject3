import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Heart, Activity, Droplet, Plus, TrendingUp, Calendar } from 'lucide-react'
import { healthAPI } from '../services/api'
import { useVoice } from '../hooks/useVoice'
import { VisualFeedback, AnimatedButton, LoadingOverlay } from '../components/VisualFeedback'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface HealthRecord {
  id: number
  record_type: string
  systolic?: number
  diastolic?: number
  glucose?: number
  weight?: number
  measured_at: string
  notes?: string
}

const Health = () => {
  const location = useLocation()
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'
  
  const [activeType, setActiveType] = useState<'blood_pressure' | 'glucose' | 'weight'>('blood_pressure')
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  
  // 입력 폼 상태
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    glucose: '',
    weight: '',
    notes: ''
  })

  const voiceEnabled = localStorage.getItem('voiceEnabled') !== 'false'
  const { announceSuccess, speak } = useVoice(voiceEnabled && mode === 'parent')

  // 건강 기록 불러오기
  const loadRecords = async () => {
    setIsLoading(true)
    try {
      const response = await healthAPI.getRecords({ record_type: activeType, limit: 30 })
      const data = response.data.data || response.data
      setRecords(data.records || [])
    } catch (error) {
      console.error('건강 기록 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [activeType])

  // 건강 기록 추가
  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      
      const data: any = {
        record_type: activeType,
        notes: formData.notes
      }

      if (activeType === 'blood_pressure') {
        if (!formData.systolic || !formData.diastolic) {
          alert('혈압 수치를 입력해주세요')
          return
        }
        data.systolic = parseInt(formData.systolic)
        data.diastolic = parseInt(formData.diastolic)
      } else if (activeType === 'glucose') {
        if (!formData.glucose) {
          alert('혈당 수치를 입력해주세요')
          return
        }
        data.glucose = parseFloat(formData.glucose)
      } else if (activeType === 'weight') {
        if (!formData.weight) {
          alert('체중을 입력해주세요')
          return
        }
        data.weight = parseFloat(formData.weight)
      }

      await healthAPI.createRecord(data)
      
      // 성공 피드백
      setFeedbackMessage('기록되었습니다! 잘하셨어요!')
      setShowFeedback(true)
      
      if (voiceEnabled && mode === 'parent') {
        announceSuccess('건강 기록이 저장되었습니다')
      }

      // 폼 초기화
      setFormData({ systolic: '', diastolic: '', glucose: '', weight: '', notes: '' })
      setShowForm(false)
      
      // 목록 새로고침
      await loadRecords()
      
    } catch (error: any) {
      alert(error.response?.data?.message || '기록 저장에 실패했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  // 차트 데이터 준비
  const chartData = records.slice(0, 10).reverse().map(record => {
    const date = new Date(record.measured_at)
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      value: activeType === 'blood_pressure' 
        ? record.systolic 
        : activeType === 'glucose' 
        ? record.glucose 
        : record.weight,
      label: activeType === 'blood_pressure' 
        ? `${record.systolic}/${record.diastolic}` 
        : activeType === 'glucose'
        ? `${record.glucose}mg/dL`
        : `${record.weight}kg`
    }
  })

  // 부모 모드 UI
  if (mode === 'parent') {
    return (
      <div className="space-y-6">
        <VisualFeedback
          show={showFeedback}
          type="success"
          message={feedbackMessage}
          onClose={() => setShowFeedback(false)}
        />
        
        <LoadingOverlay show={isLoading} message="처리 중입니다..." />

        {/* 제목 */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">❤️ 내 건강 관리</h1>
          <p className="text-xl text-gray-600 mt-2 font-medium">
            혈압, 혈당, 체중을 기록하고 관리하세요
          </p>
        </div>

        {/* 카테고리 선택 */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => { setActiveType('blood_pressure'); if (voiceEnabled) speak('혈압 기록') }}
            className={`btn-press-effect p-6 rounded-2xl transition-all transform hover:scale-105 ${
              activeType === 'blood_pressure'
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-2xl'
                : 'bg-white text-gray-700 border-2 border-gray-200'
            }`}
          >
            <Heart className="h-12 w-12 mx-auto mb-3" />
            <p className="text-2xl font-bold">혈압</p>
          </button>

          <button
            onClick={() => { setActiveType('glucose'); if (voiceEnabled) speak('혈당 기록') }}
            className={`btn-press-effect p-6 rounded-2xl transition-all transform hover:scale-105 ${
              activeType === 'glucose'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-2xl'
                : 'bg-white text-gray-700 border-2 border-gray-200'
            }`}
          >
            <Droplet className="h-12 w-12 mx-auto mb-3" />
            <p className="text-2xl font-bold">혈당</p>
          </button>

          <button
            onClick={() => { setActiveType('weight'); if (voiceEnabled) speak('체중 기록') }}
            className={`btn-press-effect p-6 rounded-2xl transition-all transform hover:scale-105 ${
              activeType === 'weight'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl'
                : 'bg-white text-gray-700 border-2 border-gray-200'
            }`}
          >
            <Activity className="h-12 w-12 mx-auto mb-3" />
            <p className="text-2xl font-bold">체중</p>
          </button>
        </div>

        {/* 입력 폼 */}
        {!showForm ? (
          <AnimatedButton
            onClick={() => setShowForm(true)}
            variant="primary"
            className="w-full py-8 text-2xl"
          >
            <Plus className="h-8 w-8 mr-3" />
            새로 기록하기
          </AnimatedButton>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-blue-200">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              {activeType === 'blood_pressure' ? '혈압 측정' : activeType === 'glucose' ? '혈당 측정' : '체중 측정'}
            </h2>

            {activeType === 'blood_pressure' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-3">수축기 (높은 수치)</label>
                  <input
                    type="number"
                    value={formData.systolic}
                    onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
                    className="w-full px-6 py-4 text-3xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                    placeholder="120"
                  />
                </div>
                <div>
                  <label className="block text-xl font-bold text-gray-700 mb-3">이완기 (낮은 수치)</label>
                  <input
                    type="number"
                    value={formData.diastolic}
                    onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
                    className="w-full px-6 py-4 text-3xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                    placeholder="80"
                  />
                </div>
              </div>
            )}

            {activeType === 'glucose' && (
              <div>
                <label className="block text-xl font-bold text-gray-700 mb-3">혈당 (mg/dL)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.glucose}
                  onChange={(e) => setFormData({ ...formData, glucose: e.target.value })}
                  className="w-full px-6 py-4 text-3xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                  placeholder="100"
                />
              </div>
            )}

            {activeType === 'weight' && (
              <div>
                <label className="block text-xl font-bold text-gray-700 mb-3">체중 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-6 py-4 text-3xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                  placeholder="70"
                />
              </div>
            )}

            <div className="mt-6">
              <label className="block text-xl font-bold text-gray-700 mb-3">메모 (선택)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-6 py-4 text-xl border-4 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
                placeholder="예: 아침 식사 후, 컨디션 좋음"
                rows={3}
              />
            </div>

            <div className="flex gap-4 mt-8">
              <AnimatedButton
                onClick={handleSubmit}
                variant="success"
                className="flex-1 py-6 text-2xl"
              >
                ✓ 기록하기
              </AnimatedButton>
              <AnimatedButton
                onClick={() => setShowForm(false)}
                variant="danger"
                className="px-8 py-6 text-2xl"
              >
                ✕
              </AnimatedButton>
            </div>
          </div>
        )}

        {/* 최근 기록 */}
        {records.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              최근 기록
            </h3>
            
            {/* 간단한 차트 */}
            {chartData.length > 0 && (
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" style={{ fontSize: '14px' }} />
                    <YAxis style={{ fontSize: '14px' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="space-y-3">
              {records.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-xl font-bold">
                      {activeType === 'blood_pressure' && `${record.systolic}/${record.diastolic}`}
                      {activeType === 'glucose' && `${record.glucose} mg/dL`}
                      {activeType === 'weight' && `${record.weight} kg`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(record.measured_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // 자식 모드는 모니터링 페이지에서 처리
  return (
    <div className="text-center py-12">
      <p className="text-lg text-gray-600">부모님의 건강 기록은 모니터링 페이지에서 확인하세요</p>
    </div>
  )
}

export default Health

import { useState, useEffect } from 'react'
import { X, Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

interface MedicineAlarmFormData {
  medicine_name: string
  dosage: string
  time_1: string
  time_2?: string
  time_3?: string
  time_4?: string
  start_date: string
  end_date?: string
  reminder_minutes: number
  morning: boolean
  lunch: boolean
  evening: boolean
  current_stock: number
  reorder_threshold: number
  prescription_info?: string
  is_active?: boolean  // 활성화 상태 추가
}

interface MedicineAlarmFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: MedicineAlarmFormData) => Promise<void>
  initialData?: MedicineAlarmFormData | null
}

/**
 * 약 알림 등록/수정 폼 컴포넌트
 */
export const MedicineAlarmForm: React.FC<MedicineAlarmFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const [formData, setFormData] = useState<MedicineAlarmFormData>({
    medicine_name: '',
    dosage: '',
    time_1: '',
    time_2: '',
    time_3: '',
    time_4: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    reminder_minutes: 15,
    morning: false,
    lunch: false,
    evening: false,
    current_stock: 0,
    reorder_threshold: 5,
    prescription_info: '',
    is_active: true  // 약 등록 시 자동으로 활성화
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 음성 인식 상태 (각 필드별)
  const [activeField, setActiveField] = useState<'medicine_name' | 'dosage' | 'prescription_info' | null>(null)
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition()

  // 음성 인식 결과 처리
  useEffect(() => {
    if (transcript && activeField) {
      setFormData(prev => ({
        ...prev,
        [activeField]: transcript
      }))
    }
  }, [transcript, activeField])

  // 음성 인식 종료 시 초기화
  useEffect(() => {
    if (!isListening && activeField) {
      resetTranscript()
      setActiveField(null)
    }
  }, [isListening, activeField, resetTranscript])

  const handleVoiceToggle = (field: 'medicine_name' | 'dosage' | 'prescription_info') => {
    if (isListening && activeField === field) {
      stopListening()
      setActiveField(null)
    } else {
      setActiveField(field)
      startListening()
    }
  }

  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      // undefined 값을 기본값으로 대체하여 controlled input 유지
      setFormData({
        medicine_name: initialData.medicine_name || '',
        dosage: initialData.dosage || '',
        time_1: initialData.time_1 || '',
        time_2: initialData.time_2 || '',
        time_3: initialData.time_3 || '',
        time_4: initialData.time_4 || '',
        start_date: initialData.start_date || new Date().toISOString().split('T')[0],
        end_date: initialData.end_date || '',
        reminder_minutes: initialData.reminder_minutes ?? 15,
        morning: initialData.morning ?? false,
        lunch: initialData.lunch ?? false,
        evening: initialData.evening ?? false,
        current_stock: initialData.current_stock ?? 0,
        reorder_threshold: initialData.reorder_threshold ?? 5,
        prescription_info: initialData.prescription_info || '',
        is_active: initialData.is_active ?? true
      })
    } else {
      setFormData({
        medicine_name: '',
        dosage: '',
        time_1: '',
        time_2: '',
        time_3: '',
        time_4: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        reminder_minutes: 15,
        morning: false,
        lunch: false,
        evening: false,
        current_stock: 0,
        reorder_threshold: 5,
        prescription_info: '',
        is_active: true  // 약 등록 시 자동으로 활성화
      })
    }
    setError(null)
  }, [initialData, isOpen])

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // 유효성 검사
    if (!formData.medicine_name.trim()) {
      setError('약 이름을 입력해주세요.')
      return
    }
    if (!formData.dosage.trim()) {
      setError('복용량을 입력해주세요.')
      return
    }
    if (!formData.time_1) {
      setError('최소 1개의 복용 시간을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      // 빈 시간 칸은 undefined로 전송 (빈 문자열 제거)
      const submitData = {
        ...formData,
        time_2: formData.time_2 || undefined,
        time_3: formData.time_3 || undefined,
        time_4: formData.time_4 || undefined,
        end_date: formData.end_date || undefined
      }
      await onSubmit(submitData)
      // 음성 인식 정리
      if (isListening) stopListening()
      resetTranscript()
      setActiveField(null)
      onClose()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '약 알림 저장에 실패했습니다.'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    // 음성 인식 정리
    if (isListening) stopListening()
    resetTranscript()
    setActiveField(null)
    onClose()
  }

  // 컴포넌트 언마운트 시 음성 인식 정리
  useEffect(() => {
    return () => {
      if (isListening) {
        stopListening()
      }
    }
  }, [isListening, stopListening])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {initialData ? '약 알림 수정' : '약 알림 등록'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 약 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                <span>약 이름 <span className="text-red-500">*</span></span>
                {isSupported && (
                  <button
                    type="button"
                    onClick={() => handleVoiceToggle('medicine_name')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all text-xs font-semibold shadow-sm ${isListening && activeField === 'medicine_name'
                        ? 'bg-red-500 text-white animate-pulse shadow-red-200 ring-2 ring-red-300'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                      }`}
                    title={isListening && activeField === 'medicine_name' ? '음성 인식 중지' : '음성으로 입력'}
                  >
                    {isListening && activeField === 'medicine_name' ? (
                      <>
                        <MicOff size={14} />
                        <span>중지</span>
                      </>
                    ) : (
                      <>
                        <Mic size={14} />
                        <span>음성 입력</span>
                      </>
                    )}
                  </button>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.medicine_name}
                  onChange={(e) => setFormData({ ...formData, medicine_name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${isListening && activeField === 'medicine_name'
                      ? 'border-red-500 ring-2 ring-red-200 bg-red-50'
                      : 'border-gray-300'
                    }`}
                  placeholder="예: 혈압약 (음성 가능)"
                  required
                />
              </div>
            </div>

            {/* 복용량 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                <span>복용량 <span className="text-red-500">*</span></span>
                {isSupported && (
                  <button
                    type="button"
                    onClick={() => handleVoiceToggle('dosage')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all text-xs font-semibold shadow-sm ${isListening && activeField === 'dosage'
                        ? 'bg-red-500 text-white animate-pulse shadow-red-200 ring-2 ring-red-300'
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                      }`}
                    title={isListening && activeField === 'dosage' ? '음성 인식 중지' : '음성으로 입력'}
                  >
                    {isListening && activeField === 'dosage' ? (
                      <>
                        <MicOff size={14} />
                        <span>중지</span>
                      </>
                    ) : (
                      <>
                        <Mic size={14} />
                        <span>음성 입력</span>
                      </>
                    )}
                  </button>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${isListening && activeField === 'dosage'
                      ? 'border-red-500 ring-2 ring-red-200 bg-red-50'
                      : 'border-gray-300'
                    }`}
                  placeholder="예: 1정 (음성 가능)"
                  required
                />
              </div>
            </div>

            {/* 복용 시간 (최대 4개) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  복용 시간 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2">
                  {[
                    { label: '아침식후', time: '08:00', field: 'morning' },
                    { label: '점심식후', time: '12:30', field: 'lunch' },
                    { label: '저녁식후', time: '18:30', field: 'evening' }
                  ].map((btn, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        // 비어있는 첫 번째 시간 칸 찾기
                        const newFormData = { ...formData, [btn.field]: true }
                        if (!formData.time_1) {
                          newFormData.time_1 = btn.time
                        } else if (!formData.time_2) {
                          newFormData.time_2 = btn.time
                        } else if (!formData.time_3) {
                          newFormData.time_3 = btn.time
                        } else if (!formData.time_4) {
                          newFormData.time_4 = btn.time
                        }
                        setFormData(newFormData)
                      }}
                      className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={formData.time_1}
                  onChange={(e) => setFormData({ ...formData, time_1: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  type="time"
                  value={formData.time_2 || ''}
                  onChange={(e) => setFormData({ ...formData, time_2: e.target.value || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="선택사항"
                />
                <input
                  type="time"
                  value={formData.time_3 || ''}
                  onChange={(e) => setFormData({ ...formData, time_3: e.target.value || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="선택사항"
                />
                <input
                  type="time"
                  value={formData.time_4 || ''}
                  onChange={(e) => setFormData({ ...formData, time_4: e.target.value || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="선택사항"
                />
              </div>
            </div>

            {/* 복용 기간 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일 (선택사항)
                </label>
                <input
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 복용 시간 선택 (아침/점심/저녁) */}
            <div className="flex space-x-4 py-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.morning} onChange={(e) => setFormData({ ...formData, morning: e.target.checked })} className="rounded text-blue-500" />
                <span className="text-sm">아침</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.lunch} onChange={(e) => setFormData({ ...formData, lunch: e.target.checked })} className="rounded text-blue-500" />
                <span className="text-sm">점심</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.evening} onChange={(e) => setFormData({ ...formData, evening: e.target.checked })} className="rounded text-blue-500" />
                <span className="text-sm">저녁</span>
              </label>
            </div>

            {/* 재고 관리 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">현재 재고 (개)</label>
                <input
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">경고 재고 기준</label>
                <input
                  type="number"
                  value={formData.reorder_threshold}
                  onChange={(e) => setFormData({ ...formData, reorder_threshold: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 처방전 정보 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                <span>처방전 정보 (텍스트)</span>
                {isSupported && (
                  <button
                    type="button"
                    onClick={() => handleVoiceToggle('prescription_info')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all text-xs font-semibold shadow-sm ${isListening && activeField === 'prescription_info'
                      ? 'bg-red-500 text-white animate-pulse shadow-red-200 ring-2 ring-red-300'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                      }`}
                    title={isListening && activeField === 'prescription_info' ? '음성 인식 중지' : '음성으로 입력'}
                  >
                    {isListening && activeField === 'prescription_info' ? (
                      <>
                        <MicOff size={14} />
                        <span>중지</span>
                      </>
                    ) : (
                      <>
                        <Mic size={14} />
                        <span>음성 입력</span>
                      </>
                    )}
                  </button>
                )}
              </label>
              <textarea
                value={formData.prescription_info}
                onChange={(e) => setFormData({ ...formData, prescription_info: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${isListening && activeField === 'prescription_info'
                  ? 'border-red-500 ring-4 ring-red-200 bg-red-50'
                  : 'border-gray-300'
                  }`}
                rows={3}
                placeholder="처방전 내용을 입력하거나 붙여넣으세요 (음성 가능)."
              />
            </div>

            {/* 알림 시간 (몇 분 전) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                알림 시간 (몇 분 전)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={formData.reminder_minutes}
                onChange={(e) => setFormData({ ...formData, reminder_minutes: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">복용 시간 몇 분 전에 알림을 받을지 설정하세요.</p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '저장 중...' : initialData ? '수정' : '등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

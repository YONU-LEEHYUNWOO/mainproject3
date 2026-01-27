import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Clock, Loader2, PauseCircle, XCircle, Package } from 'lucide-react'
import { medicineAPI } from '../services/api'
import { useVoice } from '../hooks/useVoice'
import { VisualFeedback } from './VisualFeedback'

interface MedicineItemProps {
  alarm: {
    id: number
    medicine_name: string
    dosage: string
    time_1: string
    time_2?: string
    time_3?: string
    time_4?: string
    last_taken?: string
    next_reminder?: string
    is_taken?: boolean
    current_stock?: number
    reorder_threshold?: number
  }
  onMarkTaken?: (alarmId: number) => void
}

/**
 * 약 복용 아이템 컴포넌트 (부모 모드용)
 * 복용 완료 버튼 포함
 */
export const MedicineItem: React.FC<MedicineItemProps> = ({ alarm, onMarkTaken }) => {
  const [completedTimes, setCompletedTimes] = useState<Set<string>>(new Set())
  const [markingTime, setMarkingTime] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPostponeModal, setShowPostponeModal] = useState<string | null>(null)
  const [showSkipModal, setShowSkipModal] = useState<string | null>(null)
  const [skipReason, setSkipReason] = useState<string>('')
  const [skipDetail, setSkipDetail] = useState<string>('')
  const [showSuccessFeedback, setShowSuccessFeedback] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  
  const voiceEnabled = localStorage.getItem('voiceEnabled') !== 'false'
  const { announceMedicineTaken, announceSuccess } = useVoice(voiceEnabled)

  // alarm prop이 변경될 때 상태 동기화
  useEffect(() => {
    const dailyTaken = (alarm as any).daily_taken_times
    if (dailyTaken) {
      setCompletedTimes(new Set(dailyTaken.split(',')))
    } else {
      setCompletedTimes(new Set())
    }
  }, [alarm])

  const getTimes = () => {
    const times: string[] = []
    if (alarm.time_1) times.push(alarm.time_1)
    if (alarm.time_2) times.push(alarm.time_2)
    if (alarm.time_3) times.push(alarm.time_3)
    if (alarm.time_4) times.push(alarm.time_4)
    return times
  }

  const handleTimeClick = async (time: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (completedTimes.has(time) || markingTime) return

    setMarkingTime(time)
    setError(null)

    try {
      await medicineAPI.markTaken(alarm.id, time)
      setCompletedTimes(prev => new Set([...prev, time]))

      // 시각적 피드백
      setFeedbackMessage('약을 드셨네요! 잘하셨어요!')
      setShowSuccessFeedback(true)
      
      // 음성 칭찬
      if (voiceEnabled) {
        announceMedicineTaken()
      }

      if (onMarkTaken) {
        onMarkTaken(alarm.id)
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '복용 기록에 실패했습니다.'
      setError(errorMessage)
      setTimeout(() => setError(null), 3000)
      console.error('복용 기록 오류:', error)
    } finally {
      setMarkingTime(null)
    }
  }

  // 미루기 처리
  const handlePostpone = async (time: string, minutes: number) => {
    try {
      await medicineAPI.postponeAlarm(alarm.id, minutes)
      setShowPostponeModal(null)
      
      // 시각적 피드백
      setFeedbackMessage(`${minutes}분 후에 다시 알려드릴게요`)
      setShowSuccessFeedback(true)
      
      // 음성 안내
      if (voiceEnabled) {
        announceSuccess(`${minutes}분 후에 다시 알려드립니다`)
      }
      
      if (onMarkTaken) onMarkTaken(alarm.id)
    } catch (error: any) {
      setError(error.response?.data?.message || '미루기에 실패했습니다.')
      setTimeout(() => setError(null), 3000)
    }
  }

  // 건너뛰기 처리
  const handleSkip = async (time: string) => {
    if (!skipReason) {
      setError('사유를 선택해주세요.')
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      await medicineAPI.skipAlarm(alarm.id, time, skipReason, skipDetail || undefined)
      setShowSkipModal(null)
      setSkipReason('')
      setSkipDetail('')
      if (onMarkTaken) onMarkTaken(alarm.id)
    } catch (error: any) {
      setError(error.response?.data?.message || '건너뛰기에 실패했습니다.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const times = getTimes()

  return (
    <>
      <VisualFeedback
        show={showSuccessFeedback}
        type="success"
        message={feedbackMessage}
        onClose={() => setShowSuccessFeedback(false)}
      />
      
      <div className="pr-24">
        <p className="text-base text-gray-600 mb-3">복용량: {alarm.dosage}</p>

      <div className="space-y-2">
        {times.map((time, index) => {
          const isCompleted = completedTimes.has(time)
          const isMarking = markingTime === time

          return (
            <div key={index}>
              <div
                onClick={(e) => handleTimeClick(time, e)}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${isCompleted
                  ? 'bg-green-50 border-green-300'
                  : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                  <span className={`text-lg font-bold ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {time}
                  </span>
                </div>

                <div>
                  {isMarking ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  ) : isCompleted ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : (
                    <Circle className="h-8 w-8 text-gray-400" />
                  )}
                </div>
              </div>

              {!isCompleted && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowPostponeModal(time) }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <PauseCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">미루기</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowSkipModal(time) }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-semibold">건너뛰기</span>
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-600 font-bold mt-2">{error}</p>}

      {/* 미루기 모달 */}
      {showPostponeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPostponeModal(null)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">얼마나 미루시겠어요?</h3>
            <div className="space-y-2">
              {[10, 30, 60].map(min => (
                <button
                  key={min}
                  onClick={() => handlePostpone(showPostponeModal, min)}
                  className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                >
                  {min}분 후
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPostponeModal(null)}
              className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 건너뛰기 모달 */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSkipModal(null)}>
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">건너뛰기 사유를 선택해주세요</h3>
            <div className="space-y-3">
              <select
                value={skipReason}
                onChange={(e) => setSkipReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">사유 선택</option>
                <option value="side_effect">부작용</option>
                <option value="not_feeling_well">속이 좋지 않음</option>
                <option value="forgot">깜빡함</option>
                <option value="other">기타</option>
              </select>

              {skipReason === 'other' && (
                <input
                  type="text"
                  value={skipDetail}
                  onChange={(e) => setSkipDetail(e.target.value)}
                  placeholder="상세 사유를 입력하세요"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              )}

              <button
                onClick={() => handleSkip(showSkipModal)}
                className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
              >
                건너뛰기 확인
              </button>
              <button
                onClick={() => { setShowSkipModal(null); setSkipReason(''); setSkipDetail('') }}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}

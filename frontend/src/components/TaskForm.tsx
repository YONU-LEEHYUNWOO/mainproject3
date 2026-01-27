import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Calendar, Clock, MapPin, Flag, Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: any) => void
  selectedDate?: Date
  initialData?: any // 추가: 수정을 위한 초기 데이터
  currentLocation?: { latitude: number; longitude: number } | null
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  initialData,
  currentLocation
}) => {
  // 로컬 날짜 문자열 생성 함수
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: selectedDate ? formatLocalDate(selectedDate) : '',
    time: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    priority: 2, // 보통
    category: '일반'
  })

  // 장소 검색 상태
  const [locationQuery, setLocationQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const searchIdRef = useRef(0)

  // 장소 검색 함수
  const searchPlaces = useCallback((query: string) => {
    if (!query.trim() || !window.kakao || !window.kakao.maps) {
      setSearchResults([])
      return
    }

    const currentSearchId = ++searchIdRef.current
    setIsSearching(true)
    const ps = new window.kakao.maps.services.Places()

    const searchOptions: any = {
      size: 15
    }

    // 부모/자녀 모드에 따라 주입된 currentLocation 사용
    if (currentLocation) {
      searchOptions.location = new window.kakao.maps.LatLng(
        currentLocation.latitude,
        currentLocation.longitude
      )
      searchOptions.sort = window.kakao.maps.services.SortBy.ACCURACY
      console.log(`🔍 [${currentSearchId}] TaskForm 주입된 위치 기반 검색:`, currentLocation.latitude, currentLocation.longitude)

      ps.keywordSearch(query, (data: any[], status: any) => {
        if (currentSearchId !== searchIdRef.current) return

        if (status === window.kakao.maps.services.Status.OK) {
          setSearchResults(data)
          setShowResults(true)
        } else {
          setSearchResults([])
        }
        setIsSearching(false)
      }, searchOptions)
    } else {
      // 위치 정보 없으면 전국 검색
      console.log(`🔍 [${currentSearchId}] TaskForm 전국 검색 (위치 정보 없음)`)
      ps.keywordSearch(query, (data: any[], status: any) => {
        if (currentSearchId !== searchIdRef.current) return

        if (status === window.kakao.maps.services.Status.OK) {
          setSearchResults(data)
          setShowResults(true)
        } else {
          setSearchResults([])
        }
        setIsSearching(false)
      }, searchOptions)
    }
  }, [currentLocation])

  // 음성 인식 상태 (각 필드별)
  const [activeField, setActiveField] = useState<'title' | 'description' | 'location' | null>(null)
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition()

  // 음성 인식 결과 처리 (실시간)
  useEffect(() => {
    if (transcript && activeField) {
      if (activeField === 'location') {
        setLocationQuery(transcript)
      } else {
        setFormData(prev => ({
          ...prev,
          [activeField]: transcript
        }))
      }
    }
  }, [transcript, activeField])

  // 음성 인식 종료 시 처리
  useEffect(() => {
    if (!isListening && activeField) {
      if (activeField === 'location' && transcript) {
        searchPlaces(transcript)
        setShowResults(true)
      }
      resetTranscript()
      setActiveField(null)
    }
  }, [isListening, activeField, resetTranscript, searchPlaces, transcript])

  const handleVoiceToggle = (field: 'title' | 'description' | 'location') => {
    if (isListening && activeField === field) {
      stopListening()
    } else {
      setActiveField(field)
      startListening()
    }
  }

  // 수정 모드일 경우 초기 데이터 로드
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          date: initialData.date ? initialData.date.split('T')[0] : (selectedDate ? formatLocalDate(selectedDate) : ''),
          time: initialData.time || '',
          location: initialData.location || '',
          latitude: initialData.latitude || null,
          longitude: initialData.longitude || null,
          priority: initialData.priority || 2,
          category: initialData.category || '일반'
        })
        setLocationQuery(initialData.location || '')
      } else {
        setFormData({
          title: '',
          description: '',
          date: selectedDate ? formatLocalDate(selectedDate) : '',
          time: '',
          location: '',
          latitude: null,
          longitude: null,
          priority: 2,
          category: '일반'
        })
        setLocationQuery('')
      }
    }
  }, [isOpen, initialData, selectedDate])

  // 장소 선택 핸들러
  const handlePlaceSelect = (place: any) => {
    setFormData(prev => ({
      ...prev,
      location: place.place_name,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x)
    }))
    setLocationQuery(place.place_name)
    setShowResults(false)
    setSearchResults([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    // 백엔드 스키마에 맞게 데이터 변환
    const submitData: any = {
      title: formData.title,
      description: formData.description || '',
      date: formData.date, // "YYYY-MM-DD" 형식 유지
      time: formData.time && formData.time.trim() ? formData.time.trim() : null, // 시간 전송
      location: formData.location || '',
      latitude: formData.latitude,
      longitude: formData.longitude,
      priority: Number(formData.priority), // string → number
      completed: false, // 명시적으로 추가
      reminder_minutes: 0, // 명시적으로 추가
      category: formData.category
    }

    console.log('변환된 데이터:', submitData)
    console.log('selectedDate:', selectedDate)
    console.log('formData.date:', formData.date)
    onSubmit(submitData)
    handleClose()
  }

  const handleClose = () => {
    // 음성 인식 중지 및 초기화
    if (isListening) {
      stopListening()
    }
    resetTranscript()
    setActiveField(null)

    setFormData({
      title: '',
      description: '',
      date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
      time: '',
      location: '',
      latitude: null,
      longitude: null,
      priority: 2,
      category: '일반'
    })
    setLocationQuery('')
    setSearchResults([])
    setShowResults(false)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {initialData ? '일정 수정' : '새 일정 추가'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
              <span>제목 *</span>
              {isSupported && (
                <button
                  type="button"
                  onClick={() => handleVoiceToggle('title')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all text-xs font-semibold shadow-sm ${isListening && activeField === 'title'
                    ? 'bg-red-500 text-white animate-pulse shadow-red-200 ring-2 ring-red-300'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                    }`}
                  title={isListening && activeField === 'title' ? '음성 인식 중지' : '음성으로 입력'}
                >
                  {isListening && activeField === 'title' ? (
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
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${isListening && activeField === 'title'
                  ? 'border-red-500 ring-2 ring-red-200 bg-red-50'
                  : 'border-gray-300'
                  }`}
                placeholder="일정 제목을 입력하세요 (음성 가능)"
                required
              />
              {/* 구형 STT 버튼 제거됨 (레이블의 타원형 버튼으로 대체) */}
            </div>
          </div>

          {/* 날짜와 시간 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" />
                날짜 *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock size={14} className="inline mr-1" />
                시간
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 장소 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
              <span className="flex items-center"><MapPin size={14} className="mr-1" />장소</span>
              {isSupported && (
                <button
                  type="button"
                  onClick={() => handleVoiceToggle('location')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all text-xs font-semibold shadow-sm ${isListening && activeField === 'location'
                    ? 'bg-red-500 text-white animate-pulse shadow-red-200 ring-2 ring-red-300'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                    }`}
                  title={isListening && activeField === 'location' ? '음성 인식 중지' : '음성으로 입력'}
                >
                  {isListening && activeField === 'location' ? (
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
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value)
                  if (e.target.value.trim()) {
                    searchPlaces(e.target.value)
                  } else {
                    setSearchResults([])
                    setShowResults(false)
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true)
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${isListening && activeField === 'location'
                  ? 'border-red-500 ring-2 ring-red-200 bg-red-50'
                  : 'border-gray-300'
                  }`}
                placeholder="장소를 검색하세요 (예: 병원, 약국)"
              />
              {/* 구형 STT 버튼 제거됨 (레이블의 타원형 버튼으로 대체) */}

              {/* 검색 결과 드롭다운 */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((place, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handlePlaceSelect(place)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-medium text-sm text-gray-900">{place.place_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{place.category_group_name}</div>
                      <div className="text-xs text-gray-600 mt-0.5">{place.road_address_name || place.address_name}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* 로딩 표시 */}
              {isSearching && (
                <div className="absolute right-3 top-2.5">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* 선택된 장소 표시 */}
            {formData.location && formData.latitude && (
              <div className="mt-2 text-sm text-green-600 flex items-center">
                <MapPin size={14} className="mr-1" />
                선택됨: {formData.location}
              </div>
            )}
          </div>

          {/* 우선순위 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Flag size={14} className="inline mr-1" />
              우선순위
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>낮음</option>
              <option value={2}>보통</option>
              <option value={3}>높음</option>
            </select>
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
              <span>설명</span>
              {isSupported && (
                <button
                  type="button"
                  onClick={() => handleVoiceToggle('description')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all text-xs font-semibold shadow-sm ${isListening && activeField === 'description'
                    ? 'bg-red-500 text-white animate-pulse shadow-red-200 ring-2 ring-red-300'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                    }`}
                  title={isListening && activeField === 'description' ? '음성 인식 중지' : '음성으로 입력'}
                >
                  {isListening && activeField === 'description' ? (
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
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none transition-all ${isListening && activeField === 'description'
                ? 'border-red-500 ring-2 ring-red-200 bg-red-50'
                : 'border-gray-300'
                }`}
              rows={3}
              placeholder="일정에 대한 자세한 설명을 입력하세요 (음성 가능)"
            />
          </div>

          {/* 버튼들 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              {initialData ? '수정 완료' : '추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
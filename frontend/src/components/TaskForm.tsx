import { useState } from 'react'
import { X, Calendar, Clock, MapPin, Flag } from 'lucide-react'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: any) => void
  selectedDate?: Date
}

export const TaskForm: React.FC<TaskFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedDate
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

  // 장소 검색 함수
  const searchPlaces = (query: string) => {
    if (!query.trim() || !window.kakao || !window.kakao.maps) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const ps = new window.kakao.maps.services.Places()

    const searchOptions: any = {
      size: 10
    }

    // 현재 위치 기반 검색 (가능한 경우)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          searchOptions.location = new window.kakao.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          )
          searchOptions.radius = 5000 // 5km

          ps.keywordSearch(query, (data: any[], status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              setSearchResults(data)
              setShowResults(true)
            } else {
              setSearchResults([])
            }
            setIsSearching(false)
          }, searchOptions)
        },
        () => {
          // 위치 정보 없으면 전국 검색
          ps.keywordSearch(query, (data: any[], status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              setSearchResults(data)
              setShowResults(true)
            } else {
              setSearchResults([])
            }
            setIsSearching(false)
          }, searchOptions)
        }
      )
    } else {
      // Geolocation 미지원 시 전국 검색
      ps.keywordSearch(query, (data: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setSearchResults(data)
          setShowResults(true)
        } else {
          setSearchResults([])
        }
        setIsSearching(false)
      }, searchOptions)
    }
  }

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">새 일정 추가</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="일정 제목을 입력하세요"
              required
            />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin size={14} className="inline mr-1" />
              장소
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="장소를 검색하세요 (예: 병원, 약국)"
              />

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
              placeholder="일정에 대한 자세한 설명을 입력하세요"
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
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
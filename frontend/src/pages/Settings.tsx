import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, BellOff, Clock, Heart, Pill, Utensils, ShoppingCart, Home, MapPin, Star, Trash2, Search, Plus } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { NotificationPermissionModal } from '../components/NotificationPermissionModal'
import api, { favoritesAPI } from '../services/api'

/**
 * Settings 페이지
 * 알림 설정 관리
 */
const Settings = () => {
  const location = useLocation()
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'

  const { permission, settings, requestPermission, saveSettings } = useNotifications()
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [advanceMinutes, setAdvanceMinutes] = useState(settings.advanceMinutes)

  // 자주 가는 장소 상태
  const [favorites, setFavorites] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('hospital')
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [managedUserId, setManagedUserId] = useState<number | null>(null)

  // 초기 데이터 로드
  useEffect(() => {
    loadFavorites()
    if (permission === 'default' && !localStorage.getItem('notification_permission_asked')) {
      localStorage.setItem('notification_permission_asked', 'true')
    }
  }, [permission])

  const loadFavorites = async () => {
    try {
      let targetId: number | undefined = undefined
      if (mode === 'child') {
        const guardiansRes = await api.get('/api/guardians/')
        const guardians = guardiansRes.data.guardians || []
        const target = guardians.find((g: any) => g.is_primary && g.guardian_user_id) ||
          guardians.find((g: any) => g.guardian_user_id)
        if (target) {
          targetId = target.guardian_user_id
          setManagedUserId(targetId as number)
        }
      }
      const response = await favoritesAPI.getFavorites(targetId)
      setFavorites(response.data || [])
    } catch (error) {
      console.error('즐겨찾기 로드 오류:', error)
    }
  }

  const handleSearch = (query: string) => {
    if (!query.trim() || !window.kakao || !window.kakao.maps) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const ps = new window.kakao.maps.services.Places()
    const searchOptions: any = { size: 10 }

    // 위치 기반 검색 시도
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          searchOptions.location = new window.kakao.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          )
          searchOptions.radius = 5000
          ps.keywordSearch(query, (data: any[], status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              setSearchResults(data)
              setShowSearchResults(true)
            }
            setIsSearching(false)
          }, searchOptions)
        },
        () => {
          ps.keywordSearch(query, (data: any[], status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
              setSearchResults(data)
              setShowSearchResults(true)
            }
            setIsSearching(false)
          }, searchOptions)
        }
      )
    } else {
      ps.keywordSearch(query, (data: any[], status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setSearchResults(data)
          setShowSearchResults(true)
        }
        setIsSearching(false)
      }, searchOptions)
    }
  }

  const handleAddFavorite = async (place: any) => {
    setIsActionLoading(true)
    try {
      await favoritesAPI.createFavorite({
        name: place.place_name,
        category: activeCategory,
        address: place.road_address_name || place.address_name,
        latitude: parseFloat(place.y),
        longitude: parseFloat(place.x),
        is_primary: favorites.filter((f: { category: string }) => f.category === activeCategory).length === 0
      }, managedUserId || undefined)
      setSearchQuery('')
      setShowSearchResults(false)
      setSearchResults([])
      await loadFavorites()
    } catch (error) {
      console.error('장소 추가 오류:', error)
      alert('장소 추가 중 오류가 발생했습니다.')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleDeleteFavorite = async (id: number) => {
    if (!confirm('이 장소를 삭제하시겠습니까?')) return
    setIsActionLoading(true)
    try {
      await favoritesAPI.deleteFavorite(id)
      await loadFavorites()
    } catch (error) {
      console.error('장소 삭제 오류:', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleSetPrimary = async (id: number) => {
    setIsActionLoading(true)
    try {
      await favoritesAPI.setPrimary(id)
      await loadFavorites()
    } catch (error) {
      console.error('기본 장소 설정 오류:', error)
    } finally {
      setIsActionLoading(false)
    }
  }

  /**
   * 알림 설정 토글
   */
  const handleToggleNotifications = () => {
    if (permission !== 'granted') {
      setShowPermissionModal(true)
    } else {
      saveSettings({ enabled: !settings.enabled })
    }
  }

  /**
   * 알림 시간 변경
   */
  const handleAdvanceMinutesChange = (minutes: number) => {
    setAdvanceMinutes(minutes)
    saveSettings({ advanceMinutes: minutes })
  }

  /**
   * 권한 요청 핸들러
   */
  const handleRequestPermission = async () => {
    const granted = await requestPermission()
    if (granted) {
      saveSettings({ enabled: true })
    }
    return granted
  }

  return (
    <div className="space-y-6">
      {/* 모드별 제목 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'parent' ? '내 설정 👴' : '부모님 관리 설정 👨'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'parent'
            ? '계정 정보와 알림 설정을 관리하세요'
            : '부모님 계정 관리 및 알림 설정을 변경하세요'}
        </p>
      </div>

      {/* 알림 설정 섹션 */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">알림 설정</h2>

          <div className="space-y-6">
            {/* 알림 켜기/끄기 */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  {settings.enabled && permission === 'granted' ? (
                    <Bell className="h-5 w-5 text-green-500" />
                  ) : (
                    <BellOff className="h-5 w-5 text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">알림 받기</h3>
                    <p className="text-sm text-gray-500">
                      {permission === 'granted'
                        ? '일정 및 약 복용 알림을 받습니다'
                        : permission === 'denied'
                          ? '알림 권한이 거부되었습니다. 브라우저 설정에서 변경하세요.'
                          : '알림 권한을 허용해주세요'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.enabled && permission === 'granted'
                  ? 'bg-blue-500'
                  : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.enabled && permission === 'granted'
                    ? 'translate-x-5'
                    : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {/* 알림 시간 설정 (권한이 있을 때만 표시) */}
            {permission === 'granted' && settings.enabled && (
              <div className="border-t pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">알림 시간 (일정 시작 몇 분 전)</h3>
                    <p className="text-sm text-gray-500">일정 시작 시간 몇 분 전에 알림을 받을지 설정하세요.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {[5, 10, 15, 30, 60].map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => handleAdvanceMinutesChange(minutes)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${advanceMinutes === minutes
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {minutes}분
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 권한 상태 안내 */}
            {permission !== 'granted' && (
              <div className={`border-t pt-6 ${permission === 'denied' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                } rounded-lg p-4`}>
                <p className={`text-sm ${permission === 'denied' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                  {permission === 'denied'
                    ? '알림 권한이 거부되었습니다. 브라우저 설정에서 알림 권한을 허용해주세요.'
                    : '알림을 받으려면 권한을 허용해주세요.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 자주 가는 장소 관리 섹션 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">자주 가는 장소 관리 📍</h2>

          {/* 카테고리 탭 */}
          <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
            {[
              { id: 'hospital', name: '병원', icon: Heart },
              { id: 'pharmacy', name: '약국', icon: Pill },
              { id: 'restaurant', name: '식당', icon: Utensils },
              { id: 'mart', name: '마트', icon: ShoppingCart },
              { id: 'home', name: '집', icon: Home },
              { id: 'other', name: '기타', icon: MapPin },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id)
                  setSearchQuery('')
                  setSearchResults([])
                  setShowSearchResults(false)
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <cat.icon size={16} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            {/* 장소 검색 및 추가 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                새 {
                  ['병원', '약국', '식당', '마트', '집', '기타'][
                  ['hospital', 'pharmacy', 'restaurant', 'mart', 'home', 'other'].indexOf(activeCategory)
                  ]
                } 추가
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (e.target.value.trim().length > 1) {
                      handleSearch(e.target.value)
                    } else {
                      setSearchResults([])
                      setShowSearchResults(false)
                    }
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="장소 이름을 검색하세요..."
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              {/* 검색 결과 드롭다운 */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute z-10 w-full max-w-md mt-1 bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddFavorite(result)}
                      disabled={isActionLoading}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b last:border-b-0"
                    >
                      <div>
                        <div className="font-medium text-sm text-gray-900">{result.place_name}</div>
                        <div className="text-xs text-gray-500">{result.road_address_name || result.address_name}</div>
                      </div>
                      <Plus size={16} className="text-blue-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 등록된 장소 목록 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-500">등록된 장소</h3>
              {favorites.filter((f: { category: string }) => f.category === activeCategory).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <MapPin className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">등록된 장소가 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favorites
                    .filter((f: { category: string }) => f.category === activeCategory)
                    .sort((a: { is_primary: boolean }, b: { is_primary: boolean }) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
                    .map((place: any) => (
                      <div
                        key={place.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 ${place.is_primary ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100 bg-white'
                          }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="font-semibold text-gray-900 truncate">{place.name}</h4>
                            {place.is_primary && (
                              <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-white text-[10px] rounded-full font-bold">
                                기본
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{place.address}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {!place.is_primary && (
                            <button
                              onClick={() => handleSetPrimary(place.id)}
                              disabled={isActionLoading}
                              className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-100 rounded-full transition-colors"
                              title="기본 장소로 설정"
                            >
                              <Star size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteFavorite(place.id)}
                            disabled={isActionLoading}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
                            title="삭제"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 알림 권한 요청 모달 */}
      <NotificationPermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onRequestPermission={handleRequestPermission}
      />
    </div>
  )
}

export default Settings
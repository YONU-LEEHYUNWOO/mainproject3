import { useState, useEffect, useRef } from 'react'
import { useLocation as useRouteLocation, useSearchParams } from 'react-router-dom'
import { MapPin, Navigation, Loader2, Search, Star, Clock, X, AlertTriangle } from 'lucide-react'
import { KakaoMap } from '../components/KakaoMap'
import { useLocation } from '../hooks/useLocation'
import { useGuardianLocation } from '../hooks/useGuardianLocation'
import { useFavorites } from '../hooks/useFavorites'
import { tasksAPI } from '../services/api'

declare global {
  interface Window {
    kakao: any
  }
}

interface Place {
  id: string
  place_name: string
  address_name: string
  road_address_name?: string
  phone?: string
  x: string
  y: string
  category_group_name?: string
}

const Location = () => {
  const routeLocation = useRouteLocation()
  const [searchParams] = useSearchParams()
  const mode = routeLocation.pathname.startsWith('/parent') ? 'parent' : 'child'
  const searchParam = searchParams.get('search')
  const taskIdParam = searchParams.get('taskId')
  const taskId = taskIdParam ? parseInt(taskIdParam) : null

  // Custom Hooks
  const {
    currentLocation,
    isTracking,
    setIsTracking,
    error: locationError,
    isLoading: isLocationLoading,
    isSupported,
    refreshLocation
  } = useLocation(mode)

  const {
    parentLocation,
    isLoading: isParentLoading,
    error: parentError,
    fetchParentLocation
  } = useGuardianLocation(mode)

  const {
    favorites,
    addFavorite,
    removeFavorite,
    isLoading: isFavoritesLoading
  } = useFavorites()

  // Local UI State
  const [keyword, setKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'favorites' | 'search'>('favorites')

  const initialSearchPerformed = useRef(false)

  // URL 검색 파라미터 처리
  useEffect(() => {
    if (searchParam && !initialSearchPerformed.current) {
      setKeyword(searchParam)
      setActiveTab('search')

      // SDK 및 위치 정보 확인 후 검색
      let retryCount = 0
      const trySearch = () => {
        const baseLocation = (mode === 'parent' && currentLocation)
          ? currentLocation
          : (mode === 'child' && parentLocation)
            ? parentLocation
            : null

        if (window.kakao && window.kakao.maps && window.kakao.maps.services && (baseLocation || retryCount >= 10)) {
          performSearch(searchParam)
          initialSearchPerformed.current = true
        } else if (retryCount < 10) {
          retryCount++
          console.log(`🔍 SDK 또는 위치 대기 중... (${retryCount}/10)`)
          setTimeout(trySearch, 500)
        }
      }
      trySearch()
    }
  }, [searchParam, currentLocation, parentLocation])

  // 검색 로직 분리
  const performSearch = (query: string) => {
    console.log('🔍 performSearch 호출됨, query:', query)
    console.log('🔍 window.kakao 존재:', !!window.kakao)
    console.log('🔍 window.kakao.maps 존재:', !!(window.kakao && window.kakao.maps))

    if (!query.trim() || !window.kakao || !window.kakao.maps) {
      console.warn('⚠️ 검색 중단: query 없음 또는 카카오맵 SDK 미로드')
      return
    }

    setIsSearching(true)
    const ps = new window.kakao.maps.services.Places()
    console.log('🔍 Places 서비스 생성 완료')

    // 현재 위치 기준으로 검색하기 위한 옵션 설정
    const baseLocation = (mode === 'parent' && currentLocation)
      ? currentLocation
      : (mode === 'child' && parentLocation)
        ? parentLocation
        : null

    const searchOptions: any = {
      size: 15 // 검색 결과 개수
    }

    // 현재 위치가 있으면 위치 기반 검색 (정확도 우선)
    if (baseLocation) {
      searchOptions.location = new window.kakao.maps.LatLng(baseLocation.latitude, baseLocation.longitude)
      searchOptions.sort = window.kakao.maps.services.SortBy.ACCURACY
      console.log('🔍 위치 기반 검색:', baseLocation.latitude, baseLocation.longitude, '정확도 우선')
    } else {
      console.log('🔍 전국 검색 (현재 위치 없음)')
    }

    ps.keywordSearch(query, (data: any[], status: any) => {
      console.log('🔍 검색 결과 수신, status:', status, 'data:', data)
      if (status === window.kakao.maps.services.Status.OK) {
        console.log('✅ 검색 성공, 결과 개수:', data.length)
        setSearchResults(data)
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        console.log('⚠️ 검색 결과 없음')
        setSearchResults([])
      } else if (status === window.kakao.maps.services.Status.ERROR) {
        console.error('❌ 검색 중 오류가 발생했습니다.')
      }
      setIsSearching(false)
    }, searchOptions)
  }

  // Search Handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔍 handleSearch 호출됨, keyword:', keyword)
    performSearch(keyword)
  }

  const updateTaskLocation = async (task_id: number, place: Place) => {
    try {
      await tasksAPI.updateTask(task_id, {
        location: place.place_name,
        latitude: parseFloat(place.y),
        longitude: parseFloat(place.x)
      })
      alert(`✅ '${place.place_name}'(으)로 일정이 업데이트되었습니다.`)
    } catch (error) {
      console.error('일정 위치 업데이트 실패:', error)
      alert('일정 업데이트 중 오류가 발생했습니다.')
    }
  }

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place)
    if (taskId) {
      updateTaskLocation(taskId, place)
    }
  }

  const handleAddStart = async (place: Place) => {
    const success = await addFavorite(place)
    if (success) {
      alert('즐겨찾기에 추가되었습니다.')
    } else {
      alert('즐겨찾기 추가에 실패했습니다.')
    }
  }

  const handleRemoveStar = async (e: React.MouseEvent, favoriteId: number) => {
    e.stopPropagation()
    if (window.confirm('즐겨찾기에서 삭제하시겠습니까?')) {
      await removeFavorite(favoriteId)
    }
  }

  // Route State
  const [routeData, setRouteData] = useState<{
    distance: number
    duration: number
    path: { lat: number; lng: number }[]
  } | null>(null)
  const [isRouteLoading, setIsRouteLoading] = useState(false)

  // Fetch Route when place is selected
  useEffect(() => {
    const fetchRoute = async () => {
      const baseLocation = (mode === 'parent' && currentLocation)
        ? currentLocation
        : (mode === 'child' && parentLocation)
          ? parentLocation
          : null

      if (!selectedPlace || !baseLocation) {
        setRouteData(null)
        return
      }

      setIsRouteLoading(true)
      try {
        const { locationAPI } = await import('../services/api')
        const response = await locationAPI.getRoute(
          { lat: baseLocation.latitude, lng: baseLocation.longitude },
          { lat: parseFloat(selectedPlace.y), lng: parseFloat(selectedPlace.x) }
        )
        setRouteData(response.data.data)
      } catch (error) {
        console.error('Failed to fetch route:', error)
      } finally {
        setIsRouteLoading(false)
      }
    }

    fetchRoute()
  }, [selectedPlace, currentLocation, parentLocation, mode])

  const openNavigation = (place: Place) => {
    const url = `https://map.kakao.com/link/to/${place.place_name},${place.y},${place.x}`
    window.open(url, '_blank')
  }

  const displayLocation = selectedPlace
    ? { lat: parseFloat(selectedPlace.y), lng: parseFloat(selectedPlace.x) }
    : (mode === 'parent' && currentLocation)
      ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
      : (mode === 'child' && parentLocation)
        ? { lat: parentLocation.latitude, lng: parentLocation.longitude }
        : null

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {mode === 'parent' ? '내 위치 관리' : '부모님 위치 확인'}
          <span className="text-2xl">📍</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'parent'
            ? '안심 구역 설정 및 위치 공유 관리'
            : '실시간 위치 확인 및 이동 경로 모니터링'}
        </p>
      </div>

      {/* Map Area */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="h-80 w-full rounded-lg overflow-hidden bg-gray-100 relative">
          {displayLocation ? (
            <KakaoMap
              center={displayLocation}
              showSearch={false}
              markers={[
                ...(currentLocation && mode === 'parent' ? [{
                  lat: currentLocation.latitude,
                  lng: currentLocation.longitude,
                  title: '나',
                  color: 'blue'
                }] : []),
                ...(parentLocation && mode === 'child' ? [{
                  lat: parentLocation.latitude,
                  lng: parentLocation.longitude,
                  title: '부모님',
                  color: 'red'
                }] : []),
                ...(selectedPlace ? [{
                  lat: parseFloat(selectedPlace.y),
                  lng: parseFloat(selectedPlace.x),
                  title: selectedPlace.place_name,
                  color: 'green'
                }] : [])
              ]}
              routePath={routeData?.path}
              className="h-full w-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                {isLocationLoading || isParentLoading ? '위치 로딩 중...' : '위치 정보가 없습니다.'}
              </p>
            </div>
          )}

          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={mode === 'parent' ? refreshLocation : fetchParentLocation}
              className="bg-white p-2 rounded-full shadow-md text-gray-700 hover:text-blue-600 focus:outline-none"
              title="위치 새로고침"
            >
              {isLocationLoading || isParentLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isRouteLoading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center text-blue-600 gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">최적 경로 계산 중...</span>
          </div>
        )}

        {selectedPlace && routeData && !isRouteLoading && (
          <div className="mt-4 p-4 border border-blue-100 bg-blue-50 rounded-lg animate-fade-in">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{selectedPlace.place_name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedPlace.road_address_name || selectedPlace.address_name}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-700">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-blue-500" /> {((routeData?.distance || 0) / 1000).toFixed(1)}km</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-orange-500" /> 차로 약 {Math.round((routeData?.duration || 0) / 60)}분</span>
                </div>
              </div>
              <button onClick={() => setSelectedPlace(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => openNavigation(selectedPlace)}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Navigation className="h-4 w-4" /> 길찾기 (카카오맵)
              </button>
              <button
                onClick={() => handleAddStart(selectedPlace)}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Star className="h-4 w-4 text-yellow-500" /> 즐겨찾기 추가
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Current Location Info Card */}
      {mode === 'parent' && currentLocation && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                내 현재 위치
              </h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium w-20">위도:</span>
                  <span>{currentLocation.latitude.toFixed(6)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium w-20">경도:</span>
                  <span>{currentLocation.longitude.toFixed(6)}</span>
                </div>
                {currentLocation.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <span className="font-medium w-20">주소:</span>
                    <span className="flex-1">{currentLocation.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {mode === 'child' && parentLocation && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-500" />
                부모님 현재 위치
              </h3>
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium w-20">위도:</span>
                  <span>{parentLocation.latitude.toFixed(6)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium w-20">경도:</span>
                  <span>{parentLocation.longitude.toFixed(6)}</span>
                </div>
                {parentLocation.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <span className="font-medium w-20">주소:</span>
                    <span className="flex-1">{parentLocation.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Favorites Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 text-sm font-medium text-center transition ${activeTab === 'favorites' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            즐겨찾기 목록
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 text-sm font-medium text-center transition ${activeTab === 'search' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            장소 검색
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'search' && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="장소, 주소 검색 (예: 약국, 병원)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                  disabled={isSearching}
                >
                  검색
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {isSearching && (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-2" />
                    <p className="text-sm text-gray-500">검색 중...</p>
                  </div>
                )}
                {!isSearching && searchResults.length > 0 && searchResults.map((place) => (
                  <div
                    key={place.id}
                    onClick={() => handlePlaceSelect(place)}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition ${selectedPlace?.id === place.id ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{place.place_name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{place.category_group_name}</div>
                        <div className="text-sm text-gray-600 mt-1">{place.road_address_name || place.address_name}</div>
                      </div>
                      {place.phone && <div className="text-xs text-gray-400">{place.phone}</div>}
                    </div>
                  </div>
                ))}
                {!isSearching && keyword && searchResults.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">검색 결과가 없습니다.</div>
                )}
                {!keyword && !isSearching && (
                  <div className="text-center py-4 text-gray-400 text-sm">원하는 장소를 검색해보세요.<br />(약국, 병원, 관공서 등)</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
              {isFavoritesLoading ? (
                <div className="text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" /></div>
              ) : favorites.length > 0 ? favorites.map((fav) => (
                <div key={fav.id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50 transition group">
                  <div className="cursor-pointer flex-1" onClick={() => handlePlaceSelect({
                    id: fav.id.toString(),
                    place_name: fav.name,
                    address_name: fav.address,
                    x: fav.longitude.toString(),
                    y: fav.latitude.toString(),
                    road_address_name: fav.address,
                    category_group_name: fav.category // 추가: 카테고리 정보 누락 방지
                  })}>
                    <div className="font-medium flex items-center gap-2">
                      {fav.name}
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-500">{fav.category}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{fav.address}</div>
                  </div>
                  <button
                    onClick={(e) => handleRemoveStar(e, fav.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition"
                    title="즐겨찾기 삭제"
                  >
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 hover:text-red-500 hover:fill-none" />
                  </button>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p>즐겨찾기한 장소가 없습니다.</p>
                  <button onClick={() => setActiveTab('search')} className="text-blue-500 text-sm mt-2 hover:underline">
                    장소 검색하러 가기
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mode === 'parent' && (
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <Navigation className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">내 위치 공유</h3>
                  <p className="text-sm text-gray-500">
                    위치를 공유하면 가족이 내 위치를 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsTracking(!isTracking)}
              disabled={!isSupported}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isTracking ? 'bg-blue-500' : 'bg-gray-200'
                }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isTracking ? 'translate-x-5' : 'translate-x-0'
                  }`}
              />
            </button>
          </div>
          {locationError && (
            <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> {locationError}
            </p>
          )}
        </div>
      )}

      {mode === 'child' && parentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">{parentError}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Location

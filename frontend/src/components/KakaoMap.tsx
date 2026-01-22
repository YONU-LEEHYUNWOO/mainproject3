import { useEffect, useRef, useState } from 'react'
import { Search, MapPin, Star } from 'lucide-react'

interface KakaoMapProps {
  center?: { lat: number; lng: number }
  markers?: Array<{ lat: number; lng: number; title?: string; color?: string }>
  routePath?: Array<{ lat: number; lng: number }> // 백엔드에서 받은 경로 데이터
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  onFavoriteAdd?: (location: { lat: number; lng: number; name: string; address: string }) => void
  className?: string
  showSearch?: boolean
}

/**
 * 카카오 지도 컴포넌트
 */
export const KakaoMap: React.FC<KakaoMapProps> = ({
  center = { lat: 37.5665, lng: 126.9780 }, // 서울시청 기본 위치
  markers = [],
  routePath,
  onLocationSelect,
  onFavoriteAdd,
  className = '',
  showSearch = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polylineRef = useRef<any>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  /**
   * 지도 초기화
   */
  useEffect(() => {
    if (!mapContainerRef.current) return

    // 카카오 지도 SDK 로드 확인 및 대기
    const initMap = () => {
      if (typeof window !== 'undefined' && (window as any).kakao && (window as any).kakao.maps) {
        const { kakao } = window as any

        // 지도 생성
        const mapOption = {
          center: new kakao.maps.LatLng(center.lat, center.lng),
          level: 3
        }

        const map = new kakao.maps.Map(mapContainerRef.current, mapOption)
        mapRef.current = map

        // 마커 추가
        updateMarkers()
      } else {
        // SDK가 아직 로드되지 않았으면 잠시 후 재시도
        setTimeout(initMap, 100)
      }
    }

    initMap()
  }, [])

  /**
   * 중심 위치 변경 시 지도 이동
   */
  useEffect(() => {
    if (mapRef.current && center) {
      const { kakao } = window as any
      const moveLatLon = new kakao.maps.LatLng(center.lat, center.lng)
      mapRef.current.setCenter(moveLatLon)
    }
  }, [center])

  /**
   * 마커 업데이트
   */
  const updateMarkers = () => {
    if (!mapRef.current || !(window as any).kakao) return

    const { kakao } = window as any

    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // 새 마커 추가
    markers.forEach((markerData) => {
      const position = new kakao.maps.LatLng(markerData.lat, markerData.lng)

      // 기본 마커 생성 (커스텀 이미지 URL 제거)
      const marker = new kakao.maps.Marker({
        position: position,
        map: mapRef.current
      })

      // 마커 클릭 이벤트
      if (onLocationSelect) {
        kakao.maps.event.addListener(marker, 'click', async () => {
          try {
            // 좌표를 주소로 변환
            const geocoder = new kakao.maps.services.Geocoder()
            geocoder.coord2Address(markerData.lng, markerData.lat, (result: any, status: any) => {
              if (status === kakao.maps.services.Status.OK) {
                const address = result[0].address?.address_name || '주소를 찾을 수 없습니다.'
                onLocationSelect({
                  lat: markerData.lat,
                  lng: markerData.lng,
                  address
                })
              }
            })
          } catch (error) {
            console.error('주소 변환 오류:', error)
          }
        })
      }

      // 인포윈도우 (제목이 있을 때)
      if (markerData.title) {
        const infowindow = new kakao.maps.InfoWindow({
          content: `<div style="padding:5px;font-size:12px;">${markerData.title}</div>`
        })
        infowindow.open(mapRef.current, marker)
      }

      markersRef.current.push(marker)
    })
  }

  /**
   * 경로 표시 (상세 경로 데이터 사용)
   */
  const updateRoutePath = () => {
    if (!mapRef.current || !routePath || routePath.length === 0 || !(window as any).kakao) return

    const { kakao } = window as any

    // 기존 경로 제거
    if (polylineRef.current) {
      polylineRef.current.setMap(null)
      polylineRef.current = null
    }

    // 경로 폴리라인 생성
    const path = routePath.map(p => new kakao.maps.LatLng(p.lat, p.lng))

    const polyline = new kakao.maps.Polyline({
      path: path,
      strokeWeight: 6,
      strokeColor: '#3b82f6', // Blue-500
      strokeOpacity: 0.8,
      strokeStyle: 'solid'
    })

    polyline.setMap(mapRef.current)
    polylineRef.current = polyline

    // 경로 전체가 보이도록 지도 범위 조정
    const bounds = new kakao.maps.LatLngBounds()
    routePath.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)))

    // 마커 위치도 포함
    markers.forEach(m => bounds.extend(new kakao.maps.LatLng(m.lat, m.lng)))

    mapRef.current.setBounds(bounds)
  }

  useEffect(() => {
    updateMarkers()
  }, [markers])

  useEffect(() => {
    if (routePath) {
      updateRoutePath()
    } else if (polylineRef.current) {
      // 경로 데이터가 없으면 기존 경로 제거
      polylineRef.current.setMap(null)
      polylineRef.current = null
    }
  }, [routePath])

  /**
   * 장소 검색
   */
  const handleSearch = async () => {
    if (!searchQuery || typeof window === 'undefined' || !(window as any).kakao || !(window as any).kakao.maps) {
      alert('카카오 지도 SDK가 로드되지 않았습니다. API 키를 확인해주세요.')
      return
    }

    setIsSearching(true)
    const { kakao } = window as any
    const places = new kakao.maps.services.Places()

    places.keywordSearch(searchQuery, (data: any, status: any) => {
      setIsSearching(false)

      if (status === kakao.maps.services.Status.OK) {
        setSearchResults(data.slice(0, 5)) // 상위 5개만 표시
      } else {
        setSearchResults([])
      }
    })
  }

  /**
   * 검색 결과 선택
   */
  const handleSelectResult = (place: any) => {
    const lat = parseFloat(place.y)
    const lng = parseFloat(place.x)

    // 지도 중심 이동
    if (mapRef.current) {
      const { kakao } = window as any
      const moveLatLon = new kakao.maps.LatLng(lat, lng)
      mapRef.current.setCenter(moveLatLon)
      mapRef.current.setLevel(3)
    }

    // 마커 추가
    if (onLocationSelect) {
      onLocationSelect({
        lat,
        lng,
        address: place.place_name || place.address_name
      })
    }

    setSearchResults([])
    setSearchQuery('')
  }

  /**
   * 즐겨찾기 추가
   */
  const handleAddFavorite = (place: any) => {
    if (onFavoriteAdd) {
      const lat = parseFloat(place.y)
      const lng = parseFloat(place.x)
      onFavoriteAdd({
        lat,
        lng,
        name: place.place_name,
        address: place.address_name
      })
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* 검색 바 */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              placeholder="장소 검색..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          {/* 검색 결과 */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((place, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <button
                    onClick={() => handleSelectResult(place)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-sm text-gray-900">{place.place_name}</div>
                    <div className="text-xs text-gray-500 mt-1">{place.address_name}</div>
                  </button>
                  {onFavoriteAdd && (
                    <button
                      onClick={() => handleAddFavorite(place)}
                      className="ml-2 p-1 text-yellow-500 hover:text-yellow-600"
                      title="즐겨찾기 추가"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 즐겨찾기 목록 - Location.tsx에서 관리하므로 제거 됨 */}
        </div>
      )}

      {/* 지도 컨테이너 */}
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />

      {/* 카카오 지도 SDK 미로드 시 안내 */}
      {typeof window !== 'undefined' && !(window as any).kakao && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">카카오 지도 SDK를 로드하는 중...</p>
            <p className="text-xs text-gray-500 mt-1">
              카카오 지도 API 키가 설정되어 있는지 확인해주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

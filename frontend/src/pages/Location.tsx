import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { MapPin, Navigation, Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { KakaoMap } from '../components/KakaoMap'

/**
 * Location 페이지
 * 위치 추적 및 안전 구역 관리
 */
const Location = () => {
  const location = useLocation()
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'
  
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number
    longitude: number
    accuracy: number
  } | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLocationSupported, setIsLocationSupported] = useState(false)
  const [favorites, setFavorites] = useState<Array<{ lat: number; lng: number; name: string; address: string }>>([])
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)

  /**
   * 위치 서비스 지원 여부 확인
   */
  useEffect(() => {
    if ('geolocation' in navigator) {
      setIsLocationSupported(true)
    } else {
      setLocationError('브라우저가 위치 서비스를 지원하지 않습니다.')
    }

    // 즐겨찾기 로드
    const savedFavorites = localStorage.getItem('location_favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (error) {
        console.error('즐겨찾기 로드 오류:', error)
      }
    }
  }, [])

  /**
   * 현재 위치 가져오기
   */
  const getCurrentLocation = () => {
    if (!isLocationSupported) return

    setIsLoading(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0
        })
        setIsLoading(false)
      },
      (error) => {
        let errorMessage = '위치를 가져올 수 없습니다.'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.'
            break
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.'
            break
        }
        
        setLocationError(errorMessage)
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  /**
   * 위치 추적 시작/중지
   */
  const toggleTracking = () => {
    if (!isLocationSupported) return

    if (isTracking) {
      setIsTracking(false)
    } else {
      setIsTracking(true)
      getCurrentLocation()
      
      // 주기적으로 위치 업데이트 (실제로는 API로 전송)
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || 0
          })
          // TODO: API로 위치 전송
        },
        (error) => {
          console.error('위치 추적 오류:', error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000
        }
      )

      // 컴포넌트 언마운트 시 추적 중지
      return () => {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }

  /**
   * 즐겨찾기 추가
   */
  const handleAddFavorite = (location: { lat: number; lng: number; name: string; address: string }) => {
    const newFavorites = [...favorites, location]
    setFavorites(newFavorites)
    localStorage.setItem('location_favorites', JSON.stringify(newFavorites))
  }

  /**
   * 위치 선택 핸들러
   */
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location)
    setCurrentLocation({
      latitude: location.lat,
      longitude: location.lng,
      accuracy: 0
    })
  }

  return (
    <div className="space-y-6">
      {/* 모드별 제목 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'parent' ? '내 위치 관리 📍' : '부모님 위치 확인 📍'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'parent'
            ? '내 위치를 공유하고 안전 구역을 설정하세요'
            : '부모님의 위치를 실시간으로 확인하세요'}
        </p>
      </div>

      {/* 지도 영역 */}
      {currentLocation && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">위치 지도</h2>
          <div className="h-96 rounded-lg overflow-hidden">
            <KakaoMap
              center={{
                lat: currentLocation.latitude,
                lng: currentLocation.longitude
              }}
              markers={[{
                lat: currentLocation.latitude,
                lng: currentLocation.longitude,
                title: mode === 'parent' ? '내 위치' : '부모님 위치',
                color: 'blue'
              }]}
              favorites={favorites}
              onLocationSelect={handleLocationSelect}
              onFavoriteAdd={handleAddFavorite}
              mode={mode}
              className="h-full"
            />
          </div>
          {selectedLocation && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>선택된 위치:</strong> {selectedLocation.address}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 위치 정보 카드 */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">현재 위치</h2>
          <button
            onClick={getCurrentLocation}
            disabled={isLoading || !isLocationSupported}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>위치 가져오는 중...</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>위치 새로고침</span>
              </>
            )}
          </button>
        </div>

        {locationError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">{locationError}</span>
            </div>
          </div>
        ) : currentLocation ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">위도</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentLocation.latitude.toFixed(6)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">경도</p>
                <p className="text-lg font-semibold text-gray-900">
                  {currentLocation.longitude.toFixed(6)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">정확도</p>
              <p className="text-sm text-gray-700">
                ±{Math.round(currentLocation.accuracy)}m
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>위치 정보가 없습니다.</p>
            <p className="text-sm mt-1">위치 새로고침 버튼을 눌러주세요.</p>
          </div>
        )}
      </div>

      {/* 위치 추적 토글 (부모 모드) */}
      {mode === 'parent' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <Navigation className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">위치 공유</h3>
                  <p className="text-sm text-gray-500">
                    위치 공유를 켜면 자식 모드에서 내 위치를 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={toggleTracking}
              disabled={!isLocationSupported}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isTracking ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isTracking ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* 안전 구역 설정 (부모 모드) */}
      {mode === 'parent' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">안전 구역</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            안전 구역을 설정하면 해당 구역을 벗어날 때 알림을 받을 수 있습니다.
          </p>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            안전 구역 설정
          </button>
          <p className="text-xs text-gray-500 mt-2">
            * 안전 구역 설정 기능은 API 연동 후 사용 가능합니다.
          </p>
        </div>
      )}

      {/* 부모님 위치 모니터링 (자식 모드) */}
      {mode === 'child' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MapPin className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">부모님 위치</h2>
          </div>
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>부모님의 위치 정보가 없습니다.</p>
            <p className="text-sm mt-1">
              부모님이 위치 공유를 켜면 여기에 표시됩니다.
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            * 위치 정보는 API 연동 후 표시됩니다.
          </p>
        </div>
      )}

      {/* 이동 경로 기록 (자식 모드) */}
      {mode === 'child' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">이동 경로</h2>
          <div className="text-center py-8 text-gray-500">
            <Navigation className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>이동 경로 기록이 없습니다.</p>
            <p className="text-sm mt-1">
              부모님의 이동 경로는 API 연동 후 표시됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Location

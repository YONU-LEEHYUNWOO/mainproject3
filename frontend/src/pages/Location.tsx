import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { MapPin, Navigation, Shield, AlertTriangle, Loader2 } from 'lucide-react'
import { KakaoMap } from '../components/KakaoMap'
import api from '../services/api'

declare global {
  interface Window {
    kakao: any
  }
}

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
  const [isTracking, setIsTracking] = useState(() => {
    // localStorage에서 이전 상태 복원
    const saved = localStorage.getItem('location_tracking')
    return saved ? JSON.parse(saved) : false
  })
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLocationSupported, setIsLocationSupported] = useState(false)
  const [favorites, setFavorites] = useState<Array<{ lat: number; lng: number; name: string; address: string }>>([])
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [parentLocation, setParentLocation] = useState<any>(null)
  const [isLoadingParentLocation, setIsLoadingParentLocation] = useState(false)
  const [lastModeCheck, setLastModeCheck] = useState<string>('')

  /**
   * 좌표를 주소로 변환 (Kakao Geocoder)
   */
  const getAddressFromCoords = (lat: number, lng: number): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
        console.log('Kakao Maps SDK not loaded')
        resolve(null)
        return
      }

      const geocoder = new window.kakao.maps.services.Geocoder()
      geocoder.coord2Address(lng, lat, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const addr = result[0]?.address?.address_name || result[0]?.road_address?.address_name
          resolve(addr || null)
        } else {
          resolve(null)
        }
      })
    })
  }

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
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords

        setCurrentLocation({
          latitude,
          longitude,
          accuracy: accuracy || 0
        })
        setIsLoading(false)

        // 부모 모드일 때만 서버로 위치 전송 (수동 새로고침 시에도)
        if (mode === 'parent') {
          try {
            // 주소 변환
            let address = null
            try {
              address = await getAddressFromCoords(latitude, longitude)
              console.log('주소 변환 성공:', address)
            } catch (e) {
              console.error('주소 변환 실패:', e)
            }

            const locationData = {
              latitude,
              longitude,
              accuracy: accuracy || 0,
              address: address, // 주소 포함
              location_type: 'current'
            }

            await api.post('/api/location', locationData)
            console.log('위치(주소포함) 수동 전송 완료')
          } catch (err) {
            console.error('위치 전송 실패:', err)
          }
        }
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
      // 즉시 위치 전송 호출 (getCurrentLocation 내부 로직 사용 X, 별도 구현)
      // -> getCurrentLocation()은 로딩 UI를 건드리므로 분리

      // 위치 공유 토글 ON/OFF 상태 확인
      console.log('위치 공유 토글 켜짐, GPS 추적 시작')

      // 헬퍼 함수: 위치 전송
      const sendLocation = async (position: GeolocationPosition) => {
        console.log('GPS 위치 가져오기 성공:', position.coords)

        // 주소 변환
        let address = null
        try {
          address = await getAddressFromCoords(position.coords.latitude, position.coords.longitude)
        } catch (e) {
          console.error('주소 변환/SDK 오류:', e)
        }

        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 0,
          address: address,
          location_type: 'current'
        }

        setCurrentLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy
        })

        // API로 위치 전송
        try {
          console.log('위치 저장 API 호출 시작...', locationData)
          const response = await api.post('/api/location', locationData)
          console.log('✅ 위치 저장 성공:', response.data)
          setLocationError(null) // 에러 초기화
        } catch (apiError: any) {
          console.error('❌ 위치 저장 API 실패:', apiError)
          if (apiError.response?.status === 401) {
            setLocationError('인증이 필요합니다. 다시 로그인해주세요.')
          } else if (apiError.response?.status === 500) {
            setLocationError('서버 오류가 발생했습니다.')
          } else {
            setLocationError(`위치 저장 실패: ${apiError.message}`)
          }
        }
      }

      // 한 번만 현재 위치 가져오기
      navigator.geolocation.getCurrentPosition(
        sendLocation,
        (error) => {
          console.error('❌ GPS 위치 가져오기 실패:', error)
          setLocationError('위치 권한을 확인해주세요.')
          setIsTracking(false)
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 300000 }
      )

      // watchPosition 대신 setInterval로 주기적 업데이트 (더 안정적)
      const intervalId = setInterval(() => {
        if (isTracking) {
          navigator.geolocation.getCurrentPosition(
            sendLocation,
            (error) => {
              console.error('주기적 위치 업데이트 GPS 실패:', error.message)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          )
        }
      }, 60000) // 1분마다 업데이트

      // 컴포넌트 언마운트 시 정리
      return () => {
        clearInterval(intervalId)
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

  /**
   * 부모 위치 조회 (자식 모드용)
   */
  const getParentLocation = async () => {
    if (mode !== 'child') return

    setIsLoadingParentLocation(true)
    try {
      // 현재 사용자의 guardian 정보를 조회해서 첫 번째 부모의 ID를 찾음
      console.log('Guardian API 호출 시작...')
      const guardiansResponse = await api.get('/api/guardians/')
      console.log('Guardian API 응답:', guardiansResponse)
      // API 응답 구조가 직접 객체 반환일 수도 있고, 표준 응답(res.data)일 수도 있음
      const guardians = guardiansResponse.data.guardians || guardiansResponse.data?.data?.guardians || []
      console.log('가져온 guardians:', guardians)

      if (guardians.length > 0) {
        // 임시: 부모 ID를 1로 가정 (실제로는 Guardian 모델에 guardian_user_id 필드가 필요)
        const parentId = 1  // 테스트용 부모 ID
        console.log('임시 부모 ID 사용:', parentId, '(Guardian 정보:', guardians[0].name, ')')

        // 부모의 현재 위치 조회
        console.log('부모 위치 API 호출 시도:', `/api/location/parent/${parentId}`)
        const locationResponse = await api.get(`/api/location/parent/${parentId}`)
        console.log('부모 위치 API 응답:', locationResponse)
        const locationData = locationResponse.data

        if (locationData) {
          setParentLocation(locationData)
          setCurrentLocation({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy || 0
          })
          console.log('부모 위치 조회 성공:', locationData)
        } else {
          setParentLocation(null)
          console.log('부모 위치 데이터 없음 - 부모가 아직 위치 공유를 시작하지 않음')
        }
      }
    } catch (error: any) {
      console.error('부모 위치 조회 오류:', error)
      setParentLocation(null)
      // 403 에러는 권한 없음, 404는 위치 없음으로 처리
      if (error.response?.status === 403) {
        console.log('부모 위치 조회 권한이 없습니다')
      }
    } finally {
      setIsLoadingParentLocation(false)
    }
  }

  /**
   * 모드 변경 시 부모 위치 조회 (자식 모드) 및 위치 추적 상태 확인
   */
  useEffect(() => {
    if (mode === 'child' && mode !== lastModeCheck) {
      // 모드가 자식으로 변경되었을 때만 조회
      setLastModeCheck(mode)

      // 모드 변경 시에도 부모 위치 정보 유지 (localStorage에서 복원)
      const savedParentLocation = localStorage.getItem('parent_location')
      if (savedParentLocation) {
        try {
          const parsed = JSON.parse(savedParentLocation)
          setParentLocation(parsed)
          console.log('모드 변경 시 부모 위치 복원됨:', parsed)
        } catch (error) {
          console.error('저장된 부모 위치 복원 실패:', error)
        }
      }

      // API로 최신 부모 위치 조회
      getParentLocation()
    } else if (mode !== 'child') {
      setLastModeCheck(mode)

      // 부모 모드로 변경되었을 때 위치 추적이 켜져있으면 재시작
      if (mode === 'parent' && isTracking && isLocationSupported) {
        console.log('부모 모드로 변경됨, 위치 추적 재시작')
        // 간단히 현재 위치를 다시 가져와서 표시
        getCurrentLocation()
      }
    }
  }, [mode, isTracking, isLocationSupported])

  /**
   * 부모 위치 정보가 업데이트되면 localStorage에 저장
   */
  useEffect(() => {
    if (parentLocation && mode === 'child') {
      localStorage.setItem('parent_location', JSON.stringify(parentLocation))
    }
  }, [parentLocation, mode])

  /**
   * 위치 추적 상태가 변경되면 localStorage에 저장
   */
  useEffect(() => {
    localStorage.setItem('location_tracking', JSON.stringify(isTracking))
  }, [isTracking])

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
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isTracking ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              title={isTracking ? '위치 공유 중지' : '위치 공유 시작'}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isTracking ? 'translate-x-5' : 'translate-x-0'
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">부모님 위치</h2>
            </div>
            <button
              onClick={getParentLocation}
              disabled={isLoadingParentLocation}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoadingParentLocation ? '조회중...' : '새로고침'}
            </button>
          </div>

          {parentLocation ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">위도</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {parentLocation.latitude.toFixed(6)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">경도</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {parentLocation.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              {parentLocation.address && (
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-600 mb-1">현재 주소</p>
                  <p className="text-base font-medium text-gray-900 break-keep bg-gray-50 p-2 rounded">
                    {parentLocation.address}
                  </p>
                </div>
              )}

              {parentLocation.accuracy && (
                <div>
                  <p className="text-sm text-gray-600">정확도</p>
                  <p className="text-sm text-gray-700">
                    ±{Math.round(parentLocation.accuracy)}m
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">마지막 업데이트</p>
                <p className="text-sm text-gray-700">
                  {new Date(parentLocation.updated_at || parentLocation.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isLoadingParentLocation ? (
                <>
                  <Loader2 className="h-12 w-12 mx-auto mb-2 text-blue-500 animate-spin" />
                  <p>부모님 위치를 조회하는 중...</p>
                </>
              ) : (
                <>
                  <MapPin className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>부모님의 위치 정보가 없습니다.</p>
                  <p className="text-sm mt-1">
                    부모님이 위치 공유를 켜면 여기에 표시됩니다.
                  </p>
                </>
              )}
            </div>
          )}
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

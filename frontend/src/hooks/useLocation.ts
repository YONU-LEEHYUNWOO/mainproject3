import { useState, useEffect } from 'react'
import api from '../services/api'

interface LocationData {
    latitude: number
    longitude: number
    accuracy: number
    address?: string
}

export const useLocation = (mode: 'parent' | 'child') => {
    const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
    const [isTracking, setIsTracking] = useState(() => {
        const saved = localStorage.getItem('location_tracking')
        return saved ? JSON.parse(saved) : false
    })
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isSupported, setIsSupported] = useState(false)

    // 카카오 Geocoder로 주소 변환
    const getAddress = (lat: number, lng: number): Promise<string | null> => {
        return new Promise((resolve) => {
            if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
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

    useEffect(() => {
        if ('geolocation' in navigator) {
            setIsSupported(true)
        } else {
            setError('브라우저가 위치 서비스를 지원하지 않습니다.')
        }
    }, [])

    // 추적 상태 저장
    useEffect(() => {
        localStorage.setItem('location_tracking', JSON.stringify(isTracking))
    }, [isTracking])

    // 위치 전송 (부모 모드)
    const sendLocationToServer = async (lat: number, lng: number, acc: number) => {
        if (mode !== 'parent') return

        try {
            const address = await getAddress(lat, lng)
            const data = {
                latitude: lat,
                longitude: lng,
                accuracy: acc,
                address: address || undefined,
                location_type: 'current'
            }
            await api.post('/api/location', data)
            console.log('Location sent to server:', data)
        } catch (err) {
            console.error('Failed to send location:', err)
        }
    }

    // 1회성 위치 조회
    const refreshLocation = () => {
        if (!isSupported) return

        setIsLoading(true)
        setError(null)

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude, accuracy } = pos.coords
                setCurrentLocation({ latitude, longitude, accuracy })
                setIsLoading(false)

                // 수동 새로고침 시에도 부모라면 서버 전송
                await sendLocationToServer(latitude, longitude, accuracy || 0)
            },
            (err) => {
                setError(getErrorMsg(err))
                setIsLoading(false)
            },
            { enableHighAccuracy: true, timeout: 10000 }
        )
    }

    // 에러 메시지 변환
    const getErrorMsg = (err: GeolocationPositionError) => {
        switch (err.code) {
            case err.PERMISSION_DENIED: return '위치 권한이 거부되었습니다.'
            case err.POSITION_UNAVAILABLE: return '위치 정보를 사용할 수 없습니다.'
            case err.TIMEOUT: return '위치 요청 시간이 초과되었습니다.'
            default: return '위치를 가져오는 중 오류가 발생했습니다.'
        }
    }

    // 위치 추적 (interval)
    useEffect(() => {
        if (!isTracking || !isSupported || mode !== 'parent') return

        // 시작 시 즉시 전송
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude, accuracy } = pos.coords
                setCurrentLocation({ latitude, longitude, accuracy: accuracy || 0 })
                sendLocationToServer(latitude, longitude, accuracy || 0)
            },
            (err) => console.error('Tracking init error:', err),
            { enableHighAccuracy: true }
        )

        const intervalId = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude, accuracy } = pos.coords
                    setCurrentLocation({ latitude, longitude, accuracy: accuracy || 0 })
                    sendLocationToServer(latitude, longitude, accuracy || 0)
                },
                (err) => console.error('Tracking update error:', err),
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }, 60000) // 1분 주기

        return () => clearInterval(intervalId)
    }, [isTracking, isSupported, mode])

    return {
        currentLocation,
        isTracking,
        setIsTracking,
        error,
        isLoading,
        isSupported,
        refreshLocation
    }
}

import { useState, useEffect } from 'react'
import api from '../services/api'

interface ParentLocationData {
    latitude: number
    longitude: number
    accuracy: number
    address?: string
    updated_at?: string
    created_at?: string
}

export const useGuardianLocation = (mode: 'parent' | 'child') => {
    const [parentLocation, setParentLocation] = useState<ParentLocationData | null>(() => {
        const saved = localStorage.getItem('parent_location')
        return saved ? JSON.parse(saved) : null
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (parentLocation && mode === 'child') {
            localStorage.setItem('parent_location', JSON.stringify(parentLocation))
        }
    }, [parentLocation, mode])

    const fetchParentLocation = async () => {
        if (mode !== 'child') return

        setIsLoading(true)
        setError(null)

        try {
            // 1. 보호자 목록 조회
            const guardiansRes = await api.get('/api/guardians/')
            const guardians = guardiansRes.data.guardians || guardiansRes.data?.data?.guardians || []

            // 2. 적절한 보호자 찾기 (주보호자 우선 -> 등록된 보호자)
            let target = guardians.find((g: any) => g.is_primary && g.guardian_user_id)
            if (!target) {
                target = guardians.find((g: any) => g.guardian_user_id)
            }

            if (target) {
                // 3. 부모 위치 조회
                const locRes = await api.get(`/api/location/parent/${target.guardian_user_id}`)
                if (locRes.data) {
                    setParentLocation(locRes.data)
                } else {
                    setParentLocation(null)
                    console.log('부모님 위치 정보가 아직 없습니다.')
                }
            } else {
                setParentLocation(null)
                console.log('연결된 보호자 계정을 찾을 수 없습니다.')
            }
        } catch (err: any) {
            console.error('부모 위치 조회 실패:', err)
            if (err.response?.status === 403) {
                setError('접근 권한이 없습니다. (부모님이 위치 공유를 껐을 수 있습니다)')
            } else if (err.response?.status === 404) {
                // 위치 정보 없음은 에러라기보다 상태임
                setParentLocation(null)
            } else {
                setError('위치 정보를 불러오지 못했습니다.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    // 모드가 자식일 때 초기 로드
    useEffect(() => {
        if (mode === 'child') {
            fetchParentLocation()
        }
    }, [mode])

    return {
        parentLocation,
        isLoading,
        error,
        fetchParentLocation
    }
}

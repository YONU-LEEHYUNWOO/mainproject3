import { useState, useCallback } from 'react'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
  showErrorToast?: boolean
}

/**
 * API 호출을 위한 커스텀 훅
 * 로딩 상태와 에러 처리를 자동으로 관리
 */
export const useApi = <T = any>(options: UseApiOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  /**
   * API 호출 실행
   */
  const execute = useCallback(async (apiCall: () => Promise<any>) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiCall()
      const result = response.data || response
      setData(result)
      
      if (options.onSuccess) {
        options.onSuccess(result)
      }
      
      return result
    } catch (error: any) {
      // 에러 메시지 추출
      let errorMessage = '요청 처리 중 오류가 발생했습니다.'
      
      if (error.response) {
        const detail = error.response.data?.detail
        if (typeof detail === 'string') {
          errorMessage = detail
        } else if (Array.isArray(detail)) {
          errorMessage = detail.map((err: any) => {
            const field = err.loc?.join('.') || '알 수 없는 필드'
            return `${field}: ${err.msg}`
          }).join(', ')
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      setError(errorMessage)
      
      if (options.onError) {
        options.onError(error)
      }

      // 에러 토스트 표시 (선택적)
      if (options.showErrorToast !== false) {
        console.error('API 오류:', errorMessage)
      }

      throw error
    } finally {
      setIsLoading(false)
    }
  }, [options])

  /**
   * 상태 초기화
   */
  const reset = useCallback(() => {
    setError(null)
    setData(null)
    setIsLoading(false)
  }, [])

  return {
    isLoading,
    error,
    data,
    execute,
    reset
  }
}

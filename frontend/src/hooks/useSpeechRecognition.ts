import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionState {
  isListening: boolean
  transcript: string
  error: string | null
  isSupported: boolean
}

/**
 * Web Speech API를 사용한 음성 인식 훅
 */
export const useSpeechRecognition = () => {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    transcript: '',
    error: null,
    isSupported: false
  })

  const recognitionRef = useRef<any>(null)

  /**
   * 음성 인식 지원 여부 확인
   */
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (SpeechRecognition) {
      setState(prev => ({ ...prev, isSupported: true }))
      recognitionRef.current = new SpeechRecognition()

      const recognition = recognitionRef.current
      recognition.continuous = true // 연속 인식 활성화
      recognition.interimResults = true // 중간 결과도 받기
      recognition.lang = 'ko-KR' // 한국어 설정

      // 인식 결과 이벤트
      recognition.onresult = (event: any) => {
        let fullTranscript = ''

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            fullTranscript += result[0].transcript + ' '
          } else {
            fullTranscript += result[0].transcript
          }
        }

        setState(prev => ({
          ...prev,
          transcript: fullTranscript.trim()
        }))
      }

      // 에러 이벤트
      recognition.onerror = (event: any) => {
        let errorMessage = '음성 인식 중 오류가 발생했습니다.'

        switch (event.error) {
          case 'no-speech':
            errorMessage = '음성이 감지되지 않았습니다.'
            break
          case 'audio-capture':
            errorMessage = '마이크에 접근할 수 없습니다.'
            break
          case 'not-allowed':
            errorMessage = '마이크 권한이 필요합니다.'
            break
          case 'network':
            errorMessage = '네트워크 오류가 발생했습니다.'
            break
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
          isListening: false
        }))
      }

      // 종료 이벤트
      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }))
      }
    } else {
      setState(prev => ({
        ...prev,
        isSupported: false,
        error: '브라우저가 음성 인식을 지원하지 않습니다.'
      }))
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  /**
   * 음성 인식 시작
   */
  const startListening = useCallback(() => {
    if (!state.isSupported || !recognitionRef.current) {
      setState(prev => ({
        ...prev,
        error: '음성 인식을 사용할 수 없습니다.'
      }))
      return
    }

    try {
      // 이미 실행 중이면 중지 후 다시 시작
      recognitionRef.current.stop()

      setState(prev => ({
        ...prev,
        isListening: true,
        error: null,
        transcript: ''
      }))

      // 상태 업데이트 후 약간의 지연을 주어 안전하게 시작
      setTimeout(() => {
        try {
          recognitionRef.current.start()
        } catch (e) {
          console.error('Speech start error:', e)
        }
      }, 100)
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '음성 인식을 시작할 수 없습니다.',
        isListening: false
      }))
    }
  }, [state.isSupported])

  /**
   * 음성 인식 중지
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop()
      setState(prev => ({ ...prev, isListening: false }))
    }
  }, [state.isListening])

  /**
   * 전사 결과 초기화
   */
  const resetTranscript = useCallback(() => {
    setState(prev => ({ ...prev, transcript: '' }))
  }, [])

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript
  }
}

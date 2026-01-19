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
      recognition.continuous = false // 한 번만 인식
      recognition.interimResults = true // 중간 결과도 받기
      recognition.lang = 'ko-KR' // 한국어 설정

      // 인식 결과 이벤트
      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        setState(prev => ({
          ...prev,
          transcript: finalTranscript || interimTranscript
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
      setState(prev => ({
        ...prev,
        isListening: true,
        error: null,
        transcript: ''
      }))
      recognitionRef.current.start()
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

/**
 * 음성 안내 훅
 * Web Speech API를 사용하여 시니어 친화적인 음성 안내 제공
 */

import { useCallback, useEffect, useState } from 'react'

export const useVoice = (enabled: boolean = true) => {
  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    // 브라우저 지원 여부 확인
    setIsSupported('speechSynthesis' in window)
  }, [])

  /**
   * 음성 안내 재생
   */
  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if (!enabled || !isSupported || !text) return

    // 이전 음성 중단
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ko-KR'
    utterance.rate = options?.rate || 0.9 // 약간 느리게
    utterance.pitch = options?.pitch || 1.0
    utterance.volume = options?.volume || 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [enabled, isSupported])

  /**
   * 음성 중단
   */
  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  /**
   * 페이지 이동 시 안내
   */
  const announceNavigation = useCallback((pageName: string) => {
    speak(`${pageName} 페이지로 이동합니다`)
  }, [speak])

  /**
   * 성공 메시지
   */
  const announceSuccess = useCallback((message: string) => {
    speak(`완료되었습니다. ${message}`)
  }, [speak])

  /**
   * 에러 메시지
   */
  const announceError = useCallback((message: string) => {
    speak(`오류가 발생했습니다. ${message}`)
  }, [speak])

  /**
   * 약 복용 완료 칭찬
   */
  const announceMedicineTaken = useCallback(() => {
    const messages = [
      '잘하셨습니다! 약을 드셨네요.',
      '훌륭합니다! 건강을 위한 좋은 습관이에요.',
      '잘하셨어요! 오늘도 건강하게 지내세요.',
    ]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    speak(randomMessage)
  }, [speak])

  return {
    isSupported,
    isSpeaking,
    speak,
    stop,
    announceNavigation,
    announceSuccess,
    announceError,
    announceMedicineTaken,
  }
}

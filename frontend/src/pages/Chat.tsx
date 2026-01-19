import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Send, Mic, AlertCircle } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { VoiceInputButton } from '../components/VoiceInputButton'
import { aiAPI } from '../services/api'

interface Message {
  id: number
  text: string
  isUser: boolean
  timestamp: Date
}

/**
 * Chat 페이지
 * AI 케어비서와의 대화 및 음성 입력 기능
 */
const Chat = () => {
  const location = useLocation()
  const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 음성 인식 훅
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition()

  /**
   * 음성 인식 결과를 입력창에 반영
   */
  useEffect(() => {
    if (transcript && !isListening) {
      setInputText(transcript)
      resetTranscript()
    }
  }, [transcript, isListening, resetTranscript])

  /**
   * 음성 인식 중지 시 자동으로 전송하지 않음 (사용자가 확인 후 전송)
   */
  useEffect(() => {
    if (!isListening && transcript) {
      // 음성 인식이 끝나면 입력창에만 표시하고, 자동 전송하지 않음
    }
  }, [isListening, transcript])

  /**
   * 메시지 목록 스크롤
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /**
   * 메시지 전송 핸들러
   */
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)
    setError(null)

    try {
      // AI API 호출
      const response = await aiAPI.chat({
        message: userMessage.text,
        message_type: 'chat',
        context: { mode }
      })

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: response.data?.response || response.data?.message || '응답을 생성할 수 없습니다.',
        isUser: false,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '메시지 전송에 실패했습니다.'
      setError(errorMessage)
      
      const errorMsg: Message = {
        id: Date.now() + 1,
        text: `오류: ${errorMessage}`,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Enter 키로 메시지 전송
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  /**
   * 음성 입력 토글
   */
  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="space-y-6">
      {/* 모드별 제목 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'parent' ? 'AI 케어비서와 대화 👴' : '부모님 케어 AI 상담 👨'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'parent'
            ? 'AI가 일상 생활을 도와드립니다'
            : '부모님 케어에 대한 AI 상담을 받으세요'}
        </p>
      </div>

      {/* 채팅 영역 */}
      <div className="bg-white shadow rounded-lg flex flex-col" style={{ height: '600px' }}>
        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-gray-500 mb-2">대화를 시작해보세요!</p>
                {isSpeechSupported && (
                  <p className="text-sm text-gray-400">음성 입력 버튼을 눌러 말로 대화할 수도 있습니다.</p>
                )}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {/* 로딩 표시 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 음성 인식 중 표시 */}
        {isListening && (
          <div className="px-6 py-2 bg-red-50 border-t border-red-200">
            <div className="flex items-center space-x-2 text-red-600">
              <Mic className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">음성 인식 중...</span>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {(error || speechError) && (
          <div className="px-6 py-2 bg-yellow-50 border-t border-yellow-200">
            <div className="flex items-center space-x-2 text-yellow-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error || speechError}</span>
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        <div className="border-t p-4">
          <div className="flex items-end space-x-2">
            {/* 음성 입력 버튼 */}
            <VoiceInputButton
              isListening={isListening}
              isSupported={isSpeechSupported}
              onClick={handleVoiceToggle}
            />

            {/* 텍스트 입력 */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />

            {/* 전송 버튼 */}
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              title="전송 (Enter)"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
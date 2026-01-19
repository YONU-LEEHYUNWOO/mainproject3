import { Mic, MicOff, Loader2 } from 'lucide-react'

interface VoiceInputButtonProps {
  isListening: boolean
  isSupported: boolean
  onClick: () => void
  className?: string
}

/**
 * 음성 입력 버튼 컴포넌트
 */
export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  isListening,
  isSupported,
  onClick,
  className = ''
}) => {
  if (!isSupported) {
    return null
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        isListening
          ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={isListening ? '음성 인식 중지' : '음성 입력 시작'}
    >
      {isListening ? (
        <div className="flex items-center">
          <Loader2 className="h-5 w-5 animate-spin mr-1" />
          <MicOff className="h-5 w-5" />
        </div>
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </button>
  )
}

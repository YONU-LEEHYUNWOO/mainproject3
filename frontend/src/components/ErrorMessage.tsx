import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

/**
 * 에러 메시지 컴포넌트
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>다시 시도</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

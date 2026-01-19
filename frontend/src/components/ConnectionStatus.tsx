import { Wifi, WifiOff } from 'lucide-react'

interface ConnectionStatusProps {
  isConnected: boolean
  className?: string
}

/**
 * 연결 상태 표시 컴포넌트
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isConnected ? (
        <>
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600">연결됨</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">연결 끊김</span>
        </>
      )}
    </div>
  )
}

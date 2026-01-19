import { useState, useEffect, useRef, useCallback } from 'react'

interface UseWebSocketOptions {
  url: string
  onMessage?: (data: any) => void
  onError?: (error: Event) => void
  onOpen?: () => void
  onClose?: () => void
  reconnect?: boolean
  reconnectInterval?: number
}

/**
 * WebSocket 연결을 관리하는 커스텀 훅
 */
export const useWebSocket = (options: UseWebSocketOptions) => {
  const {
    url,
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnect = true,
    reconnectInterval = 3000
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const shouldReconnectRef = useRef(true)

  /**
   * WebSocket 연결
   */
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return // 이미 연결되어 있음
    }

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      // 연결 성공
      ws.onopen = () => {
        setIsConnected(true)
        setConnectionError(null)
        if (onOpen) onOpen()
      }

      // 메시지 수신
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (onMessage) {
            onMessage(data)
          }
        } catch (error) {
          console.error('메시지 파싱 오류:', error)
        }
      }

      // 에러 발생
      ws.onerror = (error) => {
        setConnectionError('WebSocket 연결 오류가 발생했습니다.')
        if (onError) {
          onError(error)
        }
      }

      // 연결 종료
      ws.onclose = () => {
        setIsConnected(false)
        if (onClose) {
          onClose()
        }

        // 재연결 시도
        if (shouldReconnectRef.current && reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }
    } catch (error) {
      setConnectionError('WebSocket 연결을 생성할 수 없습니다.')
      console.error('WebSocket 연결 오류:', error)
    }
  }, [url, onMessage, onError, onOpen, onClose, reconnect, reconnectInterval])

  /**
   * WebSocket 연결 해제
   */
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
  }, [])

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
      return true
    } else {
      console.warn('WebSocket이 연결되지 않았습니다.')
      return false
    }
  }, [])

  // 컴포넌트 마운트 시 연결
  useEffect(() => {
    connect()

    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendMessage
  }
}

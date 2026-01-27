/**
 * 시각적 피드백 컴포넌트
 * 버튼 클릭, 작업 완료 시 애니메이션 제공
 */

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface VisualFeedbackProps {
  show: boolean
  type: 'success' | 'error' | 'info'
  message: string
  duration?: number
  onClose?: () => void
}

export const VisualFeedback: React.FC<VisualFeedbackProps> = ({
  show,
  type,
  message,
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!isVisible) return null

  const styles = {
    success: {
      bg: 'bg-green-500',
      icon: CheckCircle,
      border: 'border-green-600',
    },
    error: {
      bg: 'bg-red-500',
      icon: XCircle,
      border: 'border-red-600',
    },
    info: {
      bg: 'bg-blue-500',
      icon: AlertCircle,
      border: 'border-blue-600',
    },
  }

  const style = styles[type]
  const Icon = style.icon

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
      <div className={`${style.bg} ${style.border} border-4 text-white px-8 py-6 rounded-2xl shadow-2xl flex items-center space-x-4 min-w-[400px]`}>
        <Icon className="h-12 w-12 animate-pulse" />
        <p className="text-2xl font-bold">{message}</p>
      </div>
    </div>
  )
}

/**
 * 버튼 클릭 애니메이션 래퍼
 */
interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false)

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
    warning: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 200)
    onClick?.(e)
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${variantStyles[variant]}
        text-white px-6 py-4 rounded-xl font-bold text-lg
        transition-all transform
        ${isPressed ? 'scale-95' : 'scale-100 hover:scale-105'}
        shadow-lg hover:shadow-xl
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * 로딩 오버레이
 */
interface LoadingOverlayProps {
  show: boolean
  message?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show, message = '처리 중입니다...' }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-8 border-blue-200 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-2xl font-bold text-gray-900">{message}</p>
      </div>
    </div>
  )
}

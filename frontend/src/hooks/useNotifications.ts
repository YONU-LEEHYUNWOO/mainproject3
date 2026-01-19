import { useState, useEffect, useCallback } from 'react'
import { notificationLogsAPI } from '../services/api'

export interface NotificationSettings {
  enabled: boolean
  advanceMinutes: number // 알림 시간 (분)
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    advanceMinutes: 15
  })

  // 알림 권한 요청
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('브라우저가 알림을 지원하지 않습니다.')
      return false
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result === 'granted'
    } catch (error) {
      console.error('알림 권한 요청 실패:', error)
      return false
    }
  }, [])

  // 알림 표시
  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission !== 'granted') {
      console.warn('알림 권한이 없습니다.')
      return null
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // 알림 클릭 시 처리
      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      // 알림 표시 성공 로그 저장
      notificationLogsAPI.createLog({
        task_id: options?.tag?.replace('task-', '') || 0,
        notification_type: 'task_reminder',
        title: title,
        message: options?.body || '',
        sent_at: new Date().toISOString(),
        is_success: true
      }).catch(error => {
        console.error('알림 로그 저장 실패:', error)
      })

      // 5초 후 자동 닫기
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    } catch (error) {
      console.error('알림 표시 실패:', error)
      return null
    }
  }, [permission])

  // 일정 알림 스케줄링
  const scheduleTaskNotification = useCallback((task: any) => {
    if (!settings.enabled || permission !== 'granted') {
      return
    }

    const taskDateTime = new Date(`${task.date}T${task.time || '09:00'}`)
    const notificationTime = new Date(taskDateTime.getTime() - (settings.advanceMinutes * 60 * 1000))

    const now = new Date()
    const delay = notificationTime.getTime() - now.getTime()

    if (delay > 0) {
      setTimeout(() => {
        showNotification(
          `일정 알림: ${task.title}`,
          {
            body: `${task.time || '시간 미정'}에 예정된 일정이 있습니다.`,
            tag: `task-${task.id}`,
            requireInteraction: false
          }
        )
      }, delay)
    }
  }, [settings, permission, showNotification])

  // 초기화
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // 저장된 설정 불러오기
    const savedSettings = localStorage.getItem('notification_settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('알림 설정 로드 실패:', error)
      }
    }
  }, [])

  // 설정 저장
  const saveSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('notification_settings', JSON.stringify(updatedSettings))
  }, [settings])

  return {
    permission,
    settings,
    requestPermission,
    showNotification,
    scheduleTaskNotification,
    saveSettings
  }
}
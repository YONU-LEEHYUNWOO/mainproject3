import { useState, useEffect, useCallback, useRef } from 'react'
import { notificationLogsAPI } from '../services/api'

export interface NotificationSettings {
  enabled: boolean
  advanceMinutes: number // 알림 시간 (분)
}

// 스케줄된 알림 타이머를 저장 (task ID -> timeout ID)
const scheduledTimers: Map<string, NodeJS.Timeout> = new Map()

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
    console.log('=== 일정 알림 스케줄링 시작 ===')
    console.log('설정 enabled:', settings.enabled)
    console.log('권한:', permission)
    console.log('일정:', task)

    if (!settings.enabled) {
      console.log('❌ 알림이 비활성화되어 스케줄링 중단')
      return
    }

    if (permission !== 'granted') {
      console.log('❌ 브라우저 알림 권한이 없어 스케줄링 중단 (현재 권한:', permission + ')')
      return
    }

    if (!task.date || !task.time) {
      console.log('❌ 일정에 날짜나 시간이 없어 스케줄링 중단')
      return
    }

    const taskDateTime = new Date(`${task.date}T${task.time}`)
    // task.reminder_minutes가 양수면 사용, 아니면 settings.advanceMinutes 사용
    // (0이면 설정값 사용, 값이 있으면 해당 값 사용)
    const reminderMinutes = (task.reminder_minutes && task.reminder_minutes > 0) 
        ? task.reminder_minutes 
        : settings.advanceMinutes
    const notificationTime = new Date(taskDateTime.getTime() - (reminderMinutes * 60 * 1000))

    const now = new Date()
    const delay = notificationTime.getTime() - now.getTime()

    console.log(`📅 [일정: ${task.title}]`)
    console.log(`  - 일정 시간: ${taskDateTime.toLocaleString('ko-KR')}`)
    console.log(`  - 알림 시간: ${notificationTime.toLocaleString('ko-KR')} (${reminderMinutes}분 전)`)
    console.log(`  - 현재 시간: ${now.toLocaleString('ko-KR')}`)
    console.log(`  - 대기 시간: ${Math.floor(delay/1000)}초 (${Math.floor(delay/60000)}분)`)

    if (delay > 0) {
      const timerKey = `task-${task.id}`
      
      // 기존 타이머가 있으면 취소
      if (scheduledTimers.has(timerKey)) {
        clearTimeout(scheduledTimers.get(timerKey))
        console.log(`🔄 기존 알림 취소 후 재스케줄링`)
      }
      
      const timeoutId = setTimeout(() => {
        console.log(`🔔 [알림 실행] ${task.title}`)
        showNotification(
          `📅 일정 알림: ${task.title}`,
          {
            body: `${task.time}에 예정된 일정이 있습니다.`,
            tag: timerKey,
            requireInteraction: true
          }
        )
        scheduledTimers.delete(timerKey)
      }, delay)
      
      scheduledTimers.set(timerKey, timeoutId)
      console.log(`✅ ${Math.floor(delay/1000)}초 후 알림 예약 완료! (ID: ${timerKey})`)
    } else {
      console.log(`❌ 알림 시간이 이미 지나서 스케줄링하지 않음 (${Math.floor(delay/60000)}분 전)`)
    }
    console.log('=== 일정 알림 스케줄링 종료 ===\n')
  }, [settings, permission, showNotification])

  // 약 알림 스케줄링
  const scheduleMedicineNotification = useCallback((alarm: any) => {
    if (!settings.enabled || permission !== 'granted') return
    const times = [alarm.time_1, alarm.time_2, alarm.time_3, alarm.time_4].filter(Boolean)
    const today = new Date().toISOString().split('T')[0]
    const advanceMs = (alarm.reminder_minutes || settings.advanceMinutes) * 60 * 1000
    times.forEach(time => {
      const medicineDateTime = new Date(`${today}T${time}`)
      const notificationTime = new Date(medicineDateTime.getTime() - advanceMs)
      const delay = notificationTime.getTime() - new Date().getTime()
      if (delay > 0) {
        setTimeout(() => {
          showNotification(`💊 약 복용 알림: ${alarm.medicine_name}`, {
            body: `${time}에 약(${alarm.dosage})을 복용할 시간입니다.`,
            tag: `med-${alarm.id}-${time}`,
            requireInteraction: true
          })
        }, delay)
      }
    })
  }, [settings, permission, showNotification])

  // 초기화
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
      console.log('🔔 브라우저 알림 권한:', Notification.permission)
    } else {
      console.warn('⚠️ 이 브라우저는 알림을 지원하지 않습니다.')
    }

    // 저장된 설정 불러오기
    const savedSettings = localStorage.getItem('notification_settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(parsed)
        console.log('📥 저장된 알림 설정 로드:', parsed)
      } catch (error) {
        console.error('❌ 알림 설정 로드 실패:', error)
      }
    } else {
      console.log('📝 기본 알림 설정 사용:', settings)
    }
  }, [])

  // 설정 저장
  const saveSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('notification_settings', JSON.stringify(updatedSettings))
    console.log('💾 알림 설정 저장:', updatedSettings)
  }, [settings])

  // 모든 예약된 알림 취소
  const cancelAllScheduledNotifications = useCallback(() => {
    console.log(`🗑️ 모든 예약된 알림 취소: ${scheduledTimers.size}개`)
    scheduledTimers.forEach((timeoutId, key) => {
      clearTimeout(timeoutId)
    })
    scheduledTimers.clear()
  }, [])

  return {
    permission,
    settings,
    requestPermission,
    showNotification,
    scheduleTaskNotification,
    scheduleMedicineNotification,
    saveSettings,
    cancelAllScheduledNotifications
  }
}
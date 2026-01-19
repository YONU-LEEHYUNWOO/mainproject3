/**
 * 약 알림 관련 타입 정의
 */
export interface MedicineAlarm {
  id: number
  medicine_name: string
  dosage: string
  time_1: string
  time_2?: string
  time_3?: string
  time_4?: string
  start_date: string
  end_date?: string
  reminder_minutes?: number
  last_taken?: string
  next_reminder?: string
  is_taken?: boolean
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface MedicineAlarmCreate {
  medicine_name: string
  dosage: string
  time_1: string
  time_2?: string
  time_3?: string
  time_4?: string
  start_date: string
  end_date?: string
  reminder_minutes: number
}

export interface MedicineAlarmUpdate {
  medicine_name?: string
  dosage?: string
  time_1?: string
  time_2?: string
  time_3?: string
  time_4?: string
  start_date?: string
  end_date?: string
  reminder_minutes?: number
  is_active?: boolean
}

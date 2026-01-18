// 음성 인식 서비스
let recognition = null

// 음성 인식 시작
export const startVoiceRecognition = (onResult, onError) => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    if (onError) {
      onError(new Error('음성 인식이 지원되지 않습니다.'))
    }
    return null
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()
  
  recognition.lang = 'ko-KR'
  recognition.continuous = false
  recognition.interimResults = false

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript
    if (onResult) {
      onResult(transcript)
    }
  }

  recognition.onerror = (event) => {
    if (onError) {
      onError(event.error)
    }
  }

  recognition.start()
  return recognition
}

// 음성 인식 중지
export const stopVoiceRecognition = () => {
  if (recognition) {
    recognition.stop()
    recognition = null
  }
}

// 일정 텍스트 파싱
export const parseScheduleText = (text) => {
  const now = new Date()
  let dateTime = new Date(now)
  let title = text
  let place = ''
  let memo = ''

  // 날짜 파싱
  if (text.includes('오늘')) {
    // 오늘
  } else if (text.includes('내일')) {
    dateTime.setDate(dateTime.getDate() + 1)
  } else if (text.includes('다음주')) {
    dateTime.setDate(dateTime.getDate() + 7)
  } else if (text.includes('모레')) {
    dateTime.setDate(dateTime.getDate() + 2)
  }

  // 요일 파싱
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  days.forEach((day, index) => {
    if (text.includes(day)) {
      const currentDay = dateTime.getDay()
      const targetDay = index
      let daysToAdd = (targetDay - currentDay + 7) % 7
      if (daysToAdd === 0 && text.includes('다음주')) {
        daysToAdd = 7
      }
      dateTime.setDate(dateTime.getDate() + daysToAdd)
    }
  })

  // 시간 파싱
  const timePatterns = [
    /(\d+)시\s*(\d+)분/,
    /(\d+)시/,
    /오전\s*(\d+)시/,
    /오후\s*(\d+)시/,
    /(\d+)\s*:\s*(\d+)/
  ]

  for (const pattern of timePatterns) {
    const match = text.match(pattern)
    if (match) {
      let hour = parseInt(match[1])
      let minute = match[2] ? parseInt(match[2]) : 0

      if (text.includes('오후') && hour < 12) {
        hour += 12
      }
      if (text.includes('오전') && hour === 12) {
        hour = 0
      }

      dateTime.setHours(hour, minute, 0, 0)
      break
    }
  }

  // 장소 파싱
  const placePatterns = [
    /([가-힣\s]+병원)/,
    /([가-힣\s]+약국)/,
    /([가-힣\s]+센터)/,
    /([가-힣\s]+의원)/,
    /([가-힣\s]+클리닉)/
  ]

  for (const pattern of placePatterns) {
    const match = text.match(pattern)
    if (match) {
      place = match[1].trim()
      title = text.replace(match[0], '').trim()
      break
    }
  }

  return {
    title: title || '일정',
    dateTime: dateTime,
    place: place,
    memo: memo
  }
}

// LLM 서비스 (OpenAI GPT 사용)
import { parseScheduleText } from './voiceService'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

// LLM 호출
const callLLM = async (prompt, systemPrompt = '') => {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API 키가 설정되지 않았습니다. 로컬 파싱을 사용합니다.')
    return null
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt || 'You are a helpful assistant that parses schedule information from Korean text.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || null
  } catch (error) {
    console.error('LLM 호출 오류:', error)
    return null
  }
}

// 일정 자연어 파싱 (LLM 사용)
export const parseScheduleWithLLM = async (text) => {
  // LLM 시도
  if (OPENAI_API_KEY) {
    const systemPrompt = `다음 한국어 텍스트에서 일정 정보를 추출하여 JSON 형식으로 반환하세요.
형식: {"title": "일정 제목", "date": "YYYY-MM-DD", "time": "HH:MM", "place": "장소", "memo": "메모"}
날짜가 명시되지 않으면 오늘 날짜를 사용하세요.
시간이 명시되지 않으면 "12:00"을 사용하세요.`

    const prompt = `텍스트: "${text}"\n\n위 텍스트에서 일정 정보를 추출하여 JSON으로 반환하세요.`

    try {
      const llmResponse = await callLLM(prompt, systemPrompt)
      
      if (llmResponse) {
        // JSON 추출 시도
        const jsonMatch = llmResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            if (parsed.title) {
              return {
                title: parsed.title,
                date: parsed.date || new Date().toISOString().split('T')[0],
                time: parsed.time || '12:00',
                place: parsed.place || '',
                memo: parsed.memo || ''
              }
            }
          } catch (e) {
            console.warn('LLM JSON 파싱 실패:', e)
          }
        }
      }
    } catch (error) {
      console.warn('LLM 호출 실패, 로컬 파싱 사용:', error)
    }
  }

  // 폴백: 로컬 파싱
  return parseScheduleTextFallback(text)
}

// 로컬 파싱 (폴백)
const parseScheduleTextFallback = (text) => {
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
    date: dateTime.toISOString().split('T')[0],
    time: `${String(dateTime.getHours()).padStart(2, '0')}:${String(dateTime.getMinutes()).padStart(2, '0')}`,
    place: place,
    memo: memo
  }
}

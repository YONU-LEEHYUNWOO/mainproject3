import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// 카카오맵 SDK 동적 로드
const loadKakaoMapScript = () => {
  const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY
  console.log('🗺️ [Kakao SDK] API Key 확인:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING')
  console.log('🗺️ [Kakao SDK] import.meta.env:', import.meta.env)

  if (!apiKey) {
    console.error('❌ [Kakao SDK] VITE_KAKAO_MAP_API_KEY is missing in .env')
    return
  }

  const existingScript = document.getElementById('kakao-map-script')
  if (existingScript) {
    console.log('✅ [Kakao SDK] 스크립트가 이미 존재함')
    return
  }

  const script = document.createElement('script')
  script.id = 'kakao-map-script'
  script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer,drawing&autoload=false`
  script.async = true

  console.log('🗺️ [Kakao SDK] 스크립트 로드 시작:', script.src)
  document.head.appendChild(script)

  script.onload = () => {
    console.log('✅ [Kakao SDK] 스크립트 로드 완료')
    console.log('🗺️ [Kakao SDK] window.kakao 존재:', !!window.kakao)
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        console.log('✅ [Kakao SDK] 지도 초기화 완료')
      })
    } else {
      console.error('❌ [Kakao SDK] window.kakao.maps가 없습니다')
    }
  }

  script.onerror = (error) => {
    console.error('❌ [Kakao SDK] 스크립트 로드 실패:', error)
  }
}

loadKakaoMapScript()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
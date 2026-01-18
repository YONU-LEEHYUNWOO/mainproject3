import { useState, useEffect } from 'react'
import SeniorHome from '../components/senior/SeniorHome'
import SeniorConnect from '../components/senior/SeniorConnect'
import SeniorTaxiFavorites from '../components/senior/SeniorTaxiFavorites'
import SeniorCalendar from '../components/senior/SeniorCalendar'
import { storage } from '../utils/storage'
import { getFamilyLinkBySenior } from '../services/familyService'
import '../apps/SeniorApp.css'

function SeniorApp({ familyLink, setFamilyLink, onSwitchUserType }) {
  const [currentFamilyLink, setCurrentFamilyLink] = useState(familyLink)
  const [activeTab, setActiveTab] = useState('home') // 'home' | 'taxi' | 'calendar'

  useEffect(() => {
    // 저장된 가족 연결 정보 로드
    const savedLink = storage.getFamilyLink()
    if (savedLink) {
      setCurrentFamilyLink(savedLink)
      setFamilyLink(savedLink)
    } else {
      // 부모님 ID로 가족 연결 조회
      const userData = storage.getUserData()
      if (userData?.id) {
        const link = getFamilyLinkBySenior(userData.id)
        if (link) {
          setCurrentFamilyLink(link)
          setFamilyLink(link)
        }
      }
    }
  }, [])

  const handleConnected = (newFamilyLink) => {
    setCurrentFamilyLink(newFamilyLink)
    setFamilyLink(newFamilyLink)
  }

  const handleRequestTaxi = (favorite) => {
    // 택시 호출 처리 (옵션 B: 보호자에게 요청)
    const userData = storage.getUserData()
    const notifications = JSON.parse(localStorage.getItem('carelink_notifications') || '[]')
    notifications.push({
      id: Date.now(),
      userId: currentFamilyLink?.guardianId || userData?.id,
      type: 'taxi_request',
      title: '택시 호출 요청',
      message: `${favorite.label}로 택시 호출을 요청했습니다.`,
      data: { favorite, seniorId: currentFamilyLink?.seniorId },
      read: false,
      createdAt: new Date().toISOString()
    })
    localStorage.setItem('carelink_notifications', JSON.stringify(notifications))
    
    alert('보호자에게 택시 호출 요청을 보냈습니다!')
  }

  // 가족 연결이 없으면 연결 화면 표시
  if (!currentFamilyLink) {
    return (
      <div className="senior-app">
        {onSwitchUserType && (
          <button 
            className="user-type-switch-button senior-switch"
            onClick={onSwitchUserType}
            title="보호자 모드로 전환"
          >
            👨‍👩‍👧 보호자 모드
          </button>
        )}
        <SeniorConnect onConnected={handleConnected} familyLink={currentFamilyLink} />
      </div>
    )
  }

  return (
    <div className="senior-app">
      {/* 탭 네비게이션 */}
      <div className="senior-tabs">
        <button 
          className={`senior-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠 홈
        </button>
        <button 
          className={`senior-tab ${activeTab === 'taxi' ? 'active' : ''}`}
          onClick={() => setActiveTab('taxi')}
        >
          🚕 택시
        </button>
        <button 
          className={`senior-tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          📅 달력
        </button>
      </div>

      {/* 콘텐츠 */}
      {activeTab === 'home' ? (
        <SeniorHome familyLink={currentFamilyLink} setFamilyLink={setFamilyLink} />
      ) : activeTab === 'taxi' ? (
        <SeniorTaxiFavorites 
          familyLink={currentFamilyLink} 
          onRequestTaxi={handleRequestTaxi}
        />
      ) : (
        <SeniorCalendar familyLink={currentFamilyLink} />
      )}
      
      {onSwitchUserType && (
        <button 
          className="user-type-switch-button senior-switch"
          onClick={onSwitchUserType}
          title="보호자 모드로 전환"
        >
          👨‍👩‍👧 보호자 모드
        </button>
      )}
    </div>
  )
}

export default SeniorApp

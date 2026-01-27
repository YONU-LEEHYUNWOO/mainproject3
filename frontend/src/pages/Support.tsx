import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { HelpCircle, Book, MessageCircle, ChevronDown, ChevronUp, Shield, Settings, Phone } from 'lucide-react'

const Support = () => {
    const location = useLocation()
    const mode = location.pathname.startsWith('/parent') ? 'parent' : 'child'
    const [activeTab, setActiveTab] = useState<'faq' | 'guide' | 'contact'>('faq')

    // 부모 모드용 큰 폰트 클래스
    const isParent = mode === 'parent'
    const headerClass = isParent ? 'text-4xl' : 'text-2xl'
    const subHeaderClass = isParent ? 'text-xl' : 'text-sm'
    const tabTextClass = isParent ? 'text-lg' : 'text-sm'
    const tabPyClass = isParent ? 'py-6' : 'py-4'
    const iconSizeClass = isParent ? 'w-7 h-7' : 'w-5 h-5'

    return (
        <div className="space-y-6">
            <div>
                <h1 className={`${headerClass} font-bold text-gray-900`}>
                    {isParent ? '📞 도움말 센터' : '고객 지원 💁‍♂️'}
                </h1>
                <p className={`${subHeaderClass} text-gray-500 mt-2 font-medium`}>
                    {isParent ? '사용법이 어려우시면 언제든지 문의해주세요' : '사용 방법이 궁금하거나 도움이 필요하신가요?'}
                </p>
            </div>

            {/* 탭 네비게이션 */}
            <div className={`bg-white shadow rounded-lg overflow-hidden ${isParent ? 'border-4 border-blue-200' : ''}`}>
                <div className="flex border-b">
                    {[
                        { id: 'faq', label: '자주 묻는 질문', icon: HelpCircle },
                        { id: 'guide', label: '사용 가이드', icon: Book },
                        { id: 'contact', label: '문의하기', icon: MessageCircle },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center ${tabPyClass} ${tabTextClass} font-bold transition-all ${activeTab === tab.id
                                ? 'bg-blue-50 text-blue-600 border-b-4 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon className={`${iconSizeClass} mr-2`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className={`${isParent ? 'p-8' : 'p-6'} min-h-[400px]`}>
                    {activeTab === 'faq' && <FAQSection isParent={isParent} />}
                    {activeTab === 'guide' && <GuideSection isParent={isParent} />}
                    {activeTab === 'contact' && <ContactSection isParent={isParent} />}
                </div>
            </div>
        </div>
    )
}

// 자주 묻는 질문 섹션
const FAQSection = ({ isParent }: { isParent: boolean }) => {
    const faqs = [
        {
            q: "약 알림은 어떻게 설정하나요?",
            a: isParent 
                ? "화면 위쪽의 '약 복용' 메뉴를 누르신 후, '+약 추가하기' 버튼을 눌러주세요. 약 이름과 먹는 시간을 입력하시면 됩니다."
                : "상단 메뉴의 '약 관리' 페이지로 이동하여 '새 약 알림 추가' 버튼을 눌러주세요. 약 이름, 복용 시간, 요일 등을 설정하면 정해진 시간에 알림을 보내드립니다."
        },
        {
            q: isParent ? "긴급 도움 요청은 어떻게 하나요?" : "부모님 위치는 실시간인가요?",
            a: isParent
                ? "홈 화면의 빨간색 '도움 요청' 버튼을 누르시면 자녀분께 즉시 알림이 갑니다."
                : "네, '위치' 페이지에서 부모님의 현재 위치를 확인하실 수 있습니다. 단, 부모님의 기기 설정이나 네트워크 상태에 따라 약간의 오차가 발생할 수 있습니다."
        },
        {
            q: isParent ? "음성 안내는 어떻게 켜고 끄나요?" : "자식 계정은 어떻게 연결하나요?",
            a: isParent
                ? "화면 위쪽의 '음성 ON' 또는 '음성 OFF' 버튼을 누르시면 됩니다."
                : "부모님 기기에서 '설정' > '계정 연결' 메뉴에 있는 초대 코드를 자녀분 기기에 입력하시면 됩니다."
        },
        {
            q: "글자 크기가 너무 작아요.",
            a: "설정 메뉴의 '접근성 설정'에서 글자 크기를 '크게' 또는 '아주 크게'로 변경하실 수 있습니다."
        }
    ]

    return (
        <div className={isParent ? 'space-y-6' : 'space-y-4'}>
            <h3 className={`${isParent ? 'text-2xl' : 'text-lg'} font-semibold mb-4`}>자주 묻는 질문</h3>
            {faqs.map((faq, idx) => (
                <FAQItem key={idx} question={faq.q} answer={faq.a} isParent={isParent} />
            ))}
        </div>
    )
}

const FAQItem = ({ question, answer, isParent }: { question: string, answer: string, isParent: boolean }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className={`border ${isParent ? 'border-2' : 'border'} border-gray-200 rounded-xl overflow-hidden ${isParent ? 'shadow-md' : ''}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between ${isParent ? 'p-6' : 'p-4'} bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-100 hover:to-blue-100 text-left transition-colors`}
            >
                <span className={`${isParent ? 'text-xl' : 'text-base'} font-bold text-gray-900`}>Q. {question}</span>
                {isOpen ? <ChevronUp className={`${isParent ? 'h-7 w-7' : 'h-5 w-5'} text-gray-500`} /> : <ChevronDown className={`${isParent ? 'h-7 w-7' : 'h-5 w-5'} text-gray-500`} />}
            </button>
            {isOpen && (
                <div className={`${isParent ? 'p-6' : 'p-4'} bg-white border-t-2 border-gray-200 text-gray-700 leading-relaxed ${isParent ? 'text-lg' : 'text-base'}`}>
                    A. {answer}
                </div>
            )}
        </div>
    )
}

// 사용 가이드 섹션
const GuideSection = ({ isParent }: { isParent: boolean }) => {
    const guides = [
        {
            title: "일정 관리하기",
            icon: Settings,
            content: isParent
                ? "일정 메뉴를 누르신 후, 큰 + 버튼을 눌러 병원 방문이나 가족 행사를 등록하세요. 시작 전에 알림을 받으실 수 있습니다."
                : "달력에서 날짜를 선택하고 + 버튼을 눌러 병원 방문, 가족 행사 등 중요한 일정을 등록하세요. 시작 1시간 전에 알림을 받을 수 있습니다."
        },
        {
            title: "약 복용 체크",
            icon: Shield,
            content: isParent
                ? "약 먹을 시간이 되면 알람이 울립니다. 약을 드신 후에는 '복용 완료' 버튼을 꼭 눌러주세요."
                : "약 종류별로 복용 시간을 설정해두면 알람이 울립니다. 약을 드신 후에는 화면의 '복용 완료' 버튼을 꼭 눌러주세요."
        },
        {
            title: isParent ? "도움 요청하기" : "보안 설정",
            icon: Shield,
            content: isParent
                ? "긴급한 상황이 생기면 홈 화면의 빨간색 '도움 요청' 버튼을 누르세요. 자녀분께 즉시 알림이 갑니다."
                : "설정 메뉴에서 비밀번호 변경 및 위치 공유 권한을 관리할 수 있습니다. 주기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요."
        }
    ]

    return (
        <div className="space-y-6">
            <h3 className={`${isParent ? 'text-2xl' : 'text-lg'} font-semibold mb-4`}>화면별 사용 가이드</h3>
            <div className={`grid gap-6 ${isParent ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                {guides.map((guide, idx) => (
                    <div key={idx} className={`border ${isParent ? 'border-4' : 'border'} border-gray-200 rounded-xl ${isParent ? 'p-8' : 'p-5'} hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50`}>
                        <div className="flex items-center mb-4">
                            <div className={`${isParent ? 'p-4' : 'p-2'} bg-blue-100 rounded-xl mr-4`}>
                                <guide.icon className={`${isParent ? 'w-10 h-10' : 'w-6 h-6'} text-blue-600`} />
                            </div>
                            <h4 className={`${isParent ? 'text-2xl' : 'text-lg'} font-bold text-gray-900`}>{guide.title}</h4>
                        </div>
                        <p className={`text-gray-700 leading-relaxed ${isParent ? 'text-xl' : 'text-sm'}`}>
                            {guide.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 문의하기 섹션
const ContactSection = ({ isParent }: { isParent: boolean }) => {
    return (
        <div className="space-y-6">
            <h3 className={`${isParent ? 'text-2xl' : 'text-lg'} font-semibold mb-4`}>고객 지원 센터</h3>

            <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-4 border-blue-300 rounded-2xl ${isParent ? 'p-10' : 'p-6'} shadow-xl`}>
                <div className="flex items-start">
                    <Phone className={`${isParent ? 'w-16 h-16' : 'w-8 h-8'} text-blue-600 mr-4 mt-1 animate-pulse`} />
                    <div>
                        <h4 className={`${isParent ? 'text-3xl' : 'text-xl'} font-bold text-blue-900 mb-3`}>
                            {isParent ? '전화 상담 서비스' : '설정 대행 지원 서비스'}
                        </h4>
                        <p className={`text-blue-800 mb-6 ${isParent ? 'text-xl leading-relaxed' : 'text-base'}`}>
                            {isParent 
                                ? '사용이 어려우시면 언제든지 전화주세요. 친절하게 도와드리겠습니다.'
                                : '앱 사용이 어려우신가요? 상담원이 원격으로 설정을 도와드립니다.'}
                            <br />
                            <span className="font-semibold">(평일 09:00 ~ 18:00)</span>
                        </p>
                        <a 
                            href="tel:1588-0000" 
                            className={`inline-block bg-blue-600 text-white ${isParent ? 'px-10 py-6 text-2xl' : 'px-6 py-3 text-base'} rounded-xl font-bold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg`}
                        >
                            📞 전화 걸기 (1588-0000)
                        </a>
                    </div>
                </div>
            </div>

            {!isParent && (
                <div className="grid gap-6 md:grid-cols-2 mt-6">
                    <div className="border p-5 rounded-xl">
                        <h5 className="font-bold text-gray-900 mb-2">이메일 문의</h5>
                        <p className="text-gray-600 text-sm mb-3">
                            상세한 답변이 필요할 때 이용해주세요.
                        </p>
                        <a href="mailto:support@aicare.com" className="text-blue-600 font-medium hover:underline">
                            support@aicare.com
                        </a>
                    </div>
                    <div className="border p-5 rounded-xl">
                        <h5 className="font-bold text-gray-900 mb-2">보호자 참여 정책</h5>
                        <p className="text-gray-600 text-sm">
                            보호자 연락 미이행 시 서비스가 제한될 수 있습니다.
                            <br />
                            안전을 위해 보호자를 반드시 등록해주세요.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Support

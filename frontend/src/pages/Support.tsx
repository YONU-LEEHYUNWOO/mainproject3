import { useState } from 'react'
import { HelpCircle, Book, MessageCircle, ChevronDown, ChevronUp, Shield, Settings, Phone } from 'lucide-react'

const Support = () => {
    const [activeTab, setActiveTab] = useState<'faq' | 'guide' | 'contact'>('faq')

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">고객 지원 💁‍♂️</h1>
                <p className="text-sm text-gray-500 mt-1">
                    사용 방법이 궁금하거나 도움이 필요하신가요?
                </p>
            </div>

            {/* 탭 네비게이션 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="flex border-b">
                    {[
                        { id: 'faq', label: '자주 묻는 질문', icon: HelpCircle },
                        { id: 'guide', label: '사용 가이드', icon: Book },
                        { id: 'contact', label: '문의 및 지원', icon: MessageCircle },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon className="w-5 h-5 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6 min-h-[400px]">
                    {activeTab === 'faq' && <FAQSection />}
                    {activeTab === 'guide' && <GuideSection />}
                    {activeTab === 'contact' && <ContactSection />}
                </div>
            </div>
        </div>
    )
}

// 자주 묻는 질문 섹션
const FAQSection = () => {
    const faqs = [
        {
            q: "약 알림은 어떻게 설정하나요?",
            a: "상단 메뉴의 '약 관리' 페이지로 이동하여 '새 약 알림 추가' 버튼을 눌러주세요. 약 이름, 복용 시간, 요일 등을 설정하면 정해진 시간에 알림을 보내드립니다."
        },
        {
            q: "부모님 위치는 실시간인가요?",
            a: "네, '위치' 페이지에서 부모님의 현재 위치를 확인하실 수 있습니다. 단, 부모님의 기기 설정이나 네트워크 상태에 따라 약간의 오차가 발생할 수 있습니다."
        },
        {
            q: "자식 계정은 어떻게 연결하나요?",
            a: "부모님 기기에서 '설정' > '계정 연결' 메뉴에 있는 초대 코드를 자녀분 기기에 입력하시면 됩니다."
        },
        {
            q: "글자 크기가 너무 작아요.",
            a: "부모 모드 '설정' 메뉴 상단의 '접근성 설정'에서 글자 크기를 '크게' 또는 '아주 크게'로 변경하실 수 있습니다."
        }
    ]

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">자주 묻는 질문</h3>
            {faqs.map((faq, idx) => (
                <FAQItem key={idx} question={faq.q} answer={faq.a} />
            ))}
        </div>
    )
}

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-left transition-colors"
            >
                <span className="font-medium text-gray-900">Q. {question}</span>
                {isOpen ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
            </button>
            {isOpen && (
                <div className="p-4 bg-white border-t border-gray-200 text-gray-600 leading-relaxed">
                    A. {answer}
                </div>
            )}
        </div>
    )
}

// 사용 가이드 섹션
const GuideSection = () => {
    const guides = [
        {
            title: "일정 관리하기",
            icon: Settings,
            content: "달력에서 날짜를 선택하고 + 버튼을 눌러 병원 방문, 가족 행사 등 중요한 일정을 등록하세요. 시작 1시간 전에 알림을 받을 수 있습니다."
        },
        {
            title: "약 복용 체크",
            icon: Shield,
            content: "약 종류별로 복용 시간을 설정해두면 알람이 울립니다. 약을 드신 후에는 화면의 '복용 완료' 버튼을 꼭 눌러주세요."
        },
        {
            title: "보안 설정",
            icon: Shield,
            content: "설정 메뉴에서 비밀번호 변경 및 위치 공유 권한을 관리할 수 있습니다. 주기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요."
        }
    ]

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">화면별 사용 가이드</h3>
            <div className="grid gap-6 md:grid-cols-2">
                {guides.map((guide, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center mb-3">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                                <guide.icon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-900">{guide.title}</h4>
                        </div>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            {guide.content}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 문의하기 섹션
const ContactSection = () => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">고객 지원 센터</h3>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start">
                    <Phone className="w-8 h-8 text-blue-600 mr-4 mt-1" />
                    <div>
                        <h4 className="text-xl font-bold text-blue-900 mb-2">설정 대행 지원 서비스</h4>
                        <p className="text-blue-800 mb-4">
                            앱 사용이 어려우신가요? 상담원이 원격으로 설정을 도와드립니다.<br />
                            (평일 09:00 ~ 18:00)
                        </p>
                        <a href="tel:1588-0000" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                            전화 연결하기 (1588-0000)
                        </a>
                    </div>
                </div>
            </div>

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
        </div>
    )
}

export default Support

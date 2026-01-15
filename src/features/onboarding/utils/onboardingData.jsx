import { Calendar, CheckCircle, Circle, Home, Navigation2, ShoppingBag, MessageCircle, Settings } from 'lucide-react';

/**
 * 온보딩 단계별 데이터
 * 다국어 지원 (ko: 한국어, en: 영어, ja: 일본어)
 */
export const getOnboardingSteps = () => ({
    ko: [
        {
            title: '함께잇다에 오신 것을 환영합니다!',
            description: '가족과 함께하는 하루를 도와드리는 AI 케어비서입니다.',
            icon: <Home size={64} className="text-blue-600" />,
            content: (
                <div className="space-y-4 text-center">
                    <p className="text-lg text-slate-700" style={{ fontSize: 'var(--font-size-xl)' }}>
                        이 앱은 멀리 있는 가족들이 함께 준비한 도우미입니다.
                    </p>
                    <p className="text-base text-slate-600" style={{ fontSize: 'var(--font-size-lg)' }}>
                        일정 관리부터 길 안내까지, 편하게 도와드릴게요.
                    </p>
                </div>
            )
        },
        {
            title: '일정 관리하기',
            description: '병원 방문, 약속 등 일정을 쉽게 등록하고 관리할 수 있습니다.',
            icon: <Calendar size={64} className="text-purple-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200">
                        <p className="font-black text-purple-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            📝 일정 등록 방법
                        </p>
                        <ul className="space-y-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-black">1.</span>
                                <span>사이드바의 "일정 등록" 버튼 클릭</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-black">2.</span>
                                <span>채팅창에 "내일 오후 2시 병원 가기"처럼 말씀</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-black">3.</span>
                                <span>AI가 자동으로 일정을 등록해드립니다</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: '길 안내 받기',
            description: '병원, 마트, 약국 등 어디로든 가는 길을 안내해드립니다.',
            icon: <Navigation2 size={64} className="text-green-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
                        <p className="font-black text-green-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            🗺️ 길 안내 사용 방법
                        </p>
                        <ul className="space-y-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-black">1.</span>
                                <span>빠른 실행 버튼의 "이동" 버튼 클릭</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-black">2.</span>
                                <span>채팅창에 "병원 가기" 또는 "마트로 가는 길 알려줘"라고 말씀</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-black">3.</span>
                                <span>이동 수단 선택 후 지도와 함께 길 안내를 받으세요</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: '장보기와 식사 추천',
            description: '주변 마트와 식당을 추천해드립니다.',
            icon: <ShoppingBag size={64} className="text-orange-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-orange-50 rounded-2xl p-4 border-2 border-orange-200 mb-4">
                        <p className="font-black text-orange-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            🛒 장보기
                        </p>
                        <p className="text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            빠른 실행 버튼의 "장보기" 버튼을 누르면 주변 마트를 추천해드립니다.
                        </p>
                    </div>
                    <div className="bg-orange-50 rounded-2xl p-4 border-2 border-orange-200">
                        <p className="font-black text-orange-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            🍽️ 식사 추천
                        </p>
                        <p className="text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            채팅창에 "식사" 또는 "밥"이라고 말씀하시면 주변 식당을 추천해드립니다.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: '가족과 소통하기',
            description: '멀리 있는 가족과 메시지를 주고받을 수 있습니다.',
            icon: <MessageCircle size={64} className="text-pink-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200">
                        <p className="font-black text-pink-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            💬 가족과 소통하는 방법
                        </p>
                        <ul className="space-y-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-600 font-black">1.</span>
                                <span>사이드바의 "가족과 함께" 버튼 클릭</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-600 font-black">2.</span>
                                <span>채팅창에 메시지를 입력하면 가족에게 전달됩니다</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-600 font-black">3.</span>
                                <span>가족이 보낸 메시지는 알림 센터에서 확인할 수 있습니다</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: '설정과 도움말',
            description: '앱을 더 편하게 사용할 수 있도록 설정을 조절하고 도움을 받을 수 있습니다.',
            icon: <Settings size={64} className="text-indigo-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200 mb-4">
                        <p className="font-black text-indigo-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            ⚙️ 접근성 설정
                        </p>
                        <p className="text-slate-700 mb-2" style={{ fontSize: 'var(--font-size-base)' }}>
                            사이드바의 "접근성 설정" 버튼에서 글씨 크기와 버튼 크기를 조절할 수 있습니다.
                        </p>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200 mb-4">
                        <p className="font-black text-indigo-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            📍 위치 정보 설정
                        </p>
                        <p className="text-slate-700 mb-2" style={{ fontSize: 'var(--font-size-base)' }}>
                            사이드바의 "위치 정보 설정" 버튼에서 집, 병원, 마트, 약국 주소를 등록할 수 있습니다.
                        </p>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200">
                        <p className="font-black text-indigo-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            ❓ 도움말
                        </p>
                        <p className="text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            고객지원 섹션에서 자주 묻는 질문과 화면별 사용 가이드를 확인할 수 있습니다.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: '준비 완료!',
            description: '이제 함께잇다를 사용할 준비가 되었습니다.',
            icon: <CheckCircle size={64} className="text-green-600" />,
            content: (
                <div className="space-y-4 text-center">
                    <p className="text-lg text-slate-700 font-black" style={{ fontSize: 'var(--font-size-xl)' }}>
                        함께잇다와 함께 편안한 하루 보내세요!
                    </p>
                    <p className="text-base text-slate-600" style={{ fontSize: 'var(--font-size-lg)' }}>
                        궁금한 점이 있으시면 언제든 고객지원 섹션을 확인해주세요.
                    </p>
                </div>
            )
        }
    ],
    en: [
        {
            title: 'Welcome to Together Connected!',
            description: 'An AI care assistant that helps you with your daily life with your family.',
            icon: <Home size={64} className="text-blue-600" />,
            content: (
                <div className="space-y-4 text-center">
                    <p className="text-lg text-slate-700" style={{ fontSize: 'var(--font-size-xl)' }}>
                        This app is a helper prepared by your family who lives far away.
                    </p>
                    <p className="text-base text-slate-600" style={{ fontSize: 'var(--font-size-lg)' }}>
                        From schedule management to directions, we will help you comfortably.
                    </p>
                </div>
            )
        },
        {
            title: 'Manage Your Schedule',
            description: 'Easily register and manage schedules such as hospital visits and appointments.',
            icon: <Calendar size={64} className="text-purple-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200">
                        <p className="font-black text-purple-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            📝 How to Register a Schedule
                        </p>
                        <ul className="space-y-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-black">1.</span>
                                <span>Click the "Add Schedule" button in the sidebar</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-black">2.</span>
                                <span>Say something like "Go to the hospital tomorrow at 2 PM" in the chat</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-black">3.</span>
                                <span>The AI will automatically register the schedule</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: 'Get Directions',
            description: 'We will guide you to hospitals, marts, pharmacies, and anywhere else.',
            icon: <Navigation2 size={64} className="text-green-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
                        <p className="font-black text-green-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            🗺️ How to Use Directions
                        </p>
                        <ul className="space-y-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-black">1.</span>
                                <span>Click the "Move" button in quick actions</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-black">2.</span>
                                <span>Say "Go to hospital" or "Tell me the way to the mart" in the chat</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-black">3.</span>
                                <span>Select your transportation method and receive directions with a map</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: 'Shopping and Meal Recommendations',
            description: 'We recommend nearby marts and restaurants.',
            icon: <ShoppingBag size={64} className="text-orange-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-orange-50 rounded-2xl p-4 border-2 border-orange-200 mb-4">
                        <p className="font-black text-orange-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            🛒 Shopping
                        </p>
                        <p className="text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            Click the "Shopping" button in quick actions to get nearby mart recommendations.
                        </p>
                    </div>
                    <div className="bg-orange-50 rounded-2xl p-4 border-2 border-orange-200">
                        <p className="font-black text-orange-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            🍽️ Meal Recommendations
                        </p>
                        <p className="text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            Say "meal" or "food" in the chat to get nearby restaurant recommendations.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: 'Communicate with Family',
            description: 'You can exchange messages with your family who lives far away.',
            icon: <MessageCircle size={64} className="text-pink-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200">
                        <p className="font-black text-pink-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            💬 How to Communicate with Family
                        </p>
                        <ul className="space-y-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-600 font-black">1.</span>
                                <span>Click the "Guardian Dashboard" button in the sidebar</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-600 font-black">2.</span>
                                <span>Type a message in the chat to send it to your family</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-600 font-black">3.</span>
                                <span>You can check messages from your family in the notification center</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: 'Settings and Help',
            description: 'You can adjust settings and get help to use the app more comfortably.',
            icon: <Settings size={64} className="text-indigo-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200 mb-4">
                        <p className="font-black text-indigo-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            ⚙️ Accessibility Settings
                        </p>
                        <p className="text-slate-700 mb-2" style={{ fontSize: 'var(--font-size-base)' }}>
                            You can adjust font size and button size in the "Accessibility Settings" button in the sidebar.
                        </p>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200 mb-4">
                        <p className="font-black text-indigo-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            📍 Location Settings
                        </p>
                        <p className="text-slate-700 mb-2" style={{ fontSize: 'var(--font-size-base)' }}>
                            You can register addresses for home, hospital, mart, and pharmacy in the "Location Settings" button in the sidebar.
                        </p>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200">
                        <p className="font-black text-indigo-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            ❓ Help
                        </p>
                        <p className="text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            You can check frequently asked questions and screen-by-screen guides in the customer support section.
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: 'All Set!',
            description: 'You are now ready to use Together Connected.',
            icon: <CheckCircle size={64} className="text-green-600" />,
            content: (
                <div className="space-y-4 text-center">
                    <p className="text-lg text-slate-700 font-black" style={{ fontSize: 'var(--font-size-xl)' }}>
                        Have a comfortable day with Together Connected!
                    </p>
                    <p className="text-base text-slate-600" style={{ fontSize: 'var(--font-size-lg)' }}>
                        If you have any questions, please check the customer support section anytime.
                    </p>
                </div>
            )
        }
    ],
    ja: [
        {
            title: 'Together Connectedへようこそ！',
            description: '家族と一緒に過ごす一日をサポートするAIケアアシスタントです。',
            icon: <Home size={64} className="text-blue-600" />,
            content: (
                <div className="space-y-4 text-center">
                    <p className="text-lg text-slate-700" style={{ fontSize: 'var(--font-size-xl)' }}>
                        このアプリは、遠くに住む家族が一緒に準備したヘルパーです。
                    </p>
                    <p className="text-base text-slate-600" style={{ fontSize: 'var(--font-size-lg)' }}>
                        スケジュール管理から道案内まで、快適にお手伝いします。
                    </p>
                </div>
            )
        },
        {
            title: 'スケジュール管理',
            description: '病院の訪問、約束などのスケジュールを簡単に登録・管理できます。',
            icon: <Calendar size={64} className="text-purple-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200">
                        <p className="font-black text-purple-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            📝 スケジュール登録方法
                        </p>
                        <ul className="space-y-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-black">1.</span>
                                <span>サイドバーの「スケジュール登録」ボタンをクリック</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-black">2.</span>
                                <span>チャットで「明日午後2時に病院に行く」のように話しかける</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 font-black">3.</span>
                                <span>AIが自動的にスケジュールを登録します</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: '道案内を受ける',
            description: '病院、マート、薬局など、どこへでも行く道を案内します。',
            icon: <Navigation2 size={64} className="text-green-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-green-50 rounded-2xl p-4 border-2 border-green-200">
                        <p className="font-black text-green-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            🗺️ 道案内の使い方
                        </p>
                        <ul className="space-y-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-black">1.</span>
                                <span>クイックアクションの「移動」ボタンをクリック</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-black">2.</span>
                                <span>チャットで「病院に行く」または「マートへの道を教えて」と話しかける</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-600 font-black">3.</span>
                                <span>移動手段を選択後、地図と一緒に道案内を受けます</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: '買い物と食事の推奨',
            description: '近くのマートとレストランを推奨します。',
            icon: <ShoppingBag size={64} className="text-orange-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-orange-50 rounded-2xl p-4 border-2 border-orange-200 mb-4">
                        <p className="font-black text-orange-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            🛒 買い物
                        </p>
                        <p className="text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            クイックアクションの「買い物」ボタンを押すと、近くのマートを推奨します。
                        </p>
                    </div>
                    <div className="bg-orange-50 rounded-2xl p-4 border-2 border-orange-200">
                        <p className="font-black text-orange-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            🍽️ 食事推奨
                        </p>
                        <p className="text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            チャットで「食事」または「ご飯」と話しかけると、近くのレストランを推奨します。
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: '家族とコミュニケーション',
            description: '遠くに住む家族とメッセージをやり取りできます。',
            icon: <MessageCircle size={64} className="text-pink-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200">
                        <p className="font-black text-pink-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            💬 家族とコミュニケーションする方法
                        </p>
                        <ul className="space-y-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-600 font-black">1.</span>
                                <span>サイドバーの「家族と一緒」ボタンをクリック</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-600 font-black">2.</span>
                                <span>チャットでメッセージを入力すると家族に送信されます</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-pink-600 font-black">3.</span>
                                <span>家族が送ったメッセージは通知センターで確認できます</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: '設定とヘルプ',
            description: 'アプリをより快適に使用できるように設定を調整し、ヘルプを受けることができます。',
            icon: <Settings size={64} className="text-indigo-600" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200 mb-4">
                        <p className="font-black text-indigo-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            ⚙️ アクセシビリティ設定
                        </p>
                        <p className="text-slate-700 mb-2" style={{ fontSize: 'var(--font-size-base)' }}>
                            サイドバーの「アクセシビリティ設定」ボタンでフォントサイズとボタンサイズを調整できます。
                        </p>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200 mb-4">
                        <p className="font-black text-indigo-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            📍 位置情報設定
                        </p>
                        <p className="text-slate-700 mb-2" style={{ fontSize: 'var(--font-size-base)' }}>
                            サイドバーの「位置情報設定」ボタンで自宅、病院、マート、薬局の住所を登録できます。
                        </p>
                    </div>
                    <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200">
                        <p className="font-black text-indigo-900 mb-2" style={{ fontSize: 'var(--font-size-lg)' }}>
                            ❓ ヘルプ
                        </p>
                        <p className="text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                            カスタマーサポートセクションでよくある質問と画面別使用ガイドを確認できます。
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: '準備完了！',
            description: 'Together Connectedを使用する準備ができました。',
            icon: <CheckCircle size={64} className="text-green-600" />,
            content: (
                <div className="space-y-4 text-center">
                    <p className="text-lg text-slate-700 font-black" style={{ fontSize: 'var(--font-size-xl)' }}>
                        Together Connectedと一緒に快適な一日をお過ごしください！
                    </p>
                    <p className="text-base text-slate-600" style={{ fontSize: 'var(--font-size-lg)' }}>
                        ご不明な点がございましたら、いつでもカスタマーサポートセクションをご確認ください。
                    </p>
                </div>
            )
        }
    ]
});
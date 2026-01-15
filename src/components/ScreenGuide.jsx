import React from 'react';
import { Home, Calendar, Navigation2, ShoppingBag, Utensils, MessageCircle, Settings, Bell, Users, MapPin } from 'lucide-react';
import { t } from '../i18n';

/**
 * 화면별 사용 가이드 컴포넌트
 */
const ScreenGuide = ({ language, screenName }) => {
    // 화면별 가이드 데이터 (다국어 지원)
    const guides = {
        ko: {
            home: {
                title: '홈 화면 사용 가이드',
                icon: <Home size={48} className="text-blue-600" />,
                sections: [
                    {
                        title: '오늘의 일정',
                        description: '오늘 예정된 일정이 여기에 표시됩니다. 병원 방문, 약속 등 모든 일정을 한눈에 확인할 수 있습니다.',
                        tips: [
                            '일정을 클릭하면 상세 정보를 볼 수 있습니다',
                            '완료된 일정은 아래에 별도로 표시됩니다'
                        ]
                    },
                    {
                        title: '빠른 실행 버튼',
                        description: '자주 사용하는 기능을 빠르게 실행할 수 있습니다.',
                        tips: [
                            '장보기: 주변 마트 추천',
                            '이동: 길 안내 받기',
                            '휴식: 휴식 모드 켜기'
                        ]
                    },
                    {
                        title: 'AI 추천',
                        description: 'AI가 하루 일정과 패턴을 분석하여 추천을 제공합니다.',
                        tips: [
                            '식사 시간 추천',
                            '산책 시간 추천',
                            '약 복용 알림'
                        ]
                    },
                    {
                        title: '알림 센터',
                        description: '중요한 알림과 메시지를 한 곳에서 확인할 수 있습니다.',
                        tips: [
                            '일정 알림',
                            '보호자 메시지',
                            '약 복용 알림',
                            '무활동 경고'
                        ]
                    }
                ]
            },
            schedule: {
                title: '일정 관리 화면 사용 가이드',
                icon: <Calendar size={48} className="text-purple-600" />,
                sections: [
                    {
                        title: '일정 등록',
                        description: '새로운 일정을 등록하는 방법입니다.',
                        tips: [
                            '사이드바의 "일정 등록" 버튼 클릭',
                            '또는 채팅창에 "내일 오후 2시 병원 가기"처럼 말씀',
                            'AI가 자동으로 일정을 등록해드립니다'
                        ]
                    },
                    {
                        title: '일정 수정/삭제',
                        description: '등록된 일정을 수정하거나 삭제할 수 있습니다.',
                        tips: [
                            '일정 카드를 클릭하면 상세 정보가 표시됩니다',
                            '"수정" 버튼으로 일정 내용 변경',
                            '"삭제" 버튼으로 일정 제거'
                        ]
                    },
                    {
                        title: '일정 완료',
                        description: '완료된 일정을 체크할 수 있습니다.',
                        tips: [
                            '일정 시간이 지나면 자동으로 완료 처리됩니다',
                            '또는 수동으로 완료 체크 가능'
                        ]
                    }
                ]
            },
            navigation: {
                title: '길 안내 화면 사용 가이드',
                icon: <Navigation2 size={48} className="text-green-600" />,
                sections: [
                    {
                        title: '이동 수단 선택',
                        description: '자동차/택시, 대중교통, 도보 중에서 선택할 수 있습니다.',
                        tips: [
                            '각 이동 수단에 따라 경로와 소요 시간이 다릅니다',
                            '선택한 이동 수단에 따라 경로 색상이 구분됩니다'
                        ]
                    },
                    {
                        title: '길 안내 시작',
                        description: '"길 안내 시작" 버튼을 누르면 팝업으로 지도와 단계별 안내가 표시됩니다.',
                        tips: [
                            '지도에서 현재 위치와 목적지를 확인할 수 있습니다',
                            '하단의 단계별 안내 카드에서 상세 경로를 확인하세요',
                            '음성 안내 버튼으로 경로를 들을 수 있습니다'
                        ]
                    },
                    {
                        title: '외부 지도 앱 열기',
                        description: '카카오맵이나 네이버지도 앱으로 경로를 열 수 있습니다.',
                        tips: [
                            '단계별 안내 카드 하단의 버튼 사용',
                            '앱이 설치되어 있으면 앱으로, 없으면 웹으로 열립니다'
                        ]
                    }
                ]
            },
            shopping: {
                title: '장보기 화면 사용 가이드',
                icon: <ShoppingBag size={48} className="text-blue-600" />,
                sections: [
                    {
                        title: '주변 마트 검색',
                        description: '현재 위치를 기준으로 주변 마트를 검색합니다.',
                        tips: [
                            '거리순으로 정렬되어 표시됩니다',
                            '과거 방문한 마트는 우선 표시됩니다'
                        ]
                    },
                    {
                        title: '장바구니',
                        description: '구매할 항목을 장바구니에 추가할 수 있습니다.',
                        tips: [
                            '마트를 선택하면 장바구니 화면이 표시됩니다',
                            '항목을 추가하거나 삭제할 수 있습니다'
                        ]
                    }
                ]
            },
            meal: {
                title: '식사 추천 화면 사용 가이드',
                icon: <Utensils size={48} className="text-orange-600" />,
                sections: [
                    {
                        title: '주변 식당 검색',
                        description: '현재 위치를 기준으로 주변 식당을 검색합니다.',
                        tips: [
                            '거리순으로 정렬되어 표시됩니다',
                            '과거 방문한 식당은 우선 표시됩니다',
                            '가격대 필터로 검색할 수 있습니다'
                        ]
                    },
                    {
                        title: '식당 선택',
                        description: '원하는 식당을 선택하면 상세 정보를 볼 수 있습니다.',
                        tips: [
                            '전화번호로 바로 연락할 수 있습니다',
                            '길 안내로 식당까지 가는 길을 안내받을 수 있습니다'
                        ]
                    }
                ]
            }
        },
        en: {
            home: {
                title: 'Home Screen Guide',
                icon: <Home size={48} className="text-blue-600" />,
                sections: [
                    {
                        title: 'Today\'s Schedule',
                        description: 'Today\'s scheduled events are displayed here. You can see all schedules such as hospital visits and appointments at a glance.',
                        tips: [
                            'Click on a schedule to see detailed information',
                            'Completed schedules are displayed separately below'
                        ]
                    },
                    {
                        title: 'Quick Actions',
                        description: 'You can quickly execute frequently used functions.',
                        tips: [
                            'Shopping: Nearby mart recommendations',
                            'Move: Get directions',
                            'Rest: Turn on rest mode'
                        ]
                    },
                    {
                        title: 'AI Recommendations',
                        description: 'AI analyzes your daily schedule and patterns to provide recommendations.',
                        tips: [
                            'Meal time recommendations',
                            'Walk time recommendations',
                            'Medication reminders'
                        ]
                    },
                    {
                        title: 'Notification Center',
                        description: 'You can check important notifications and messages in one place.',
                        tips: [
                            'Schedule notifications',
                            'Guardian messages',
                            'Medication reminders',
                            'Inactivity warnings'
                        ]
                    }
                ]
            },
            schedule: {
                title: 'Schedule Management Guide',
                icon: <Calendar size={48} className="text-purple-600" />,
                sections: [
                    {
                        title: 'Register Schedule',
                        description: 'How to register a new schedule.',
                        tips: [
                            'Click the "Add Schedule" button in the sidebar',
                            'Or say something like "Go to the hospital tomorrow at 2 PM" in the chat',
                            'AI will automatically register the schedule'
                        ]
                    },
                    {
                        title: 'Edit/Delete Schedule',
                        description: 'You can edit or delete registered schedules.',
                        tips: [
                            'Click on a schedule card to see detailed information',
                            'Click "Edit" to change schedule details',
                            'Click "Delete" to remove the schedule'
                        ]
                    },
                    {
                        title: 'Complete Schedule',
                        description: 'You can check completed schedules.',
                        tips: [
                            'Schedules are automatically marked as completed after the time passes',
                            'Or you can manually check as completed'
                        ]
                    }
                ]
            },
            navigation: {
                title: 'Navigation Guide',
                icon: <Navigation2 size={48} className="text-green-600" />,
                sections: [
                    {
                        title: 'Select Transportation',
                        description: 'You can choose from car/taxi, public transport, or walking.',
                        tips: [
                            'Route and duration vary depending on the transportation method',
                            'Route color is distinguished by the selected transportation method'
                        ]
                    },
                    {
                        title: 'Start Navigation',
                        description: 'Click the "Start Navigation" button to see a popup with a map and step-by-step guidance.',
                        tips: [
                            'You can see your current location and destination on the map',
                            'Check detailed route in the step-by-step guidance card at the bottom',
                            'Use the voice guidance button to hear the route'
                        ]
                    },
                    {
                        title: 'Open External Map App',
                        description: 'You can open the route in Kakao Map or Naver Map app.',
                        tips: [
                            'Use the button at the bottom of the step-by-step guidance card',
                            'Opens in the app if installed, otherwise opens in web'
                        ]
                    }
                ]
            },
            shopping: {
                title: 'Shopping Guide',
                icon: <ShoppingBag size={48} className="text-blue-600" />,
                sections: [
                    {
                        title: 'Search Nearby Marts',
                        description: 'Searches for nearby marts based on your current location.',
                        tips: [
                            'Displayed sorted by distance',
                            'Previously visited marts are prioritized'
                        ]
                    },
                    {
                        title: 'Shopping Cart',
                        description: 'You can add items to purchase to the shopping cart.',
                        tips: [
                            'Selecting a mart shows the shopping cart screen',
                            'You can add or remove items'
                        ]
                    }
                ]
            },
            meal: {
                title: 'Meal Recommendation Guide',
                icon: <Utensils size={48} className="text-orange-600" />,
                sections: [
                    {
                        title: 'Search Nearby Restaurants',
                        description: 'Searches for nearby restaurants based on your current location.',
                        tips: [
                            'Displayed sorted by distance',
                            'Previously visited restaurants are prioritized',
                            'You can filter by price range'
                        ]
                    },
                    {
                        title: 'Select Restaurant',
                        description: 'Selecting a restaurant shows detailed information.',
                        tips: [
                            'You can call directly using the phone number',
                            'You can get directions to the restaurant'
                        ]
                    }
                ]
            }
        },
        ja: {
            home: {
                title: 'ホーム画面使用ガイド',
                icon: <Home size={48} className="text-blue-600" />,
                sections: [
                    {
                        title: '今日のスケジュール',
                        description: '今日予定されているスケジュールがここに表示されます。病院の訪問、約束など、すべてのスケジュールを一目で確認できます。',
                        tips: [
                            'スケジュールをクリックすると詳細情報を見ることができます',
                            '完了したスケジュールは下に別途表示されます'
                        ]
                    },
                    {
                        title: 'クイックアクション',
                        description: 'よく使う機能を素早く実行できます。',
                        tips: [
                            '買い物: 近くのマート推奨',
                            '移動: 道案内を受ける',
                            '休息: 休息モードをオンにする'
                        ]
                    },
                    {
                        title: 'AI推奨',
                        description: 'AIが一日のスケジュールとパターンを分析して推奨を提供します。',
                        tips: [
                            '食事時間推奨',
                            '散歩時間推奨',
                            '薬の服用リマインダー'
                        ]
                    },
                    {
                        title: '通知センター',
                        description: '重要な通知とメッセージを一箇所で確認できます。',
                        tips: [
                            'スケジュール通知',
                            '保護者メッセージ',
                            '薬の服用リマインダー',
                            '無活動警告'
                        ]
                    }
                ]
            },
            schedule: {
                title: 'スケジュール管理画面使用ガイド',
                icon: <Calendar size={48} className="text-purple-600" />,
                sections: [
                    {
                        title: 'スケジュール登録',
                        description: '新しいスケジュールを登録する方法です。',
                        tips: [
                            'サイドバーの「スケジュール登録」ボタンをクリック',
                            'またはチャットで「明日午後2時に病院に行く」のように話しかける',
                            'AIが自動的にスケジュールを登録します'
                        ]
                    },
                    {
                        title: 'スケジュール編集/削除',
                        description: '登録されたスケジュールを編集または削除できます。',
                        tips: [
                            'スケジュールカードをクリックすると詳細情報が表示されます',
                            '「編集」ボタンでスケジュール内容を変更',
                            '「削除」ボタンでスケジュールを削除'
                        ]
                    },
                    {
                        title: 'スケジュール完了',
                        description: '完了したスケジュールをチェックできます。',
                        tips: [
                            'スケジュール時間が過ぎると自動的に完了処理されます',
                            'または手動で完了チェック可能'
                        ]
                    }
                ]
            },
            navigation: {
                title: '道案内画面使用ガイド',
                icon: <Navigation2 size={48} className="text-green-600" />,
                sections: [
                    {
                        title: '移動手段選択',
                        description: '自動車/タクシー、公共交通機関、徒歩から選択できます。',
                        tips: [
                            '各移動手段によって経路と所要時間が異なります',
                            '選択した移動手段によって経路の色が区別されます'
                        ]
                    },
                    {
                        title: '道案内開始',
                        description: '「道案内開始」ボタンを押すと、ポップアップで地図と段階別案内が表示されます。',
                        tips: [
                            '地図で現在位置と目的地を確認できます',
                            '下部の段階別案内カードで詳細経路を確認してください',
                            '音声案内ボタンで経路を聞くことができます'
                        ]
                    },
                    {
                        title: '外部地図アプリを開く',
                        description: 'カカオマップやネイバーマップアプリで経路を開くことができます。',
                        tips: [
                            '段階別案内カード下部のボタンを使用',
                            'アプリがインストールされていればアプリで、なければウェブで開きます'
                        ]
                    }
                ]
            },
            shopping: {
                title: '買い物画面使用ガイド',
                icon: <ShoppingBag size={48} className="text-blue-600" />,
                sections: [
                    {
                        title: '近くのマート検索',
                        description: '現在位置を基準に近くのマートを検索します。',
                        tips: [
                            '距離順にソートされて表示されます',
                            '過去に訪問したマートは優先表示されます'
                        ]
                    },
                    {
                        title: 'ショッピングカート',
                        description: '購入する項目をショッピングカートに追加できます。',
                        tips: [
                            'マートを選択するとショッピングカート画面が表示されます',
                            '項目を追加または削除できます'
                        ]
                    }
                ]
            },
            meal: {
                title: '食事推奨画面使用ガイド',
                icon: <Utensils size={48} className="text-orange-600" />,
                sections: [
                    {
                        title: '近くのレストラン検索',
                        description: '現在位置を基準に近くのレストランを検索します。',
                        tips: [
                            '距離順にソートされて表示されます',
                            '過去に訪問したレストランは優先表示されます',
                            '価格帯フィルターで検索できます'
                        ]
                    },
                    {
                        title: 'レストラン選択',
                        description: '希望するレストランを選択すると詳細情報を見ることができます。',
                        tips: [
                            '電話番号で直接連絡できます',
                            '道案内でレストランまでの道を案内してもらえます'
                        ]
                    }
                ]
            }
        }
    };

    const guideData = guides[language] || guides.ko;
    const guide = guideData[screenName] || guideData.home;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                {guide.icon}
                <h2 className="text-2xl font-black text-slate-900" style={{ fontSize: 'var(--font-size-2xl)' }}>
                    {guide.title}
                </h2>
            </div>

            <div className="space-y-6">
                {guide.sections.map((section, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
                        <h3 className="text-xl font-black text-slate-900 mb-3" style={{ fontSize: 'var(--font-size-xl)' }}>
                            {section.title}
                        </h3>
                        <p className="text-slate-700 mb-4 leading-relaxed" style={{ fontSize: 'var(--font-size-base)' }}>
                            {section.description}
                        </p>
                        {section.tips && section.tips.length > 0 && (
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="font-black text-slate-800 mb-2" style={{ fontSize: 'var(--font-size-base)' }}>
                                    💡 팁:
                                </p>
                                <ul className="space-y-2">
                                    {section.tips.map((tip, tipIndex) => (
                                        <li key={tipIndex} className="flex items-start gap-2 text-slate-700" style={{ fontSize: 'var(--font-size-base)' }}>
                                            <span className="text-blue-600 font-black mt-1">•</span>
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScreenGuide;

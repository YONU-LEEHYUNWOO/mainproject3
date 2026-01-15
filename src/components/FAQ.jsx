import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { t } from '../i18n';

/**
 * FAQ 컴포넌트
 * 자주 묻는 질문 섹션
 */
const FAQ = ({ language }) => {
    const [openIndex, setOpenIndex] = useState(null);

    // FAQ 데이터 (다국어 지원)
    const faqData = {
        ko: [
            {
                question: '일정을 어떻게 등록하나요?',
                answer: '사이드바의 "일정 등록" 버튼을 누르거나, 채팅창에 "내일 오후 2시 병원 가기"처럼 말씀해주시면 자동으로 등록됩니다.'
            },
            {
                question: '병원 가는 길을 안내받으려면?',
                answer: '빠른 실행 버튼의 "이동" 버튼을 누르거나, 채팅창에 "병원 가기" 또는 "병원으로 가는 길 알려줘"라고 말씀해주세요.'
            },
            {
                question: '주변 식당이나 편의점을 찾으려면?',
                answer: '채팅창에 "주변 식당", "주변 편의점"처럼 말씀해주시면 주변 장소를 검색해드립니다.'
            },
            {
                question: '음성으로 명령할 수 있나요?',
                answer: '네, 채팅 입력창 옆의 마이크 버튼을 눌러 음성으로 말씀해주시면 됩니다. "병원 가기", "장보기", "일정 추가" 등을 음성으로 말씀하실 수 있습니다.'
            },
            {
                question: '글씨 크기를 크게 할 수 있나요?',
                answer: '사이드바의 "접근성 설정" 버튼을 눌러 글씨 크기와 버튼 크기를 조절할 수 있습니다.'
            },
            {
                question: '가족과 연락하려면?',
                answer: '사이드바의 "가족과 함께" 버튼을 눌러 보호자 대시보드로 이동하거나, 채팅창에 메시지를 보낼 수 있습니다.'
            },
            {
                question: '일정을 수정하거나 삭제하려면?',
                answer: '일정 목록에서 수정하고 싶은 일정을 클릭한 후 "수정" 또는 "삭제" 버튼을 누르시면 됩니다.'
            },
            {
                question: '약 복용 알림을 설정하려면?',
                answer: '채팅창에 "약 복용 알림 설정" 또는 "아침 8시에 약 알림"처럼 말씀해주시면 자동으로 설정됩니다.'
            }
        ],
        en: [
            {
                question: 'How do I register a schedule?',
                answer: 'Click the "Add Schedule" button in the sidebar, or say something like "Go to the hospital tomorrow at 2 PM" in the chat.'
            },
            {
                question: 'How do I get directions to the hospital?',
                answer: 'Click the "Move" button in the quick actions, or say "Go to hospital" or "Tell me the way to the hospital" in the chat.'
            },
            {
                question: 'How do I find nearby restaurants or convenience stores?',
                answer: 'Say "nearby restaurant" or "nearby convenience store" in the chat, and we will search for nearby places.'
            },
            {
                question: 'Can I give commands by voice?',
                answer: 'Yes, click the microphone button next to the chat input and speak. You can say "Go to hospital", "Shopping", "Add schedule", etc.'
            },
            {
                question: 'Can I make the text larger?',
                answer: 'Click the "Accessibility Settings" button in the sidebar to adjust font size and button size.'
            },
            {
                question: 'How do I contact my family?',
                answer: 'Click the "Guardian Dashboard" button in the sidebar to go to the guardian dashboard, or send a message in the chat.'
            },
            {
                question: 'How do I edit or delete a schedule?',
                answer: 'Click on the schedule you want to edit in the schedule list, then click "Edit" or "Delete".'
            },
            {
                question: 'How do I set up medication reminders?',
                answer: 'Say "Set medication reminder" or "Medicine reminder at 8 AM" in the chat, and it will be set up automatically.'
            }
        ],
        ja: [
            {
                question: 'スケジュールを登録するには？',
                answer: 'サイドバーの「スケジュール登録」ボタンをクリックするか、チャットで「明日午後2時に病院に行く」のように話しかけてください。'
            },
            {
                question: '病院への道順を知りたい場合は？',
                answer: 'クイックアクションの「移動」ボタンをクリックするか、チャットで「病院に行く」または「病院への道を教えて」と話しかけてください。'
            },
            {
                question: '近くのレストランやコンビニを探すには？',
                answer: 'チャットで「近くのレストラン」「近くのコンビニ」のように話しかけると、近くの場所を検索します。'
            },
            {
                question: '音声でコマンドできますか？',
                answer: 'はい、チャット入力欄の横のマイクボタンをクリックして話しかけてください。「病院に行く」「買い物」「スケジュール追加」などを音声で話すことができます。'
            },
            {
                question: '文字サイズを大きくできますか？',
                answer: 'サイドバーの「アクセシビリティ設定」ボタンをクリックして、フォントサイズとボタンサイズを調整できます。'
            },
            {
                question: '家族と連絡するには？',
                answer: 'サイドバーの「家族と一緒」ボタンをクリックして保護者ダッシュボードに移動するか、チャットでメッセージを送信できます。'
            },
            {
                question: 'スケジュールを編集または削除するには？',
                answer: 'スケジュールリストで編集したいスケジュールをクリックし、「編集」または「削除」ボタンをクリックしてください。'
            },
            {
                question: '薬の服用リマインダーを設定するには？',
                answer: 'チャットで「薬の服用リマインダー設定」または「朝8時に薬のリマインダー」のように話しかけると、自動的に設定されます。'
            }
        ]
    };

    const faqs = faqData[language] || faqData.ko;

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <HelpCircle size={32} className="text-blue-600" />
                <h2 className="text-2xl font-black text-slate-900" style={{ fontSize: 'var(--font-size-2xl)' }}>
                    {t('faq', language) || '자주 묻는 질문'}
                </h2>
            </div>

            <div className="space-y-3">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden transition-all duration-200 hover:border-blue-300 hover:shadow-lg"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                            style={{ minHeight: 'var(--button-size-large)' }}
                        >
                            <span className="flex-1 font-black text-slate-900 pr-4" style={{ fontSize: 'var(--font-size-lg)' }}>
                                {faq.question}
                            </span>
                            {openIndex === index ? (
                                <ChevronUp size={24} className="text-slate-400 flex-shrink-0" />
                            ) : (
                                <ChevronDown size={24} className="text-slate-400 flex-shrink-0" />
                            )}
                        </button>
                        {openIndex === index && (
                            <div className="px-5 pb-5 pt-0 border-t border-slate-100 animate-fade-in">
                                <p className="text-slate-700 leading-relaxed pt-4" style={{ fontSize: 'var(--font-size-base)' }}>
                                    {faq.answer}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQ;

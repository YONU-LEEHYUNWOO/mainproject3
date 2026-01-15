/**
 * 음성 명령 처리 유틸리티
 * 음성 인식 결과에서 직접 명령을 감지하고 처리
 */

/**
 * 음성 명령 타입 정의
 */
export const VOICE_COMMAND_TYPES = {
    HOSPITAL: 'hospital',           // 병원 가기
    SHOPPING: 'shopping',           // 장보기
    MOVEMENT: 'movement',           // 이동 지원
    REST_MODE: 'rest_mode',         // 휴식 모드
    REST_MODE_OFF: 'rest_mode_off', // 휴식 모드 종료
    SETTINGS: 'settings',           // 설정
    HELP: 'help',                   // 도움말
    UNKNOWN: 'unknown'              // 알 수 없는 명령
};

/**
 * 음성 명령 키워드 매핑
 */
const COMMAND_KEYWORDS = {
    [VOICE_COMMAND_TYPES.HOSPITAL]: [
        '병원', '병원 가', '병원 가기', '병원 가자', '병원 가야', '병원 가야 해',
        '병원 가야 해요', '병원 가야겠어', '병원 가볼까', '병원 가볼래',
        '병원 방문', '병원 예약', '병원 갈래', '병원 갈게', '병원 갈까',
        '병원으로', '병원으로 가', '병원으로 가기', '병원으로 가자'
    ],
    [VOICE_COMMAND_TYPES.SHOPPING]: [
        '장보기', '장보러', '장보러 가', '장보러 가기', '장보러 가자', '장보러 가야',
        '장보러 가야 해', '장보러 가야 해요', '장보러 가야겠어', '장보러 가볼까',
        '장을 보러', '장을 보러 가', '장을 보러 가기', '장을 보러 가자',
        '마트', '마트 가', '마트 가기', '마트 가자', '마트 가야', '마트 가야 해',
        '마트 가볼까', '마트로', '마트로 가', '마트로 가기', '마트로 가자',
        '쇼핑', '쇼핑 가', '쇼핑 가기', '쇼핑 가자', '쇼핑 하러', '쇼핑 하러 가'
    ],
    [VOICE_COMMAND_TYPES.MOVEMENT]: [
        '이동', '이동 지원', '이동 도와', '이동 도와줘', '이동 도와주세요',
        '길 안내', '길 찾기', '길 찾아', '길 찾아줘', '길 찾아주세요',
        '가야 해', '가야 해요', '가야겠어', '가볼까', '가볼래', '갈래',
        '어디로 가', '어디로 가야', '어디로 가야 해', '어디로 가야 해요'
    ],
    [VOICE_COMMAND_TYPES.REST_MODE]: [
        '휴식', '휴식 모드', '휴식 모드 켜', '휴식 모드 켜줘', '휴식 모드 켜주세요',
        '휴식 모드 시작', '휴식 모드 시작해', '휴식 모드 시작해줘', '휴식 모드 시작해주세요',
        '쉬자', '쉬어야', '쉬어야 해', '쉬어야 해요', '쉬고 싶어', '쉬고 싶어요',
        '쉬고 싶다', '쉬고 싶어요', '쉬어야겠어', '쉬어야겠어요'
    ],
    [VOICE_COMMAND_TYPES.REST_MODE_OFF]: [
        '휴식 모드 꺼', '휴식 모드 꺼줘', '휴식 모드 꺼주세요', '휴식 모드 종료',
        '휴식 모드 종료해', '휴식 모드 종료해줘', '휴식 모드 종료해주세요',
        '휴식 모드 끝', '휴식 모드 끝내', '휴식 모드 끝내줘', '휴식 모드 끝내주세요',
        '쉬는 거 끝', '쉬는 거 끝내', '쉬는 거 끝내줘', '쉬는 거 끝내주세요'
    ],
    [VOICE_COMMAND_TYPES.SETTINGS]: [
        '설정', '설정 열', '설정 열어', '설정 열어줘', '설정 열어주세요',
        '설정 보', '설정 보여', '설정 보여줘', '설정 보여주세요',
        '설정 가', '설정 가기', '설정 가자', '설정으로', '설정으로 가'
    ],
    [VOICE_COMMAND_TYPES.HELP]: [
        '도움말', '도움말 보', '도움말 보여', '도움말 보여줘', '도움말 보여주세요',
        '도와줘', '도와주세요', '무엇을 할 수', '무엇을 할 수 있어', '무엇을 할 수 있어요',
        '뭐 할 수', '뭐 할 수 있어', '뭐 할 수 있어요', '어떻게 해', '어떻게 해요',
        '사용법', '사용법 알려', '사용법 알려줘', '사용법 알려주세요',
        '명령어', '명령어 알려', '명령어 알려줘', '명령어 알려주세요'
    ]
};

/**
 * 음성 명령 감지
 * @param {string} text - 음성 인식 결과 텍스트
 * @returns {Object} 명령 정보 { type: string, confidence: number, matchedKeyword: string }
 */
export const detectVoiceCommand = (text) => {
    if (!text || typeof text !== 'string') {
        return { type: VOICE_COMMAND_TYPES.UNKNOWN, confidence: 0, matchedKeyword: null };
    }

    const normalizedText = text.trim().toLowerCase();
    let bestMatch = { type: VOICE_COMMAND_TYPES.UNKNOWN, confidence: 0, matchedKeyword: null };

    // 각 명령 타입별로 키워드 매칭
    for (const [commandType, keywords] of Object.entries(COMMAND_KEYWORDS)) {
        for (const keyword of keywords) {
            const normalizedKeyword = keyword.toLowerCase();
            
            // 정확한 일치 (높은 신뢰도)
            if (normalizedText === normalizedKeyword) {
                return { 
                    type: commandType, 
                    confidence: 1.0, 
                    matchedKeyword: keyword 
                };
            }
            
            // 포함 여부 확인 (중간 신뢰도)
            if (normalizedText.includes(normalizedKeyword)) {
                const confidence = normalizedKeyword.length / normalizedText.length;
                if (confidence > bestMatch.confidence) {
                    bestMatch = {
                        type: commandType,
                        confidence: Math.min(confidence, 0.9), // 최대 0.9로 제한
                        matchedKeyword: keyword
                    };
                }
            }
        }
    }

    // 신뢰도가 0.3 이상이면 명령으로 인식
    if (bestMatch.confidence >= 0.3) {
        return bestMatch;
    }

    return { type: VOICE_COMMAND_TYPES.UNKNOWN, confidence: 0, matchedKeyword: null };
};

/**
 * 음성 명령 도움말 생성
 * @param {string} language - 언어 코드 ('ko', 'en', 'ja')
 * @returns {string} 도움말 텍스트
 */
export const getVoiceCommandHelp = (language = 'ko') => {
    const helpTexts = {
        ko: `🎤 **음성 명령 사용법**

다음 명령어를 말씀하시면 바로 실행됩니다:

**병원 관련**
• "병원 가기", "병원 가자", "병원 가야 해"

**장보기 관련**
• "장보기", "장보러 가", "마트 가기"

**이동 지원**
• "이동", "길 안내", "길 찾기"

**휴식 모드**
• "휴식 모드", "휴식 모드 켜", "쉬자"
• "휴식 모드 꺼", "휴식 모드 종료"

**기타**
• "설정", "도움말"

💡 **팁**: 마이크 버튼을 누르고 명령어를 말씀하시면 됩니다!`,
        en: `🎤 **Voice Command Guide**

Say these commands to execute actions:

**Hospital**
• "Go to hospital", "Hospital"

**Shopping**
• "Shopping", "Go shopping", "Go to mart"

**Navigation**
• "Navigation", "Find route", "Get directions"

**Rest Mode**
• "Rest mode", "Turn on rest mode"
• "Turn off rest mode", "End rest mode"

**Others**
• "Settings", "Help"

💡 **Tip**: Press and hold the microphone button, then say the command!`,
        ja: `🎤 **音声コマンドガイド**

以下のコマンドを話すと実行されます：

**病院関連**
• "病院へ", "病院に行く"

**買い物関連**
• "買い物", "買い物に行く", "マートへ"

**ナビゲーション**
• "移動", "道案内", "ルート検索"

**休憩モード**
• "休憩モード", "休憩モードON"
• "休憩モードOFF", "休憩モード終了"

**その他**
• "設定", "ヘルプ"

💡 **ヒント**: マイクボタンを押してコマンドを話してください！`
    };

    return helpTexts[language] || helpTexts.ko;
};

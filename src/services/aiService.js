// 환경 변수에서 API 키와 모델 로드
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";

/**
 * 다중 에이전트 AI 분석 함수
 * @param {string} userQuery - 사용자 입력 쿼리
 * @param {number} retryCount - 재시도 횟수 (기본값: 0)
 * @param {string} systemPrompt - 시스템 프롬프트
 * @returns {Promise<Object>} 분석 결과
 */
export const fetchMultiAgentAnalysis = async (userQuery, retryCount = 0, systemPrompt) => {
    // 캐시 확인
    const { getCachedGeminiResponse, setCachedGeminiResponse } = await import('../utils/apiCache');
    const cached = getCachedGeminiResponse(userQuery);
    if (cached) {
        return cached;
    }

    // API 키가 없으면 에러
    if (!apiKey || apiKey === '') {
        throw new Error('API 키가 설정되지 않았습니다. .env 파일에 VITE_GEMINI_API_KEY를 설정해주세요.');
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: `현재 시간: ${new Date().toLocaleString()}\n사용자 입력: "${userQuery}"\n\n위 입력을 분석해서 반드시 지정된 JSON 형식으로만 응답해.` }]
                }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                generationConfig: {
                    responseMimeType: "application/json",
                    temperature: 0.1,
                    maxOutputTokens: 500 // 토큰 수 제한으로 비용 절감
                }
            })
        });

        if (!response.ok) throw new Error('API Response Error');

        const result = await response.json();
        let rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error('Empty AI response');

        // JSON 추출 (코드 블록 제거)
        rawText = rawText.trim();
        rawText = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

        // JSON 객체 찾기
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn('⚠️ JSON 형식이 아닌 응답입니다. 기본 응답을 반환합니다.', rawText);
            // JSON이 아닌 경우 기본 구조 반환
            return {
                type: 'schedule',
                title: userQuery,
                date: new Date().toISOString().split('T')[0],
                time: '12:00',
                analysis: {
                    requirements: [],
                    work: '',
                    life: ''
                }
            };
        }

        let parsedData;
        try {
            parsedData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
            console.error('JSON 파싱 오류:', parseError);
            console.error('파싱 시도한 JSON:', jsonMatch[0]);
            console.error('원본 응답:', rawText);
            // 파싱 실패 시 기본 구조 반환
            return {
                type: 'schedule',
                title: userQuery,
                date: new Date().toISOString().split('T')[0],
                time: '12:00',
                analysis: {
                    requirements: [],
                    work: '',
                    life: ''
                }
            };
        }

        if (parsedData.analysis && !Array.isArray(parsedData.analysis.requirements)) {
            parsedData.analysis.requirements = [];
        }

        // 캐시에 저장
        setCachedGeminiResponse(userQuery, parsedData);

        return parsedData;

    } catch (error) {
        if (retryCount < 2) { // 재시도 횟수 감소 (3회 -> 2회)
            await new Promise(r => setTimeout(r, 1000 * (retryCount + 1))); // 지수 백오프
            return fetchMultiAgentAnalysis(userQuery, retryCount + 1, systemPrompt);
        }
        throw error;
    }
};

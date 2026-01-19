"""
AI 서비스 모듈
Google Gemini API를 사용하여 AI 분석 및 채팅 기능을 제공합니다.
"""

import json
import time
from typing import Dict, List, Optional, Tuple
import google.generativeai as genai

# 패키지 import와 직접 실행 모두 지원
try:
    from config import GEMINI_API_KEY, GEMINI_MODEL
except ImportError:
    from backend.config import GEMINI_API_KEY, GEMINI_MODEL

class AIService:
    """AI 서비스 클래스"""

    def __init__(self):
        """AI 서비스 초기화"""
        self.api_available = bool(GEMINI_API_KEY)

        if self.api_available:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel(GEMINI_MODEL or 'gemini-2.5-flash')
        else:
            self.model = None
            print("WARNING: GEMINI_API_KEY가 설정되지 않아 AI 기능이 비활성화됩니다.")

        # 시스템 프롬프트 설정
        self.system_prompts = {
            "general": """
당신은 노인을 위한 AI 케어비서입니다. 친절하고 이해하기 쉬운 언어로 응답해주세요.
다음과 같은 상황에서 도움을 줄 수 있습니다:
- 일상 대화
- 건강 관리 조언
- 약 복용 알림
- 일정 관리
- 긴급 상황 대응

항상 공감하고 지원적인 태도를 유지하세요.
""",
            "schedule": """
당신은 사용자의 일정 관리 비서입니다.
사용자의 메시지에서 일정 정보를 추출하고, 일정 생성을 도와주세요.

응답 형식:
- 일정 정보가 있으면: "일정을 생성했습니다: [제목] - [날짜] [시간] [장소]"
- 일정 정보가 없으면: 일반적인 일정 관리 도움말 제공
""",
            "health": """
당신은 건강 관리 비서입니다.
사용자의 건강 관련 질문에 답변하고, 적절한 건강 조언을 제공하세요.

주의사항:
- 전문적인 의학적 조언을 하지 말고, 일반적인 건강 관리 팁만 제공
- 증상이 심각하면 전문의를 찾도록 권유
- 긍정적이고 지지적인 태도 유지
""",
            "medicine": """
당신은 약 복용 관리 비서입니다.
약 복용 시간, 복용법, 상호작용 등에 대한 정보를 제공하세요.

안전 수칙:
- 약 복용 지침을 엄격히 따를 것
- 약 변경은 반드시 의사와 상의할 것
- 부작용이 있으면 즉시 전문가에게 알릴 것
"""
        }

    def _get_system_prompt(self, conversation_type: str = "general") -> str:
        """대화 타입에 따른 시스템 프롬프트 반환"""
        return self.system_prompts.get(conversation_type, self.system_prompts["general"])

    def _extract_schedule_info(self, text: str) -> Optional[Dict]:
        """
        텍스트에서 일정 정보 추출
        간단한 패턴 매칭과 AI를 사용하여 일정 정보를 추출합니다.
        """
        prompt = f"""
다음 텍스트에서 일정 정보를 추출해주세요. JSON 형식으로 응답하세요.

텍스트: {text}

응답 형식:
{{
    "title": "일정 제목",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "location": "장소 (없으면 null)",
    "description": "상세 설명 (없으면 null)"
}}

일정 정보가 없으면 null을 반환하세요.
"""

        try:
            response = self.model.generate_content(prompt)
            result = response.text.strip()

            # JSON 파싱 시도
            if result.startswith('{') and result.endswith('}'):
                parsed = json.loads(result)
                return parsed if parsed.get('title') else None
            elif result.lower() == 'null':
                return None
            else:
                return None
        except Exception as e:
            print(f"일정 추출 오류: {e}")
            return None

    def analyze_text(self, text: str, analysis_type: str = "general") -> Dict:
        """
        텍스트 분석
        입력 텍스트를 분석하여 의도, 감정, 개체 등을 추출합니다.
        """
        if not self.api_available:
            return {
                "response": f"[AI 비활성화] {text}에 대한 분석을 수행할 수 없습니다. GEMINI_API_KEY를 설정해주세요.",
                "intent": analysis_type,
                "sentiment": "neutral",
                "confidence": 0.0,
                "entities": {},
                "tokens_used": 0,
                "processing_time": 0.0,
                "model_version": "disabled"
            }

        start_time = time.time()

        system_prompt = self._get_system_prompt(analysis_type)

        prompt = f"""{system_prompt}

사용자 입력: {text}

다음 형식으로 분석 결과를 JSON으로 응답해주세요:
{{
    "response": "AI의 응답 메시지",
    "intent": "사용자의 의도 (schedule, health, medicine, general, emergency)",
    "sentiment": "감정 분석 (positive, negative, neutral)",
    "confidence": 0.95,
    "entities": {{
        "dates": ["추출된 날짜들"],
        "times": ["추출된 시간들"],
        "locations": ["추출된 장소들"],
        "medicines": ["추출된 약 이름들"]
    }}
}}
"""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()

            # JSON 파싱
            if result_text.startswith('{'):
                result = json.loads(result_text)
            else:
                # JSON이 아닌 경우 기본 응답 생성
                result = {
                    "response": result_text,
                    "intent": analysis_type,
                    "sentiment": "neutral",
                    "confidence": 0.7,
                    "entities": {}
                }

            # 메타데이터 추가
            processing_time = time.time() - start_time

            # 토큰 사용량 추출 (버전 호환성 고려)
            tokens_used = 0
            try:
                usage_metadata = getattr(response, 'usage_metadata', None)
                if usage_metadata:
                    tokens_used = getattr(usage_metadata, 'total_tokens', 0)
            except:
                pass  # 토큰 정보 추출 실패 시 0으로 유지

            result.update({
                "tokens_used": tokens_used,
                "processing_time": processing_time,
                "model_version": GEMINI_MODEL
            })

            return result

        except Exception as e:
            print(f"AI 분석 오류: {e}")
            return {
                "response": "죄송합니다. 분석 중 오류가 발생했습니다. 다시 시도해주세요.",
                "intent": "general",
                "sentiment": "neutral",
                "confidence": 0.0,
                "entities": {},
                "tokens_used": 0,
                "processing_time": time.time() - start_time,
                "model_version": GEMINI_MODEL,
                "error": str(e)
            }

    def extract_schedule(self, text: str) -> Dict:
        """
        일정 정보 추출 전용 메서드
        텍스트에서 일정 정보를 추출합니다.
        """
        if not self.api_available:
            return {
                "extracted_tasks": [],
                "confidence": 0.0,
                "analysis": "[AI 비활성화] 일정 추출 기능을 사용할 수 없습니다."
            }

        start_time = time.time()

        # 일정 추출
        schedule_info = self._extract_schedule_info(text)

        if schedule_info:
            return {
                "extracted_tasks": [schedule_info],
                "confidence": 0.85,
                "analysis": f"일정 정보를 성공적으로 추출했습니다: {schedule_info.get('title', '알 수 없음')}",
                "processing_time": time.time() - start_time
            }
        else:
            return {
                "extracted_tasks": [],
                "confidence": 0.0,
                "analysis": "텍스트에서 일정 정보를 찾을 수 없습니다.",
                "processing_time": time.time() - start_time
            }

    def chat_response(self, message: str, conversation_type: str = "general",
                     context: Optional[Dict] = None) -> Dict:
        """
        채팅 응답 생성
        사용자의 메시지에 대한 AI 응답을 생성합니다.
        """
        if not self.api_available:
            return {
                "message": f"[AI 비활성화] 죄송합니다. 현재 AI 서비스를 사용할 수 없습니다. GEMINI_API_KEY를 설정해주세요.",
                "conversation_type": conversation_type,
                "intent": None,
                "entities": None,
                "sentiment": None,
                "confidence": 0.0,
                "tokens_used": 0,
                "processing_time": 0.0,
                "model_version": "disabled"
            }

        start_time = time.time()

        system_prompt = self._get_system_prompt(conversation_type)

        # 컨텍스트 정보 추가
        context_str = ""
        if context:
            context_str = f"\n컨텍스트 정보: {json.dumps(context, ensure_ascii=False)}"

        prompt = f"""{system_prompt}{context_str}

사용자: {message}

친절하고 도움이 되는 응답을 해주세요:
"""

        try:
            response = self.model.generate_content(prompt)
            ai_response = response.text.strip()

            # 토큰 사용량 추출 (버전 호환성 고려)
            tokens_used = 0
            try:
                usage_metadata = getattr(response, 'usage_metadata', None)
                if usage_metadata:
                    tokens_used = getattr(usage_metadata, 'total_tokens', 0)
            except:
                pass  # 토큰 정보 추출 실패 시 0으로 유지

            return {
                "message": ai_response,
                "conversation_type": conversation_type,
                "confidence": 0.9,
                "tokens_used": tokens_used,
                "processing_time": time.time() - start_time,
                "model_version": GEMINI_MODEL
            }

        except Exception as e:
            print(f"채팅 응답 생성 오류: {e}")
            return {
                "message": "죄송합니다. 응답 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
                "conversation_type": conversation_type,
                "confidence": 0.0,
                "tokens_used": 0,
                "processing_time": time.time() - start_time,
                "model_version": GEMINI_MODEL,
                "error": str(e)
            }

    def detect_emergency(self, text: str) -> Tuple[bool, float]:
        """
        긴급 상황 감지
        텍스트에서 긴급 상황 키워드를 분석합니다.
        """
        emergency_keywords = [
            "도움", "응급", "병원", "119", "아파", "다쳤", "위험", "급해",
            "쓰러졌", "의식", "호흡", "심장", "출혈", "골절", "화상"
        ]

        text_lower = text.lower()
        keyword_count = sum(1 for keyword in emergency_keywords if keyword in text_lower)

        # 긴급 키워드 비율 계산
        words = text.split()
        if not words:
            return False, 0.0

        ratio = keyword_count / len(words)
        is_emergency = ratio > 0.1 or keyword_count >= 3

        confidence = min(ratio * 10, 1.0)  # 0.0 ~ 1.0 범위로 정규화

        return is_emergency, confidence
"""
AI 서비스 모듈
Google Gemini API를 사용하여 AI 분석 및 채팅 기능을 제공합니다.
"""

import json
import time
import re
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
            self.model = genai.GenerativeModel(GEMINI_MODEL or 'gemini-1.5-flash')
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
- 위치 및 길찾기 안내

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

    async def _extract_schedule_info(self, text: str) -> Optional[Dict]:
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
            response = await self.model.generate_content_async(prompt)
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

    async def analyze_text(self, text: str, analysis_type: str = "general") -> Dict:
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
    "intent": "사용자의 의도 (schedule, health, medicine, general, emergency, search_place, route_info)",
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
            response = await self.model.generate_content_async(prompt)
            result_text = response.text.strip()
            
            # 마크다운 코드 블록 제거 (```json ... ```)
            if result_text.startswith('```'):
                result_text = result_text.replace('```json', '').replace('```', '').strip()

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

            # 토큰 사용량 추출
            tokens_used = 0
            try:
                usage_metadata = getattr(response, 'usage_metadata', None)
                if usage_metadata:
                    tokens_used = getattr(usage_metadata, 'total_tokens', 0)
            except:
                pass

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

    async def extract_schedule(self, text: str) -> Dict:
        """
        일정 정보 추출 전용 메서드
        """
        if not self.api_available:
            return {
                "extracted_tasks": [],
                "confidence": 0.0,
                "analysis": "[AI 비활성화] 일정 추출 기능을 사용할 수 없습니다."
            }

        start_time = time.time()

        # 일정 추출
        schedule_info = await self._extract_schedule_info(text)

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

    async def chat_response(self, message: str, conversation_type: str = "general", context: Dict = None) -> Dict:
        """
        AI 채팅 응답 생성 (Gemini SDK 사용)
        """
        if not self.api_available:
            return {
                "message": "죄송합니다. 현재 인공지능 비서 서비스를 이용할 수 없습니다.",
                "action": None,
                "conversation_type": "error",
                "confidence": 0.0
            }

        start_time = time.time()
        
        # 시스템 프롬프트 준비
        system_prompt = self._get_system_prompt(conversation_type)
        mode = context.get('mode', 'parent') if context else 'parent'
        managed_user_id = context.get('target_id') if context else None
        
        context_str = f"\n현재 모드: {mode}"
        if managed_user_id:
            context_str += f"\n대상 사용자 ID (부모님): {managed_user_id}"

        prompt = f"""{system_prompt}{context_str}

오늘 날짜: {time.strftime('%Y년 %m월 %d일 %A')}

사용자: {message}

다음 지침을 철저히 따르세요:

1. [응답 필수 원칙]
   **반드시 사용자의 말에 대답하는 친절한 한국어 문장을 먼저 작성하세요.** [ACTION] 태그만 보내서는 절대 안 됩니다.
   예: "네, 주변 편의점을 검색해드릴게요. [ACTION]..." (O) / "[ACTION]..." (X)

2. [일정 등록 및 장소 확인 워크플로우]
   사용자가 "내일 롯데리아에서 점심약속 추가해줘"와 같이 일정과 장소를 함께 말하면:
   - 날짜, 시간, 제목이 확실하다면 **먼저 [ACTION] ADD_TASK를 수행**하여 일정을 저장하세요.
   - 이때 장소가 "롯데리아", "스타벅스"처럼 지점이 여러 개일 수 있어 모호하다면, 응답 메시지에 "일정은 먼저 저장했습니다. 장소는 어느 지점으로 찾을까요? (현재 위치 기준 또는 특정 동네 이름)"와 같이 **후속 질문**을 반드시 포함하세요.

3. [독립적 장소 검색 및 길안내]
   사용자가 "주변 편의점/병원/식당 알려줘" 또는 "강남역 어떻게 가?"라고 물으면:
   - 즉시 [ACTION] SEARCH 또는 SEARCH_STORE를 사용하여 길안내 화면으로 유도하세요.
   - 예: "네, 주변 편의점을 찾아드릴게요. [ACTION]{{"type": "SEARCH_STORE", "query": "편의점", "category": "brand"}}[/ACTION]"

4. [액션 형식]
   - 일정 추가: [ACTION]{{"type": "ADD_TASK", "task": {{"title": "제목", "date": "YYYY-MM-DD", "time": "HH:MM", "location": "장소", "category": "일반"}}}}[/ACTION]
   - 장소 검색: [ACTION]{{"type": "SEARCH", "query": "검색어"}}[/ACTION] 또는 [ACTION]{{"type": "SEARCH_STORE", "query": "검색어", "category": "brand"}}[/ACTION]
   - 보호자 호출: [ACTION]{{"type": "CALL_GUARDIAN"}}[/ACTION]

5. [말투]
   - 항상 공손하고 노년층에게 친숙한 다정한 말투를 사용하세요. (~해요, ~해드릴게요)
"""

        try:
            print(f"--- AI 요청 시작: {message} ---")
            response = await self.model.generate_content_async(prompt)
            full_text = response.text.strip()
            print(f"--- RAW AI 응답 ---\n{full_text}\n------------------")
            
            # [ACTION] 태그 파싱
            action_data = None
            clean_message = full_text
            
            # 모든 [ACTION]...[/ACTION] 패턴 찾기
            action_pattern = r'\[ACTION\](.*?)\[/ACTION\]'
            actions = re.findall(action_pattern, full_text, re.DOTALL)
            
            if actions:
                # 마지막 액션 취득
                last_action_str = actions[-1].strip()
                try:
                    action_data = json.loads(last_action_str)
                    print(f"✅ 파싱된 액션: {action_data}")
                    # 모든 태그 제거된 텍스트 추출
                    clean_message = re.sub(action_pattern, '', full_text, flags=re.DOTALL).strip()
                except Exception as e:
                    print(f"❌ 액션 JSON 파싱 오류: {e} (Raw: {last_action_str})")

            # AI가 텍스트 없이 태그만 보낸 경우를 대비한 기본 응답
            if not clean_message or len(clean_message.strip()) < 2:
                if action_data:
                    a_type = action_data.get("type")
                    query = action_data.get("query", "요청하신 장소")
                    if a_type == "ADD_TASK":
                        clean_message = "네, 말씀하신 일정을 정확히 등록해 드릴게요."
                    elif a_type in ["SEARCH", "SEARCH_STORE"]:
                        clean_message = f"네, 주변 {query} 정보를 지도에서 찾아 드릴게요."
                    elif a_type == "CALL_GUARDIAN":
                        clean_message = "네, 바로 보호자님께 연락해 드릴게요."
                    else:
                        clean_message = "네, 요청하신 내용을 처리 중입니다."
                else:
                    clean_message = "네, 무엇을 도와드릴까요? 말씀해 주세요."

            # 토큰 사용량 추출
            tokens_used = 0
            try:
                usage_metadata = getattr(response, 'usage_metadata', None)
                if usage_metadata:
                    tokens_used = getattr(usage_metadata, 'total_tokens', 0)
            except:
                pass

            print(f"📢 최종 처리된 메시지: {clean_message}")

            return {
                "message": clean_message.strip(),
                "action": action_data,
                "conversation_type": conversation_type,
                "confidence": 0.9,
                "tokens_used": tokens_used,
                "processing_time": time.time() - start_time,
                "model_version": GEMINI_MODEL
            }

        except Exception as e:
            error_type = type(e).__name__
            error_msg = f"💥 AI 오류 발생: {error_type}: {str(e)}"
            print(error_msg)
            
            # 사용자에게 보여줄 메시지 정제
            friendly_message = "인공지능 비서와 연결이 잠시 지연되고 있습니다. 다시 한번만 말씀해 주시겠어요?"
            if "ResourceExhausted" in error_type:
                friendly_message = "현재 AI 비서의 대화량이 많아 잠시 쉬고 있어요. 1~2분만 기다렸다가 다시 말씀해 주시겠어요? 😊"
            elif "Safety" in error_type or "blocked" in str(e).lower():
                friendly_message = "죄송해요, 그 내용은 답변하기가 조금 조심스럽네요. 다른 주제로 이야기해 볼까요?"
            
            import traceback
            traceback.print_exc()
            return {
                "message": friendly_message,
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
        """
        emergency_keywords = [
            "도움", "응급", "병원", "119", "아파", "다쳤", "위험", "급해",
            "쓰러졌", "의식", "호흡", "심장", "출혈", "골절", "화상"
        ]

        text_lower = text.lower()
        keyword_count = sum(1 for keyword in emergency_keywords if keyword in text_lower)

        words = text.split()
        if not words:
            return False, 0.0

        ratio = keyword_count / len(words)
        is_emergency = ratio > 0.1 or keyword_count >= 3

        confidence = min(ratio * 10, 1.0)

        return is_emergency, confidence

    async def generate_proactive_message(self, context: Dict) -> Dict:
        """
        능동형 케어 메시지 생성
        현재 상황(시간, 일정, 약)을 기반으로 사용자에게 먼저 제안할 메시지를 생성합니다.
        """
        if not self.api_available:
            return {"message": "오늘도 건강하고 활기찬 하루 보내세요! 😊", "action": None}

        prompt = f"""당신은 노인을 위한 친절한 AI 케어비서입니다.
사용자에게 건넬 아주 짧고 다정한 '오늘의 한마디'를 생성하세요.

현재 상황:
- 시간: {context.get('current_time')}
- 일정: {json.dumps(context.get('tasks', []), ensure_ascii=False)[:200]}
- 약: {json.dumps(context.get('medicines', []), ensure_ascii=False)[:200]}

지침:
1. 1문장으로 아주 짧고 다정하게 작성하세요.
2. 약 시간이나 일정이 있다면 언급하세요.
3. 처리할 액션이 있다면 [ACTION]{{"type": "...", ...}}[/ACTION] 형식을 끝에 덧붙이세요.
"""

        try:
            response = await self.model.generate_content_async(prompt)
            full_text = response.text.strip()

            # 액션 파싱 (chat_response와 동일한 로직)
            action_data = None
            clean_message = full_text
            
            action_match = re.search(r'\[ACTION\](.*?)\[/ACTION\]', full_text, re.DOTALL)
            if action_match:
                try:
                    action_json = action_match.group(1).strip()
                    action_data = json.loads(action_json)
                    clean_message = full_text.replace(action_match.group(0), "").strip()
                except:
                    pass

            return {
                "message": clean_message,
                "action": action_data
            }
        except Exception as e:
            print(f"Proactive message generation error: {e}")
            return {"message": "오늘도 건강하고 활기찬 하루 보내세요! 😊", "action": None}
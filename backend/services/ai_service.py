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

    async def generate_task_guide(self, task_info: Dict, route_info: Dict) -> Dict:
        """
        일정 상세 가이드 생성 (이동 시간, 준비 사항 등)
        """
        if not self.api_available:
            return {"guide": "일정 정보를 바탕으로 준비해 주세요.", "departure_time": None}

        distance_km = route_info.get("distance", 0) / 1000
        duration_min = round(route_info.get("duration", 0) / 60)
        
        prompt = f"""
당신은 노인을 위한 AI 케어비서입니다. 사용자의 일정을 분석하여 'AI 맞춤 생활 가이드'를 작성해 주세요.

[일정 정보]
- 제목: {task_info.get('title')}
- 장소: {task_info.get('location')}
- 시간: {task_info.get('time', '시간 미지정')}

[이동 정보]
- 거리: {distance_km:.1f}km
- 예상 소요 시간: 약 {duration_min}분

[작성 지침]
1. 제목: 'AI 맞춤 생활 가이드'의 성격에 맞게, 단순히 길 안내뿐만 아니라 해당 일정을 잘 수행하기 위한 '생활 팁'을 포함하세요.
2. 말투: 매우 다정하고 공손하며, 친손주가 할아버지/할머니께 말씀드리듯 따뜻하게 작성하세요 (~해요, ~해드릴게요).
3. 내용 구성:
   - 이동 분석: 예상 소요 시간을 고려하여 몇 시에 출발하면 여유로울지 추천 (여유 시간 10분 포함).
   - 준비물 팁: 일정 제목(병원, 은행, 마켓 등)에 맞춰 잊지 말아야 할 물건 추천 (예: 병원이면 신분증/진료카드, 은행이면 도장/신분증).
   - 격려와 응원: 마지막에는 "오늘 하루도 건강히 잘 다녀오세요!" 같은 따뜻한 인사를 꼭 넣어주세요.
4. 응답 형식: 반드시 아래 JSON 형식을 지켜주세요.
   - 'guide': 위 내용들을 포함한 3~4문장의 친절한 조언 문구
   - 'departure_time': 계산된 추천 출발 시간 (HH:MM 형식)

응답 예시:
{{"guide": "할아버지, 오늘 병원 예약이 있으시네요! 차로 20분 정도 걸리니, 접수 시간을 고려해 14:30분에는 출발하시는 게 좋겠어요. 병원 가실 때 신분증 잊지 마시고 꼭 챙겨가세요. 조심히 잘 다녀오세요, 제가 여기서 응원하고 있을게요!", "departure_time": "14:30"}}
"""
        try:
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            return result
        except Exception as e:
            from utils.logger import log_error
            log_error(f"Task guide generation error: {e}")
            return {"guide": "일정 장소까지 가시는 길 안전하게 이동하세요!", "departure_time": None}

    @staticmethod
    def _parse_json_response(text: str) -> Dict:
        """AI 응답 텍스트에서 JSON 추출"""
        try:
            # ```json ... ``` 블록 제거
            clean_text = text.strip()
            if "```json" in clean_text:
                clean_text = clean_text.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_text:
                clean_text = clean_text.split("```")[1].split("```")[0].strip()
            
            # 특수 문자 처리 (불필요한 공백 등)
            import json
            return json.loads(clean_text)
        except:
            return {"guide": text, "departure_time": None}

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

    async def chat_response(self, message: str, conversation_type: str = "general", context: Dict = None, latitude: float = None, longitude: float = None) -> Dict:
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
        favorites = context.get('favorites', []) if context else []
        
        context_str = f"\n현재 모즈: {mode}"
        if managed_user_id:
            context_str += f"\n대상 사용자 ID (부모님): {managed_user_id}"
        
        if latitude and longitude:
            context_str += f"\n사용자 현재 위치 좌표: 위도 {latitude}, 경도 {longitude}"
        
        if favorites:
            context_str += f"\n사용자 자주 가는 장소(즐겨찾기): {json.dumps(favorites, ensure_ascii=False)}"

        prompt = f"""{system_prompt}{context_str}

오늘 날짜: {time.strftime('%Y년 %m월 %d일 %A')}

사용자: {message}

다음 지침을 철저히 따르세요:

1. [응답 필수 원칙]
   반드시 사용자의 말에 대답하는 친절한 한국어 문장을 먼저 작성하세요. [ACTION] 태그만 보내서는 절대 안 됩니다.

2. [일정 등록 시 위치 확인 필수 워크플로우]
   사용자가 일정 등록을 원하면(장소가 언급되거나 암시될 때):
   - 일차적으로 제목, 날짜, 시간을 추출하세요.
   - **중요**: 장소는 AI가 임의로 결정하지 말고, 반드시 사용자에게 **"어디인지 검색해서 선택해 드릴까요?"**라고 묻거나 **[ACTION] SEARCH_LOCATION**을 사용하여 장소 검색 팝업을 띄워야 합니다.
   - 사용자가 "강남병원 가야해"라고 하면: "네, 강남병원을 일정에 추가해 드릴게요. 정확한 위치를 목록에서 선택해 주시겠어요? [ACTION]{{"type": "SEARCH_LOCATION", "query": "강남병원", "task_preview": {{"title": "강남병원 방문", "date": "...", "time": "..."}}}}[/ACTION]" 와 같이 응답하세요.

3. [길안내 및 장소 검색]
   사용자가 단순히 "주변 약국 찾아줘"라고 하면:
   - [ACTION]{{"type": "SEARCH_STORE", "query": "약국"}}[/ACTION] 을 사용하세요.
   - 현재 위치(좌표)가 컨텍스트에 있다면, 그 주변을 위주로 검색된다는 점을 안내하세요.

4. [액션 형식]
   - 일정 등록을 위한 장소 검색 UI 요청: [ACTION]{{"type": "SEARCH_LOCATION", "query": "검색어", "task_preview": {{"title": "제목", "date": "YYYY-MM-DD", "time": "HH:MM"}}}}[/ACTION]
   - 단순 장소 검색: [ACTION]{{"type": "SEARCH", "query": "검색어"}}[/ACTION]
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
            error_str = str(e)
            
            # 상세한 에러 로깅
            print("\n" + "="*80)
            print(f"🚨 AI 서비스 에러 발생")
            print(f"에러 타입: {error_type}")
            print(f"에러 메시지: {error_str}")
            print(f"모델: {GEMINI_MODEL}")
            print(f"사용자 메시지: {message[:100]}..." if len(message) > 100 else f"사용자 메시지: {message}")
            
            # API 할당량 및 제한 확인
            if "quota" in error_str.lower() or "ResourceExhausted" in error_type:
                print("⚠️  API 할당량 초과 감지!")
                print("   - 일일 무료 할당량이 소진되었을 수 있습니다.")
                print("   - Google AI Studio에서 할당량을 확인하세요.")
            elif "rate" in error_str.lower() or "429" in error_str:
                print("⚠️  API 요청 속도 제한 감지!")
                print("   - 너무 많은 요청을 보냈습니다. 잠시 후 다시 시도하세요.")
            elif "404" in error_str or "not found" in error_str.lower():
                print("⚠️  모델을 찾을 수 없음!")
                print(f"   - 모델명 '{GEMINI_MODEL}'이 유효하지 않거나 지원되지 않습니다.")
                print("   - API 버전과 모델 호환성을 확인하세요.")
            elif "401" in error_str or "unauthorized" in error_str.lower():
                print("⚠️  API 키 인증 실패!")
                print("   - API 키가 유효하지 않거나 만료되었습니다.")
            elif "Safety" in error_type or "blocked" in error_str.lower():
                print("⚠️  안전 필터에 의해 차단됨")
                print("   - 콘텐츠가 안전 정책에 위배되었습니다.")
            
            print("="*80 + "\n")
            
            # 사용자에게 보여줄 메시지 정제
            friendly_message = "인공지능 비서와 연결이 잠시 지연되고 있습니다. 다시 한번만 말씀해 주시겠어요?"
            if "quota" in error_str.lower() or "ResourceExhausted" in error_type:
                # 할당량 초과 시 대기 시간 추출
                retry_seconds = 60  # 기본값
                if "retry in" in error_str.lower():
                    match = re.search(r'retry in ([0-9.]+)s', error_str)
                    if match:
                        retry_seconds = int(float(match.group(1)))
                
                retry_minutes = max(1, (retry_seconds + 30) // 60)  # 초를 분으로 변환 (올림)
                friendly_message = f"😊 죄송해요! AI 비서의 일일 무료 사용 횟수가 모두 소진되었어요. \n\n약 {retry_minutes}분 후에 다시 시도해 주시거나, Google AI Studio에서 API 키를 업그레이드하시면 계속 사용하실 수 있어요!"
            elif "404" in error_str or "not found" in error_str.lower():
                friendly_message = "AI 모델 연결에 문제가 있습니다. 관리자에게 문의해주세요."
            elif "Safety" in error_type or "blocked" in error_str.lower():
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
                "error": error_str,
                "error_type": error_type
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
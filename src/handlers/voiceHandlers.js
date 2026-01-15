import { t } from '../i18n';
import { setLanguage } from '../i18n';
import { VOICE_COMMAND_TYPES, getVoiceCommandHelp } from '../utils/voiceCommandProcessor';
import { isTaskCompleted } from '../utils/dateFormat';

/**
 * 음성 명령 실행 함수
 * @param {string} commandType - 명령 타입
 * @param {string} originalText - 원본 음성 인식 텍스트
 * @param {Object} dependencies - 필요한 상태와 setter 함수들
 * @returns {boolean} 명령이 실행되었는지 여부
 */
export const executeVoiceCommand = (
    commandType,
    originalText,
    {
        locationInfo,
        confirmedTasks,
        currentGPSLocation,
        language,
        setChatHistory,
        setRestMode,
        setLastActivityTime,
        setCurrentHospitalTask
    }
) => {
    console.log('🎤 음성 명령 실행:', commandType, originalText);

    switch (commandType) {
        case VOICE_COMMAND_TYPES.HOSPITAL: {
            // 병원 가기 로직
            const allHospitals = [
                ...(locationInfo.frequentPlaces?.hospital?.address ? [locationInfo.frequentPlaces.hospital] : []),
                ...(locationInfo.hospitals || [])
            ];

            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const hospitalTasks = confirmedTasks.filter(task =>
                task.title.includes('병원') &&
                task.date === todayStr &&
                !isTaskCompleted(task.date, task.time, task.completed)
            );

            if (hospitalTasks.length > 0) {
                const task = hospitalTasks[0];
                setChatHistory(prev => [...prev, {
                    role: 'user',
                    content: originalText || t('goHospital', language),
                    timestamp: Date.now()
                }, {
                    role: 'assistant',
                    type: 'hospitalTransport',
                    content: `${task.time}까지 ${task.location || '병원'}에 도착하시려면 이동 준비가 필요합니다.`,
                    task: task,
                    timestamp: Date.now()
                }]);
            } else if (allHospitals.length > 1) {
                setChatHistory(prev => [...prev, {
                    role: 'user',
                    content: originalText || t('goHospital', language),
                    timestamp: Date.now()
                }, {
                    role: 'assistant',
                    type: 'hospitalSelection',
                    content: '어느 병원으로 가시겠어요?',
                    hospitals: allHospitals,
                    timestamp: Date.now()
                }]);
            } else if (allHospitals.length === 1) {
                const hospital = allHospitals[0];
                setChatHistory(prev => [...prev, {
                    role: 'user',
                    content: originalText || t('goHospital', language),
                    timestamp: Date.now()
                }, {
                    role: 'assistant',
                    type: 'locationGuidance',
                    content: `${hospital.name || hospital.address || '병원'}으로 가는 길을 안내해드릴게요. ${currentGPSLocation ? '(현재 위치 기준)' : ''}`,
                    destination: hospital.address || hospital.name || '병원',
                    destinationType: 'hospital',
                    timestamp: Date.now()
                }]);
            } else {
                setChatHistory(prev => [...prev, {
                    role: 'user',
                    content: originalText || t('goHospital', language),
                    timestamp: Date.now()
                }, {
                    role: 'assistant',
                    content: '등록된 병원 정보가 없습니다. 위치정보 설정에서 병원을 먼저 등록해주세요.',
                    timestamp: Date.now()
                }]);
            }
            break;
        }

        case VOICE_COMMAND_TYPES.SHOPPING: {
            // 장보기 로직
            setChatHistory(prev => [...prev, {
                role: 'user',
                content: originalText || t('quickShopping', language),
                timestamp: Date.now()
            }, {
                role: 'assistant',
                type: 'shopping',
                content: t('shoppingRecommendation', language),
                timestamp: Date.now()
            }]);
            break;
        }

        case VOICE_COMMAND_TYPES.MOVEMENT: {
            // 이동 지원 로직
            setChatHistory(prev => [...prev, {
                role: 'user',
                content: originalText || t('quickNavigation', language),
                timestamp: Date.now()
            }, {
                role: 'assistant',
                type: 'destinationSelection',
                content: t('selectDestination', language),
                timestamp: Date.now()
            }]);
            break;
        }

        case VOICE_COMMAND_TYPES.REST_MODE: {
            // 휴식 모드 켜기
            setRestMode(true);
            setLastActivityTime(Date.now());
            setChatHistory(prev => [...prev, {
                role: 'user',
                content: originalText || t('quickRest', language),
                timestamp: Date.now()
            }, {
                role: 'assistant',
                content: '편안히 휴식하세요. 필요하시면 언제든 말씀해주세요.',
                type: 'restMode',
                restMode: true,
                timestamp: Date.now()
            }]);
            break;
        }

        case VOICE_COMMAND_TYPES.REST_MODE_OFF: {
            // 휴식 모드 끄기
            setRestMode(false);
            setChatHistory(prev => [...prev, {
                role: 'user',
                content: originalText,
                timestamp: Date.now()
            }, {
                role: 'assistant',
                content: '휴식 모드를 종료했습니다. 다른 도움이 필요하시면 말씀해주세요.',
                timestamp: Date.now()
            }]);
            break;
        }

        case VOICE_COMMAND_TYPES.SETTINGS: {
            // 설정 관련 안내
            setChatHistory(prev => [...prev, {
                role: 'user',
                content: originalText,
                timestamp: Date.now()
            }, {
                role: 'assistant',
                content: '설정은 우측 대시보드에서 확인하실 수 있습니다. 대시보드 아이콘을 클릭해주세요.',
                timestamp: Date.now()
            }]);
            break;
        }

        case VOICE_COMMAND_TYPES.HELP: {
            // 도움말 표시
            const helpText = getVoiceCommandHelp(language);
            setChatHistory(prev => [...prev, {
                role: 'user',
                content: originalText,
                timestamp: Date.now()
            }, {
                role: 'assistant',
                type: 'voiceCommandHelp',
                content: helpText,
                timestamp: Date.now()
            }]);
            break;
        }

        default:
            // 알 수 없는 명령은 기존처럼 처리
            return false;
    }

    return true; // 명령이 실행됨
};

/**
 * 언어 변경 핸들러
 * @param {string} lang - 변경할 언어
 * @param {Function} setLanguageState - 언어 상태 업데이트 함수
 * @param {Function} setShowLanguageMenu - 언어 메뉴 표시 상태 업데이트 함수
 * @param {Function} setChatHistory - 채팅 히스토리 업데이트 함수
 */
export const handleLanguageChange = (lang, setLanguageState, setShowLanguageMenu, setChatHistory) => {
    setLanguage(lang);
    setLanguageState(lang);
    setShowLanguageMenu(false);
    // 채팅 히스토리 초기화하여 새 언어로 시작
    setChatHistory([{
        role: 'assistant',
        content: t('greeting'),
        timestamp: Date.now()
    }]);
};

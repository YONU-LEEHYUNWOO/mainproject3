import { useEffect } from 'react';
import { formatDateForReport } from '../../../utils/formatUtils';

/**
 * 보호자 연락 인증 기반 상태(connected/waiting/locked)를 주기적으로 갱신한다.
 * - 기존 App.jsx의 useEffect 로직을 그대로 이동(동작/UI 변경 금지).
 */
export function useGuardianContactAuthCheck({ guardianContactAuth, setGuardianContactStatus }) {
    // 보호자 연락 인증 체크 (매일)
    useEffect(() => {
        const checkGuardianContactAuth = () => {
            const today = new Date();
            const todayStr = formatDateForReport(today);
            const lastContactDate = guardianContactAuth.lastContactDate;

            // 오늘 연락이 없으면
            if (lastContactDate !== todayStr) {
                // 3일 이상 연락이 없으면 'waiting', 7일 이상이면 'locked'
                if (lastContactDate) {
                    const daysSinceLastContact = Math.floor((today - new Date(lastContactDate + 'T00:00:00')) / (1000 * 60 * 60 * 24));

                    if (daysSinceLastContact >= 7) {
                        setGuardianContactStatus('locked');
                    } else if (daysSinceLastContact >= 3) {
                        setGuardianContactStatus('waiting');
                    }
                } else {
                    // 첫 사용 시 'connected' 유지
                    setGuardianContactStatus('connected');
                }
            } else {
                // 오늘 연락이 있으면 'connected'
                setGuardianContactStatus('connected');
            }
        };

        checkGuardianContactAuth();
        // 매일 자정에 체크
        const interval = setInterval(checkGuardianContactAuth, 24 * 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, [guardianContactAuth]);
}


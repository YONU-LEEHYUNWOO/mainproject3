import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { VoiceService } from '../services/voiceService';
import { AIService } from '../services/aiService';

const HomeScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [aiMessage, setAiMessage] = useState('안녕하세요! 오늘도 좋은 하루 되세요.');
  const [safetyStatus, setSafetyStatus] = useState('안전');

  useEffect(() => {
    initializeApp();
    loadTodaySchedules();

    // 1분마다 시간 업데이트
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const initializeApp = async () => {
    try {
      await VoiceService.initialize();
      await VoiceService.speak('AI 케어비서에 오신 것을 환영합니다.');
    } catch (error) {
      console.error('App initialization failed:', error);
    }
  };

  const loadTodaySchedules = async () => {
    try {
      // TODO: API 연동
      const schedules = [
        { id: 1, title: '병원 방문', time: '10:00', location: '서울병원' },
        { id: 2, title: '약 복용', time: '점심 후', location: '집' },
      ];
      setTodaySchedules(schedules);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  };

  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'schedule':
          await VoiceService.speak('일정 확인 화면으로 이동합니다.');
          // navigation.navigate('Schedule');
          break;
        case 'transport':
          await VoiceService.speak('교통 지원을 시작합니다.');
          // navigation.navigate('Transport');
          break;
        case 'safety':
          await VoiceService.speak('안전 모드를 시작합니다.');
          // navigation.navigate('Safety');
          break;
        case 'rest':
          await VoiceService.speak('휴식 모드를 시작합니다.');
          setSafetyStatus('휴식 중');
          break;
      }
    } catch (error) {
      console.error('Quick action failed:', error);
    }
  };

  const BigButton = ({ title, onPress, color = '#2196F3' }: { title: string; onPress: () => void; color?: string }) => (
    <TouchableOpacity
      style={[styles.bigButton, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.bigButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>AI 케어비서</Text>
        <Text style={styles.subtitle}>
          {currentTime.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </Text>
      </View>

      {/* 오늘 일정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>오늘 일정</Text>
        {todaySchedules.map((schedule: any) => (
          <View key={schedule.id} style={styles.scheduleCard}>
            <Text style={styles.scheduleTitle}>{schedule.title}</Text>
            <Text style={styles.scheduleTime}>{schedule.time}</Text>
            <Text style={styles.scheduleLocation}>{schedule.location}</Text>
          </View>
        ))}
      </View>

      {/* 빠른 액션 버튼들 */}
      <View style={styles.quickActions}>
        <BigButton
          title="일정 확인"
          onPress={() => handleQuickAction('schedule')}
        />
        <BigButton
          title="이동 지원"
          onPress={() => handleQuickAction('transport')}
          color="#4CAF50"
        />
        <BigButton
          title="휴식 모드"
          onPress={() => handleQuickAction('rest')}
          color="#FF9800"
        />
        <BigButton
          title="안전 확인"
          onPress={() => handleQuickAction('safety')}
          color="#F44336"
        />
      </View>

      {/* AI 메시지 */}
      <View style={styles.aiSection}>
        <Text style={styles.aiTitle}>🤖 AI 추천</Text>
        <Text style={styles.aiMessage}>{aiMessage}</Text>
      </View>

      {/* 안전 상태 */}
      <View style={styles.safetySection}>
        <Text style={styles.safetyTitle}>🛡️ 안전 상태</Text>
        <Text style={[
          styles.safetyStatus,
          safetyStatus === '안전' ? styles.safeStatus :
          safetyStatus === '휴식 중' ? styles.restStatus : styles.warningStatus
        ]}>
          {safetyStatus}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#757575',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 15,
  },
  scheduleCard: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 5,
  },
  scheduleTime: {
    fontSize: 18,
    color: '#1976D2',
    marginBottom: 5,
  },
  scheduleLocation: {
    fontSize: 16,
    color: '#757575',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  bigButton: {
    width: '48%',
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bigButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  aiSection: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  aiTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 10,
  },
  aiMessage: {
    fontSize: 18,
    color: '#424242',
    lineHeight: 24,
  },
  safetySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 12,
  },
  safetyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  safetyStatus: {
    fontSize: 18,
    fontWeight: '600',
  },
  safeStatus: {
    color: '#4CAF50',
  },
  restStatus: {
    color: '#FF9800',
  },
  warningStatus: {
    color: '#F44336',
  },
});

export default HomeScreen;
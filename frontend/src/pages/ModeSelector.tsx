import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Typography, Button, Box, Container } from '@mui/material';
import { Person as ParentIcon, FamilyRestroom as ChildIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ModeSelector = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'parent' | 'child' | null>(null);

  // 기존 선택 모드 확인 (localStorage에서)
  useEffect(() => {
    const savedMode = localStorage.getItem('userMode');
    if (savedMode && (savedMode === 'parent' || savedMode === 'child')) {
      setSelectedMode(savedMode);
    }
  }, []);

  const handleModeSelect = (mode: 'parent' | 'child') => {
    localStorage.setItem('userMode', mode);
    setSelectedMode(mode);

    // 모드에 따라 다른 페이지로 이동
    if (mode === 'parent') {
      navigate('/parent/dashboard');
    } else {
      navigate('/child/dashboard');
    }
  };

  const handleConfirmMode = () => {
    if (selectedMode) {
      handleModeSelect(selectedMode);
    }
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center', width: '100%' }}>
        {/* 헤더 */}
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
          🤝 함께잇다
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
          부모님과 자녀가 함께 이어지는 든든한 연결고리
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          어떤 모드로 시작하시겠어요?
        </Typography>

        {/* 모드 선택 카드들 */}
        <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mb: 4, flexWrap: 'wrap' }}>
          {/* 부모 모드 카드 */}
          <Card
            sx={{
              minWidth: 300,
              cursor: 'pointer',
              border: selectedMode === 'parent' ? '3px solid #1976d2' : '1px solid #e0e0e0',
              backgroundColor: selectedMode === 'parent' ? '#f3f9ff' : 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
              }
            }}
            onClick={() => setSelectedMode('parent')}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <ParentIcon sx={{ fontSize: 70, color: '#1976d2', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                👴 시니어 모드
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                편안하고 쉬운 일상 도우미
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                • 📅 일정과 약 복용 알림<br/>
                • 🗺️ 길찾기와 위치 공유<br/>
                • ❤️ 건강 기록과 관리<br/>
                • 🛒 필요한 것 요청하기
              </Typography>
            </CardContent>
          </Card>

          {/* 보호 모드 카드 */}
          <Card
            sx={{
              minWidth: 300,
              cursor: 'pointer',
              border: selectedMode === 'child' ? '3px solid #2e7d32' : '1px solid #e0e0e0',
              backgroundColor: selectedMode === 'child' ? '#f1f8e9' : 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
              }
            }}
            onClick={() => setSelectedMode('child')}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <ChildIcon sx={{ fontSize: 70, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                👨 보호 모드
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                부모님을 든든하게 챙기는 연결
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                • 📊 부모님 일정 등록/관리<br/>
                • 📍 실시간 위치 확인<br/>
                • 💊 약 복용 모니터링<br/>
                • 🔔 활동 알림과 리포트
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* 선택 확인 버튼 */}
        {selectedMode && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
              선택하신 모드: <strong>{selectedMode === 'parent' ? '👴 시니어 모드' : '👨 보호 모드'}</strong>
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleConfirmMode}
              sx={{
                px: 8,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                borderRadius: 3,
                backgroundColor: selectedMode === 'parent' ? '#1976d2' : '#2e7d32',
                '&:hover': {
                  backgroundColor: selectedMode === 'parent' ? '#1565c0' : '#1b5e20',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              🚀 함께 시작하기
            </Button>
          </Box>
        )}

        {/* 안내 문구 */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.8 }}>
          💡 모드는 언제든지 변경할 수 있어요. 부모님과 자녀 모두 편하게 사용해보세요!
          {user && (
            <span style={{ display: 'block', marginTop: 12, fontSize: '1rem', color: '#1976d2' }}>
              🎉 <strong>{user.full_name || user.username}</strong>님, 환영합니다!
            </span>
          )}
        </Typography>
      </Box>
    </Container>
  );
};

export default ModeSelector;
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
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
          🤖 AI 케어비서
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          사용자 유형을 선택해주세요
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
                boxShadow: 3,
              }
            }}
            onClick={() => setSelectedMode('parent')}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <ParentIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                👴 부모 모드
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                AI가 도와주는 일상 케어 서비스
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 일정 확인 및 이동 지원<br/>
                • 약 복용 알림<br/>
                • AI 추천 및 안전 관리
              </Typography>
            </CardContent>
          </Card>

          {/* 자식 모드 카드 */}
          <Card
            sx={{
              minWidth: 300,
              cursor: 'pointer',
              border: selectedMode === 'child' ? '3px solid #2e7d32' : '1px solid #e0e0e0',
              backgroundColor: selectedMode === 'child' ? '#f1f8e9' : 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 3,
              }
            }}
            onClick={() => setSelectedMode('child')}
          >
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <ChildIcon sx={{ fontSize: 60, color: '#2e7d32', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                👨 자식 모드
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                부모님을 관리하는 서비스
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • 부모님 일정 등록<br/>
                • 실시간 위치 모니터링<br/>
                • 활동 리포트 및 알림
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* 선택 확인 버튼 */}
        {selectedMode && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
              선택하신 모드: <strong>{selectedMode === 'parent' ? '부모 모드' : '자식 모드'}</strong>
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleConfirmMode}
              sx={{
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                backgroundColor: selectedMode === 'parent' ? '#1976d2' : '#2e7d32',
                '&:hover': {
                  backgroundColor: selectedMode === 'parent' ? '#1565c0' : '#1b5e20',
                }
              }}
            >
              시작하기
            </Button>
          </Box>
        )}

        {/* 안내 문구 */}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 4, maxWidth: 600, mx: 'auto' }}>
          💡 모드는 언제든지 설정에서 변경할 수 있습니다.
          {user && (
            <span style={{ display: 'block', marginTop: 8 }}>
              환영합니다, <strong>{user.username}</strong>님!
            </span>
          )}
        </Typography>
      </Box>
    </Container>
  );
};

export default ModeSelector;
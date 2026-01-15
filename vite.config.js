import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 한국 공공데이터 포털 기상청 API 프록시 (CORS 문제 해결)
      '/api/weather': {
        target: 'http://apis.data.go.kr',
        changeOrigin: true,
        rewrite: (path) => {
          // 쿼리 파라미터를 포함하여 경로 재작성
          const queryString = path.includes('?') ? path.substring(path.indexOf('?')) : '';
          return '/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst' + queryString;
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.error('❌ 프록시 오류:', err.message);
            console.error('요청 URL:', req.url);
            // 에러 응답 전송
            if (res && !res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
              });
              res.end(JSON.stringify({ 
                error: '프록시 서버 오류',
                message: err.message 
              }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🌐 프록시 요청:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 프록시 응답:', proxyRes.statusCode, req.url);
            // 500 에러인 경우 로깅
            if (proxyRes.statusCode === 500) {
              console.error('⚠️ 원격 서버에서 500 에러 발생:', req.url);
            }
          });
        },
      },
    },
  },
})




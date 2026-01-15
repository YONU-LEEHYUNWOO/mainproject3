/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                pastel: {
                    pink: '#FFD6E8',
                    purple: '#E8D5FF',
                    blue: '#D5E8FF',
                    green: '#D5FFE8',
                    yellow: '#FFF4D5',
                    orange: '#FFE8D5',
                },
                // 디자인 가이드 색상
                trustBlue: '#2563EB',
                warmOrange: '#F59E0B',
                emergencyRed: '#DC2626',
                lightBg: '#F0F4F8',
            },
            fontFamily: {
                pretendard: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
            },
            animation: {
                'bounce-slow': 'bounce 2s infinite',
                'pulse-slow': 'pulse 3s infinite',
                'fade-in': 'fadeIn 0.3s ease-in',
                'slide-up': 'slideUp 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'blink': 'blink 1.5s ease-in-out infinite',
                'pulse-red': 'pulseRed 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                blink: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
                pulseRed: {
                    '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.7)' },
                    '50%': { transform: 'scale(1.05)', boxShadow: '0 0 0 10px rgba(220, 38, 38, 0)' },
                },
            },
        },
    },
    plugins: [],
}


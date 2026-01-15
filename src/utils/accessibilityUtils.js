/**
 * 접근성 설정을 CSS 변수로 적용
 * @param {Object} settings - 접근성 설정 객체
 * @param {string} settings.fontSize - 폰트 크기 ('normal', 'large', 'xlarge')
 * @param {string} settings.buttonSize - 버튼 크기 ('normal', 'large', 'xlarge')
 * @param {boolean} settings.highContrast - 고대비 모드 여부
 */
export const applyAccessibilitySettings = (settings) => {
    const root = document.documentElement;

    // 폰트 크기 설정
    const fontSizeMap = {
        normal: { base: '18px', lg: '20px', xl: '24px', '2xl': '28px', '3xl': '32px' },
        large: { base: '22px', lg: '24px', xl: '28px', '2xl': '32px', '3xl': '36px' },
        xlarge: { base: '26px', lg: '28px', xl: '32px', '2xl': '36px', '3xl': '40px' }
    };

    const fontSizes = fontSizeMap[settings.fontSize] || fontSizeMap.normal;
    root.style.setProperty('--font-size-base', fontSizes.base);
    root.style.setProperty('--font-size-lg', fontSizes.lg);
    root.style.setProperty('--font-size-xl', fontSizes.xl);
    root.style.setProperty('--font-size-2xl', fontSizes['2xl']);
    root.style.setProperty('--font-size-3xl', fontSizes['3xl']);

    // 버튼 크기 설정
    const buttonSizeMap = {
        normal: { min: '44px', small: '50px', medium: '60px', large: '80px', xlarge: '100px' },
        large: { min: '56px', small: '64px', medium: '72px', large: '96px', xlarge: '120px' },
        xlarge: { min: '68px', small: '78px', medium: '88px', large: '112px', xlarge: '140px' }
    };

    const buttonSizes = buttonSizeMap[settings.buttonSize] || buttonSizeMap.normal;
    root.style.setProperty('--button-size-min', buttonSizes.min);
    root.style.setProperty('--button-size-small', buttonSizes.small);
    root.style.setProperty('--button-size-medium', buttonSizes.medium);
    root.style.setProperty('--button-size-large', buttonSizes.large);
    root.style.setProperty('--button-size-xlarge', buttonSizes.xlarge);

    // 색상 대비 설정
    if (settings.highContrast) {
        root.style.setProperty('--contrast-multiplier', '1.2');
        root.style.setProperty('--text-contrast', '#000000');
        root.style.setProperty('--bg-contrast', '#FFFFFF');
    } else {
        root.style.setProperty('--contrast-multiplier', '1');
        root.style.removeProperty('--text-contrast');
        root.style.removeProperty('--bg-contrast');
    }
};

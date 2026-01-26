import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type FontSize = 'normal' | 'large' | 'xlarge'
type ButtonSize = 'normal' | 'large'

interface AccessibilitySettings {
    fontSize: FontSize
    buttonSize: ButtonSize
    highContrast: boolean
}

interface AccessibilityContextType extends AccessibilitySettings {
    setFontSize: (size: FontSize) => void
    setButtonSize: (size: ButtonSize) => void
    setHighContrast: (enabled: boolean) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [fontSize, setFontSizeState] = useState<FontSize>('normal')
    const [buttonSize, setButtonSizeState] = useState<ButtonSize>('normal')
    const [highContrast, setHighContrastState] = useState<boolean>(false)

    // 초기 로드
    useEffect(() => {
        const saved = localStorage.getItem('accessibility_settings')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setFontSizeState(parsed.fontSize || 'normal')
                setButtonSizeState(parsed.buttonSize || 'normal')
                setHighContrastState(parsed.highContrast || false)
            } catch (e) {
                console.error('Failed to load accessibility settings', e)
            }
        }
    }, [])

    // 설정 저장 및 적용
    useEffect(() => {
        localStorage.setItem('accessibility_settings', JSON.stringify({ fontSize, buttonSize, highContrast }))

        // HTML 태그에 클래스 적용 (Tailwind 또는 CSS 변수 활용용)
        const root = document.documentElement

        // 기존 클래스 제거
        root.classList.remove('text-normal', 'text-large', 'text-xlarge')
        root.classList.remove('btn-normal', 'btn-large')
        root.classList.remove('high-contrast')

        // 새 클래스 추가
        root.classList.add(`text-${fontSize}`)
        root.classList.add(`btn-${buttonSize}`)
        if (highContrast) root.classList.add('high-contrast')

        // CSS 변수 업데이트 (직접 제어용)
        const sizeMap = {
            normal: '16px',
            large: '20px',
            xlarge: '24px'
        }
        root.style.setProperty('--base-font-size', sizeMap[fontSize])

    }, [fontSize, buttonSize, highContrast])

    const setFontSize = (size: FontSize) => setFontSizeState(size)
    const setButtonSize = (size: ButtonSize) => setButtonSizeState(size)
    const setHighContrast = (enabled: boolean) => setHighContrastState(enabled)

    return (
        <AccessibilityContext.Provider value={{
            fontSize, buttonSize, highContrast,
            setFontSize, setButtonSize, setHighContrast
        }}>
            {children}
        </AccessibilityContext.Provider>
    )
}

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext)
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider')
    }
    return context
}

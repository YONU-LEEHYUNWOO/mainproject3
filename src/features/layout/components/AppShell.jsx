import React from 'react';

// 앱 최상위 레이아웃 래퍼
const AppShell = ({ children }) => {
    return (
        <div className="flex h-screen bg-gradient-to-br from-pastel-pink/10 via-pastel-blue/10 to-pastel-purple/10 text-slate-900 overflow-hidden font-sans">
            {children}
        </div>
    );
};

export default AppShell;

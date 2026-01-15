import React from 'react';
import AppLayout from './AppLayout';
import AppModals from './AppModals';
import AppShell from './AppShell';

// AppShell + Modals + Layout 묶음
const AppRoot = ({ modalsProps, layoutProps }) => {
    return (
        <AppShell>
            <AppModals {...modalsProps} />
            <AppLayout {...layoutProps} />
        </AppShell>
    );
};

export default AppRoot;

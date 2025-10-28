'use client'
import React from 'react'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import useDarkMode from '@hooks/useDarkMode';
import { Icon } from '@iconify/react';

const CustomCloseButton = ({ closeToast }: { closeToast?: () => void }) => (
    <span
        style={{
            position: 'absolute',
            top: 8,
            right: 10,
            fontWeight: 700,
            fontSize: 18,
            cursor: 'pointer',
            zIndex: 2,
            lineHeight: 1,
        }}
        onClick={closeToast}
        aria-label="close"
    >
        ×
    </span>
);

// Custom icon for toast types
const CustomIcon = ({ type }: { type?: string }) => {
    switch (type) {
        case 'success':
            return <Icon icon="mdi:check-circle" width={28} height={28} className='text-green-500' />;
        case 'error':
            return <Icon icon="mdi:alert-circle" width={28} height={28} className='text-red-500' />;
        case 'warning':
            return <Icon icon="mdi:alert" width={28} height={28} className='text-yellow-500' />;
        case 'info':
            return <Icon icon="mdi:information" width={28} height={28} className='text-blue-500' />;
        default:
            return <Icon icon="mdi:information" width={28} height={28} className='text-gray-500' />;
    }
};

function ToastContainerEnhance() {
    const [isEnabled] = useDarkMode();
    const isDark = isEnabled ? true : (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
        || (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
    return (
        <ToastContainer
            position="top-center"
            autoClose={3000}
            theme={isDark ? 'dark' : 'light'}
            toastClassName={() =>
                `custom-toast ${isDark ? 'custom-toast-dark' : 'custom-toast-light'}`
            }
            closeButton={CustomCloseButton}
            icon={CustomIcon}
        />
    );
}

export default ToastContainerEnhance
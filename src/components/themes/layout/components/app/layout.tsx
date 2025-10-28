'use client'
import dynamic from 'next/dynamic';
import {
    LAYOUT_DEFAULT,
    LAYOUT_PRO
} from '@src/constants/theme.constant';
import type { CommonProps } from '@src/@types/common';
import type { LayoutType } from '@src/@types/theme';
import { useAppSelector } from '@redux/store';
import { layoutType } from '@lib/redux/base';
import Spinner from '@components/core/Spinner';
// =====> this will define which theme will be renderd default , if you have more themes you can add them here and import them here as well
const layouts: Record<string, any> = {
    [LAYOUT_DEFAULT]: dynamic(() => import('../../../default/default'), {
        loading: () => <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950"><Spinner className="w-8 h-8 text-blue-900" /></div>,
        ssr: false
    }),
    [LAYOUT_PRO]: dynamic(() => import('../../../pro/pro'), {
        loading: () => <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-950"><Spinner className="w-10 h-10 text-primary" /></div>,
        ssr: false
    }),
};

const Layout = ({ children }: CommonProps) => {
    // =====> get theme name like defualt or pro
    const layout: LayoutType = useAppSelector(layoutType);
    // ======>  now select theme layout dynamicaly based on theme name
    const AppLayout = layouts[layout] ?? layouts[Object.keys(layouts)[0]];
    return <AppLayout>{children}</AppLayout>;
};

export default Layout;

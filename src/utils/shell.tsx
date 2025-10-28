'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

export default function Shell({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait" initial={false}>
            {/*
        We pass the pathname as key so AnimatePresence knows when to animate exit/enter
      */}
            <div key={pathname} className='min-h-screen w-full'>
                {children}
            </div>
        </AnimatePresence>
    );
}

'use client';
import { motion,AnimatePresence } from 'framer-motion';
import {  usePathname} from 'next/navigation';
import { ReactNode } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
const pathName = usePathname();
    return (
<AnimatePresence mode="wait">
  <motion.div
    key={pathName}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeIn' } }}
    transition={{ duration: 0.8, ease: 'easeInOut' }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
</AnimatePresence>
    );
}

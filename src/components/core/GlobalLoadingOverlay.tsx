'use client';
import { useLoading } from '@src/context/LoadingContext';
// import { motion } from 'framer-motion';
// import Image from 'next/image';

export default function GlobalLoadingOverlay({ ...props }) {
    const { isLoading } = props
    const { loading } = useLoading();
    if (!loading || !isLoading) return null;
    return (
        // <div className="fixed inset-0 flex flex-col items-center justify-center w-full h-screen bg-white dark:bg-gray-800 z-[99999999999]">
        //     <motion.div
        //         initial={{ rotateY: 0 }}
        //         animate={{ rotateY: 360 }}
        //         transition={{
        //             duration: 2,
        //             ease: 'easeInOut',
        //             repeatDelay: 1,
        //             repeat: Infinity
        //         }}
        //     >
        //         {/* <Image
        //             height={50}
        //             width={100}
        //             alt="company logo"
        //             src={'/images/logo.png'}
        //             priority
        //         /> */}
        //     </motion.div>

        //     <motion.div
        //         animate={{
        //             scale: [1.2, 1, 1, 1.2, 1.2],
        //             rotate: [270, 0, 0, 270, 270],
        //             opacity: [0.25, 1, 1, 1, 0.25],
        //             borderRadius: ['25%', '25%', '50%', '50%', '25%']
        //         }}
        //         transition={{ ease: 'linear', duration: 3.2, repeat: Infinity }}
        //         className="absolute w-[100px] h-[100px] border-2 border-blue-500/25 rounded-[25%]"
        //     />

        //     <motion.div
        //         animate={{
        //             scale: [1, 1.2, 1.2, 1, 1],
        //             rotate: [0, 270, 270, 0, 0],
        //             opacity: [1, 0.25, 0.25, 0.25, 1],
        //             borderRadius: ['25%', '25%', '50%', '50%', '25%']
        //         }}
        //         transition={{ ease: 'linear', duration: 3.2, repeat: Infinity }}
        //         className="absolute w-[120px] h-[120px] border-4 border-blue-500/25 rounded-[25%]"
        //     />
        // </div>
        <div>searching</div>
    );
}

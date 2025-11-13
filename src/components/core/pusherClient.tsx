'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

/**
 * This component listens for real-time Pusher events
 * and shows toast notifications when an event is received.
 */
export default function PusherClient() {
      const [notification, setNotification] = useState<any | null>(null);
  useEffect(() => {
    // Pusher.logToConsole = process.env.NODE_ENV !== 'production';
    const pusher = new Pusher('de441f2de3ea4cc57f04', {
      cluster: 'ap2',
    });

    const channel = pusher.subscribe('toptiertravel_vip');
    // Bind to event (you can use "my-event" or your custom one)
    channel.bind('event', (data: any) => {

  if (data?.message1 === 'Hotel_hotel_booking') {
        setNotification({
          name: data?.message3 || 'Someone',
          hotel: data?.message4 || 'A hotel',
          time: 'just now',
          image:
            '', // Placeholder profile photo
        });

        // Auto-hide after 5 seconds
        setTimeout(() => setNotification(null), 1500);
      }
    });
    // Cleanup on unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  return (
<div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 bg-white shadow-lg rounded-xl px-4 py-3 border border-gray-100 min-w-[300px]"
          >
            <div className="relative">

              <Icon icon="mdi:person-circle-outline" className="w-10 h-10 text-gray-600" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>

            <div>
              <p className="text-gray-900 font-semibold text-sm">
                {notification.name}
              </p>
              <p className="text-gray-500 text-sm">
                {notification.hotel} • {notification.time}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  ); // No UI, background listener only
}
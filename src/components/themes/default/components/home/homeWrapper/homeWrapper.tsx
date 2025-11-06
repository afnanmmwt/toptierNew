// app/page.tsx or wherever HomeWrapper is used as the homepage component
'use client';
import {
  HeroSection,
  FeaturedDestinations,
  OfferSection,
  TestimonialSection,
  FeaturedHotels,
  NewsLatter,
} from "@components/themes/default";
import useDirection from "@hooks/useDirection";
import { useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@src/hooks/use-user';

export default function HomeWrapper({ dict }: { dict: any }) {
  const [direction] = useDirection();
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams(); // ✅ Get URL query params

  const lastRoute = sessionStorage.getItem('lastRoute') || '';
// Capture & store referral code
useEffect(() => {
  const ref = searchParams.get('ref');
  if (ref) {
    document.cookie = `agent_ref=${ref}; path=/; max-age=2592000`; // expires in 30 days
  }
}, [searchParams]);

  // Redirect after login
  useEffect(() => {
    if (lastRoute === "/bookings" && user) {
      router.replace('/bookings');
    }
  }, [user, router, lastRoute]);

  return (
    <div className="bg-white dark:bg-gray-800 min-h-full" dir={direction}>
      <div><HeroSection /></div>
      <div><FeaturedDestinations /></div>
      <div><FeaturedHotels /></div>
      <div><OfferSection /></div>
      <div><TestimonialSection /></div>
      <div><NewsLatter /></div>
    </div>
  );
}
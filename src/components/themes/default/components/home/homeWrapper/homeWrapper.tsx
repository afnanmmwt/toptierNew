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

export default function HomeWrapper() {
  const [direction] = useDirection();
  const router = useRouter();
  const { user } = useUser();
  const searchParams = useSearchParams(); //  Get URL query params

  const lastRoute = sessionStorage.getItem('lastRoute') || '';

useEffect(() => {
  const refParam = searchParams.get('ref');

  if (refParam) {
    try {
      // Step 1: URL-decode (in case it was encoded)
      const urlDecoded = decodeURIComponent(refParam);

      // Step 2: Base64 decode to get the actual agent user_id
      const agentUserId = atob(urlDecoded); // Base64 decode

      // Step 3: Validate it's a reasonable string (optional but safe)
      if (agentUserId && /^[a-zA-Z0-9]+$/.test(agentUserId)) {
        // Store the REAL agent user_id (not the encoded one)
        document.cookie = `agent_ref=${agentUserId}; path=/; max-age=2592000`; // 30 days
      } else {
        console.warn('Invalid decoded agent_ref:', agentUserId);
      }
    } catch (error) {
      console.error('Failed to decode referral code:', refParam, error);
      // Optionally: don't store if decode fails
    }
  } else {
    // 🚨 No ref parameter in URL — remove existing agent_ref cookie
    document.cookie = 'agent_ref=; path=/; max-age=0';
  }
}, [searchParams]);

  // Redirect after login
  useEffect(() => {
    if (lastRoute === "/bookings" && user) {
      router.replace('/bookings');
    }else{
              sessionStorage.removeItem('lastRoute');

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
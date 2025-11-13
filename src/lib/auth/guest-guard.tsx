'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Alert from '@src/components/core/alert';
import { useUser } from '@src/hooks/use-user';
import GlobalLoadingOverlay from '@components/core/GlobalLoadingOverlay';

export interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const { user, error, isLoading , checkSession} = useUser();
  const [isChecking, setIsChecking] = React.useState(true);
   const lastRoute=sessionStorage.getItem('lastRoute')
   const amdminRef=localStorage.getItem('adminRef')
  React.useEffect(() => {
checkSession?.();
    const verifyGuestAccess = async () => {
      if (isLoading) return;

      if (error) {
        setIsChecking(false);
        return;
      }
      if (user && lastRoute==="/bookings" ) {
        router.push('/bookings')
        sessionStorage.removeItem('lastRoute')
      }
      else if(user && !lastRoute && amdminRef ){
        router.push(amdminRef)
        localStorage.removeItem('adminRef')
      }
      else if(user){
        router.push('/')
      }
      setIsChecking(false);
    };
    verifyGuestAccess().catch(console.error);
  }, [user, error, isLoading, router]);
  if (isLoading || isChecking) {
    return <GlobalLoadingOverlay />;
  }
  if (error) {
    return (
      <Alert type="danger">
        {typeof error === 'string' ? error : 'Something went wrong. Please try again.'}
      </Alert>
    );
  }


  return <React.Fragment>{children}</React.Fragment>;
}
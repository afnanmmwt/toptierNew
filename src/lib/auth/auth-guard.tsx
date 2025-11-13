'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useUser } from '@src/hooks/use-user';
import Alert from '@components/core/alert';
import GlobalLoadingOverlay from '@components/core/GlobalLoadingOverlay';
import { es } from 'date-fns/locale';

export interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const { user, error, isLoading } = useUser();
  const [isChecking, setIsChecking] = React.useState(true);


  React.useEffect(() => {
    if (!isLoading) {
      if (error) {
        setIsChecking(false);
        return;
      }

      if (!user) {
        //  Store the current route before redirecting to login
        // sessionStorage.setItem('lastRoute', pathname);
        router.replace('/auth/login');

      }
      // else {
      //   sessionStorage.removeItem('lastRoute');
      // }
      setIsChecking(false);
    }
  }, [user, error, isLoading, router, pathname]);

  const isReady = !isLoading && !isChecking;

  if (!isReady) {
    return <GlobalLoadingOverlay />;
  }

  if (error) {
    return <Alert type="danger">{error}</Alert>;
  }

  return <>{children}</>;
}
'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';

import { useUser } from '@src/hooks/use-user';
import Alert from '@components/core/alert';
import GlobalLoadingOverlay from '@components/core/GlobalLoadingOverlay';

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
        router.replace('/auth/login');

      }
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
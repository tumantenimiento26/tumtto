'use client';

import { usePathname } from 'next/navigation';

import { ErrorPage } from '@/components/ds';
import { useAuth } from '@/lib/auth';
import { canAccessPath } from '@/lib/staffRoles';

/** Páginas que el rol no puede ver (matriz de permisos) muestran 403, no datos. */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { permissions } = useAuth();
  if (!canAccessPath(permissions, pathname))
    return (
      <ErrorPage
        kind="403"
        primary={{ label: 'Ir al panel', href: '/dashboard' }}
      />
    );
  return <>{children}</>;
}

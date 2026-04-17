'use client';

import { PassengerShell } from '@/features/passenger/components/passenger-shell';
import { RouteGuard } from '@/shared/auth/route-guard';

export default function PassengerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowRole='PASSENGER'>
      <PassengerShell>{children}</PassengerShell>
    </RouteGuard>
  );
}

'use client';

import { AdminShell } from '@/features/admin/components/admin-shell';
import { RouteGuard } from '@/shared/auth/route-guard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard allowRole='ADMIN'>
      <AdminShell>{children}</AdminShell>
    </RouteGuard>
  );
}

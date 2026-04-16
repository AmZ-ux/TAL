'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, Wallet, FileCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import { cn } from '@/lib/utils';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/passengers', label: 'Passengers', icon: Users },
  { href: '/admin/institutions', label: 'Institutions', icon: Building2 },
  { href: '/admin/monthly-fees', label: 'Monthly Fees', icon: Wallet },
  { href: '/admin/receipts', label: 'Receipts', icon: FileCheck },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className='mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:py-8'>
      <header className='rounded-xl border bg-card p-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='space-y-1'>
            <Badge className='w-fit'>ADMIN</Badge>
            <p className='text-base font-semibold'>Administrative Core</p>
            <p className='text-xs text-muted-foreground'>Signed in as {user?.email}</p>
          </div>
          <Button variant='destructive' onClick={logout}>
            Sign out
          </Button>
        </div>
        <nav className='mt-4 flex flex-wrap gap-2'>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: isActive ? 'default' : 'outline', size: 'sm' }),
                  'gap-2',
                )}
              >
                <Icon className='h-4 w-4' />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className='flex-1'>{children}</main>
    </div>
  );
}

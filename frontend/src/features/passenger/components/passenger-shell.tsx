'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleHelp, House, History, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';

const passengerNavItems = [
  { href: '/passenger', label: 'Home', icon: House },
  { href: '/passenger/monthly-fees', label: 'Monthly fees', icon: Wallet },
  { href: '/passenger/history', label: 'History', icon: History },
  { href: '/passenger/support', label: 'Support', icon: CircleHelp },
];

export function PassengerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className='mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 py-6 sm:py-8'>
      <header className='rounded-xl border bg-card p-4'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='space-y-1'>
            <Badge className='w-fit'>PASSENGER</Badge>
            <p className='text-base font-semibold'>Payment Area</p>
            <p className='text-xs text-muted-foreground'>Signed in as {user?.email}</p>
          </div>
          <Button variant='destructive' onClick={logout}>
            Sign out
          </Button>
        </div>

        <nav className='mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap'>
          {passengerNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: isActive ? 'default' : 'outline', size: 'sm' }),
                  'w-full gap-2 sm:w-auto',
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

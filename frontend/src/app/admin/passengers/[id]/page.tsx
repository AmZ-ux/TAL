'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPassengerById } from '@/features/passengers/api/passengers';
import { PassengerStatusBadge } from '@/features/passengers/components/passenger-status-badge';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/shared/ui/states/empty-state';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';

export default function PassengerDetailsPage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['passenger', params.id],
    queryFn: () => fetchPassengerById(params.id),
    enabled: !!params.id,
  });

  if (isLoading) {
    return <LoadingState label='Loading passenger details...' />;
  }

  if (isError) {
    return <ErrorState message='Unable to load passenger details.' />;
  }

  if (!data) {
    return <EmptyState title='Passenger not found' description='This passenger may have been removed.' />;
  }

  return (
    <section className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>{data.fullName}</h1>
          <p className='text-sm text-muted-foreground'>Passenger details</p>
        </div>
        <Link href={`/admin/passengers/${data.id}/edit`} className={cn(buttonVariants({ variant: 'outline' }))}>
          Edit passenger
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-3 sm:grid-cols-2'>
          <p><span className='font-medium'>Phone:</span> {data.phone}</p>
          <p><span className='font-medium'>Email:</span> {data.email || '-'}</p>
          <p><span className='font-medium'>Institution:</span> {data.institution?.name || '-'}</p>
          <p><span className='font-medium'>Course:</span> {data.course}</p>
          <p><span className='font-medium'>Shift:</span> {data.shift}</p>
          <p><span className='font-medium'>Boarding point:</span> {data.boardingPoint}</p>
          <p><span className='font-medium'>Status:</span> <PassengerStatusBadge status={data.status} /></p>
          <p><span className='font-medium'>Notes:</span> {data.notes || '-'}</p>
        </CardContent>
      </Card>
    </section>
  );
}

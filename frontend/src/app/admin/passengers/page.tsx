'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { InstitutionSelect } from '@/features/institutions/components/institution-select';
import { fetchPassengers, type PassengerStatus } from '@/features/passengers/api/passengers';
import { PassengerStatusBadge } from '@/features/passengers/components/passenger-status-badge';
import { cn } from '@/lib/utils';
import { SelectInput } from '@/shared/ui/form/form-field';
import { EmptyState } from '@/shared/ui/states/empty-state';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';

export default function AdminPassengersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PassengerStatus | ''>('');
  const [institutionId, setInstitutionId] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['passengers', { search, status, institutionId }],
    queryFn: () =>
      fetchPassengers({
        search: search.trim() || undefined,
        status: status || undefined,
        institutionId: institutionId || undefined,
      }),
  });

  return (
    <section className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>Passenger Management</h1>
          <p className='text-sm text-muted-foreground'>Search and manage registered passengers.</p>
        </div>
        <Link href='/admin/passengers/new' className={cn(buttonVariants({ variant: 'default' }))}>
          Create passenger
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>Filters</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          <Input
            placeholder='Search by name'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <SelectInput value={status} onChange={(event) => setStatus(event.target.value as PassengerStatus | '')}>
            <option value=''>All statuses</option>
            <option value='PAID'>Paid</option>
            <option value='PENDING'>Pending</option>
            <option value='OVERDUE'>Overdue</option>
          </SelectInput>

          <InstitutionSelect includeAllOption value={institutionId} onChange={setInstitutionId} />
        </CardContent>
      </Card>

      {isLoading ? <LoadingState label='Loading passengers...' /> : null}
      {isError ? <ErrorState message='Could not load passengers. Check your filters and try again.' /> : null}

      {!isLoading && !isError && data?.length === 0 ? (
        <EmptyState
          title='No passengers found'
          description='Try adjusting your filters or create a new passenger.'
        />
      ) : null}

      {!isLoading && !isError && data && data.length > 0 ? (
        <div className='space-y-3'>
          <div className='space-y-3 md:hidden'>
            {data.map((passenger) => (
              <Card key={passenger.id}>
                <CardContent className='space-y-3 pt-4 text-sm'>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <p className='font-semibold'>{passenger.fullName}</p>
                      <p className='text-muted-foreground'>{passenger.phone}</p>
                    </div>
                    <PassengerStatusBadge status={passenger.status} />
                  </div>
                  <p className='text-muted-foreground'>Institution: {passenger.institution?.name ?? '-'}</p>
                  <div className='grid grid-cols-2 gap-2'>
                    <Link
                      href={`/admin/passengers/${passenger.id}`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'justify-center')}
                    >
                      View details
                    </Link>
                    <Link
                      href={`/admin/passengers/${passenger.id}/edit`}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'justify-center')}
                    >
                      Edit
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className='hidden md:block'>
            <CardContent className='overflow-x-auto pt-4'>
              <table className='min-w-full text-left text-sm'>
                <thead>
                  <tr className='border-b text-muted-foreground'>
                    <th className='px-2 py-2 font-medium'>Name</th>
                    <th className='px-2 py-2 font-medium'>Phone</th>
                    <th className='px-2 py-2 font-medium'>Institution</th>
                    <th className='px-2 py-2 font-medium'>Status</th>
                    <th className='px-2 py-2 font-medium'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((passenger) => (
                    <tr key={passenger.id} className='border-b last:border-none'>
                      <td className='px-2 py-2'>{passenger.fullName}</td>
                      <td className='px-2 py-2'>{passenger.phone}</td>
                      <td className='px-2 py-2'>{passenger.institution?.name ?? '-'}</td>
                      <td className='px-2 py-2'>
                        <PassengerStatusBadge status={passenger.status} />
                      </td>
                      <td className='px-2 py-2'>
                        <div className='flex flex-wrap gap-2'>
                          <Link
                            href={`/admin/passengers/${passenger.id}`}
                            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                          >
                            View details
                          </Link>
                          <Link
                            href={`/admin/passengers/${passenger.id}/edit`}
                            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </section>
  );
}

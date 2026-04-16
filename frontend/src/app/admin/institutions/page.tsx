'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createInstitution, fetchInstitutions } from '@/features/institutions/api/institutions';
import { InstitutionForm } from '@/features/institutions/components/institution-form';
import type { InstitutionSchema } from '@/features/institutions/schemas/institution-schema';
import { cn } from '@/lib/utils';
import { institutionStatusLabelMap } from '@/shared/ui/form/status-labels';
import { EmptyState } from '@/shared/ui/states/empty-state';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';
import { toast } from '@/shared/ui/toast';

export default function InstitutionsPage() {
  const [creating, setCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['institutions'],
    queryFn: fetchInstitutions,
  });

  const createMutation = useMutation({
    mutationFn: (values: InstitutionSchema) =>
      createInstitution({
        ...values,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      toast.success('Institution created successfully.');
      setCreating(false);
      void queryClient.invalidateQueries({ queryKey: ['institutions'] });
      void queryClient.invalidateQueries({ queryKey: ['institutions', 'options'] });
    },
    onError: () => {
      toast.error('Could not create institution.');
    },
  });

  return (
    <section className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>Institutions</h1>
          <p className='text-sm text-muted-foreground'>Manage academic institutions used for passenger registration.</p>
        </div>
        <button className={cn(buttonVariants({ variant: 'outline' }))} onClick={() => setCreating((prev) => !prev)}>
          {creating ? 'Hide form' : 'Create institution'}
        </button>
      </div>

      {creating ? (
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>New institution</CardTitle>
          </CardHeader>
          <CardContent>
            <InstitutionForm
              submitLabel='Create institution'
              submitting={createMutation.isPending}
              onSubmit={async (values) => {
                await createMutation.mutateAsync(values);
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {isLoading ? <LoadingState label='Loading institutions...' /> : null}
      {isError ? <ErrorState message='Could not load institutions.' /> : null}

      {!isLoading && !isError && data?.length === 0 ? (
        <EmptyState
          title='No institutions yet'
          description='Create your first institution to use it during passenger registration.'
        />
      ) : null}

      {!isLoading && !isError && data && data.length > 0 ? (
        <Card>
          <CardContent className='overflow-x-auto pt-4'>
            <table className='min-w-full text-left text-sm'>
              <thead>
                <tr className='border-b text-muted-foreground'>
                  <th className='px-2 py-2 font-medium'>Name</th>
                  <th className='px-2 py-2 font-medium'>Status</th>
                  <th className='px-2 py-2 font-medium'>Notes</th>
                  <th className='px-2 py-2 font-medium'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((institution) => (
                  <tr key={institution.id} className='border-b last:border-none'>
                    <td className='px-2 py-2'>{institution.name}</td>
                    <td className='px-2 py-2'>{institutionStatusLabelMap[institution.status]}</td>
                    <td className='max-w-xs truncate px-2 py-2'>{institution.notes || '-'}</td>
                    <td className='px-2 py-2'>
                      <Link
                        href={`/admin/institutions/${institution.id}`}
                        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

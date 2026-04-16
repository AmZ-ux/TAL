'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchInstitutionById, updateInstitution } from '@/features/institutions/api/institutions';
import { InstitutionForm } from '@/features/institutions/components/institution-form';
import type { InstitutionSchema } from '@/features/institutions/schemas/institution-schema';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';
import { toast } from '@/shared/ui/toast';

export default function InstitutionDetailsPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['institution', params.id],
    queryFn: () => fetchInstitutionById(params.id),
    enabled: !!params.id,
  });

  const updateMutation = useMutation({
    mutationFn: (values: InstitutionSchema) =>
      updateInstitution(params.id, {
        ...values,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      toast.success('Institution updated successfully.');
      void queryClient.invalidateQueries({ queryKey: ['institution', params.id] });
      void queryClient.invalidateQueries({ queryKey: ['institutions'] });
      void queryClient.invalidateQueries({ queryKey: ['institutions', 'options'] });
    },
    onError: () => {
      toast.error('Could not update institution.');
    },
  });

  if (isLoading) {
    return <LoadingState label='Loading institution details...' />;
  }

  if (isError || !data) {
    return <ErrorState message='Could not load institution details.' />;
  }

  return (
    <section className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Institution details</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm'>
          <p><span className='font-medium'>Name:</span> {data.name}</p>
          <p><span className='font-medium'>Status:</span> {data.status}</p>
          <p><span className='font-medium'>Passengers linked:</span> {data._count?.passengers ?? 0}</p>
          <p><span className='font-medium'>Notes:</span> {data.notes || '-'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update institution</CardTitle>
        </CardHeader>
        <CardContent>
          <InstitutionForm
            initialValues={{
              name: data.name,
              status: data.status,
              notes: data.notes,
            }}
            submitLabel='Save changes'
            submitting={updateMutation.isPending}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync(values);
            }}
          />
        </CardContent>
      </Card>
    </section>
  );
}

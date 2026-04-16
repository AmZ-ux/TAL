'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchPassengerById } from '@/features/passengers/api/passengers';
import { PassengerEditForm } from '@/features/passengers/components/passenger-edit-form';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';

export default function EditPassengerPage() {
  const params = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['passenger', params.id, 'edit'],
    queryFn: () => fetchPassengerById(params.id),
    enabled: !!params.id,
  });

  if (isLoading) {
    return <LoadingState label='Loading passenger data...' />;
  }

  if (isError || !data) {
    return <ErrorState message='Could not load passenger for editing.' />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit passenger</CardTitle>
      </CardHeader>
      <CardContent>
        <PassengerEditForm passenger={data} />
      </CardContent>
    </Card>
  );
}

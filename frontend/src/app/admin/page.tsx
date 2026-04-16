'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary, MOCK_DASHBOARD_SUMMARY } from '@/features/admin/api/dashboard';
import { MetricCard } from '@/features/admin/components/metric-card';
import { EmptyState } from '@/shared/ui/states/empty-state';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';

export default function AdminPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: fetchDashboardSummary,
    placeholderData: MOCK_DASHBOARD_SUMMARY,
  });

  if (isLoading) {
    return <LoadingState label='Loading dashboard metrics...' />;
  }

  if (isError || !data) {
    return <ErrorState message='We could not load dashboard metrics right now. Please try again in a moment.' />;
  }

  return (
    <section className='space-y-4'>
      <div>
        <h1 className='text-xl font-semibold'>Dashboard</h1>
        <p className='text-sm text-muted-foreground'>Overview of current passenger payment status.</p>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <MetricCard title='Total passengers' value={data.totalPassengers} />
        <MetricCard title='Paid' value={data.paid} tone='success' />
        <MetricCard title='Pending' value={data.pending} tone='warning' />
        <MetricCard title='Overdue' value={data.overdue} tone='danger' />
      </div>

      {data.totalPassengers === 0 ? (
        <EmptyState
          title='No passengers yet'
          description='Create your first passenger to start tracking monthly status on this dashboard.'
        />
      ) : null}
    </section>
  );
}

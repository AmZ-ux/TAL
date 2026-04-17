'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchMonthlyFees } from '@/features/monthly-fees/api/monthly-fees';
import { MonthlyFeeStatusBadge } from '@/features/monthly-fees/components/monthly-fee-status-badge';
import { fetchReceipts } from '@/features/receipts/api/receipts';
import { formatCurrency, formatDate, formatReferenceMonth } from '@/features/passenger/lib/financial-format';
import { EmptyState } from '@/shared/ui/states/empty-state';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';

export default function PassengerHistoryPage() {
  const feesQuery = useQuery({
    queryKey: ['monthly-fees', 'passenger', 'history'],
    queryFn: () => fetchMonthlyFees({}),
  });

  const receiptsQuery = useQuery({
    queryKey: ['receipts', 'passenger', 'history'],
    queryFn: () => fetchReceipts(),
  });

  const data = useMemo(() => {
    const fees = feesQuery.data ?? [];
    const receipts = receiptsQuery.data ?? [];

    const summary = fees.reduce(
      (acc, fee) => {
        const amount = Number(fee.amount);
        const parsedAmount = Number.isNaN(amount) ? 0 : amount;

        if (fee.status === 'PAID') {
          acc.totalPaid += parsedAmount;
        }

        if (fee.status === 'PENDING') {
          acc.totalPending += parsedAmount;
        }

        if (fee.status === 'OVERDUE') {
          acc.totalOverdue += parsedAmount;
        }

        return acc;
      },
      { totalPaid: 0, totalPending: 0, totalOverdue: 0 },
    );

    const receiptsByFeeId = receipts.reduce<Record<string, typeof receipts>>((acc, receipt) => {
      if (!acc[receipt.monthlyFeeId]) {
        acc[receipt.monthlyFeeId] = [];
      }

      acc[receipt.monthlyFeeId].push(receipt);
      return acc;
    }, {});

    const history = [...fees].sort((a, b) => b.referenceMonth.localeCompare(a.referenceMonth));

    return { summary, history, receiptsByFeeId };
  }, [feesQuery.data, receiptsQuery.data]);

  if (feesQuery.isLoading || receiptsQuery.isLoading) {
    return <LoadingState label='Loading your financial history...' />;
  }

  if (feesQuery.isError || receiptsQuery.isError) {
    return <ErrorState message='We could not load your financial history. Please try again.' />;
  }

  if (data.history.length === 0) {
    return (
      <EmptyState
        title='No history found'
        description='Your monthly fee history will appear here when records are created.'
      />
    );
  }

  return (
    <section className='space-y-4'>
      <div>
        <h1 className='text-xl font-semibold'>Financial History</h1>
        <p className='text-sm text-muted-foreground'>See totals and your monthly payment timeline.</p>
      </div>

      <div className='grid gap-3 sm:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm text-muted-foreground'>Total paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-lg font-semibold text-chart-3'>{formatCurrency(data.summary.totalPaid)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm text-muted-foreground'>Total pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-lg font-semibold text-chart-5'>{formatCurrency(data.summary.totalPending)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm text-muted-foreground'>Total overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-lg font-semibold text-destructive'>{formatCurrency(data.summary.totalOverdue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className='space-y-3'>
        {data.history.map((fee) => {
          const feeReceipts = (data.receiptsByFeeId[fee.id] ?? []).sort(
            (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
          );

          return (
            <Card key={fee.id}>
              <CardContent className='space-y-3 pt-4'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <div>
                    <p className='text-sm font-semibold'>{formatReferenceMonth(fee.referenceMonth)}</p>
                    <p className='text-xs text-muted-foreground'>
                      Due {formatDate(fee.dueDate)}
                      {fee.paymentDate ? ` | Paid ${formatDate(fee.paymentDate)}` : ''}
                    </p>
                  </div>
                  <MonthlyFeeStatusBadge status={fee.status} />
                </div>

                <p className='text-sm'>
                  <span className='font-medium'>Amount:</span> {formatCurrency(fee.amount)}
                </p>

                <div className='rounded-lg border bg-muted/30 p-3 text-sm'>
                  <p className='mb-2 font-medium'>Uploaded receipts</p>
                  {feeReceipts.length === 0 ? (
                    <p className='text-muted-foreground'>No receipt uploaded for this month.</p>
                  ) : (
                    <div className='space-y-2'>
                      {feeReceipts.map((receipt) => (
                        <div key={receipt.id} className='rounded-md border bg-background p-2'>
                          <p>
                            <span className='font-medium'>Status:</span> {receipt.status}
                          </p>
                          <p>
                            <span className='font-medium'>Uploaded on:</span> {formatDate(receipt.uploadedAt)}
                          </p>
                          {receipt.fileUrl ? (
                            <a
                              href={receipt.fileUrl}
                              target='_blank'
                              rel='noreferrer'
                              className='text-primary underline underline-offset-4'
                            >
                              Open receipt
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

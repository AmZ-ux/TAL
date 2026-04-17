'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchMonthlyFees, type MonthlyFee } from '@/features/monthly-fees/api/monthly-fees';
import { fetchReceipts } from '@/features/receipts/api/receipts';
import { PassengerPaymentStatusBadge } from '@/features/passenger/components/passenger-payment-status-badge';
import { compareByReferenceMonth, formatCurrency, formatDate, formatReferenceMonth } from '@/features/passenger/lib/financial-format';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/shared/ui/states/empty-state';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';

function getCurrentMonthlyFee(fees: MonthlyFee[]) {
  if (fees.length === 0) {
    return null;
  }

  const currentOpenFee = fees.find((fee) => fee.status !== 'PAID');
  if (currentOpenFee) {
    return currentOpenFee;
  }

  return [...fees].sort((a, b) => compareByReferenceMonth(b.referenceMonth, a.referenceMonth))[0] ?? null;
}

export default function PassengerPage() {
  const feesQuery = useQuery({
    queryKey: ['monthly-fees', 'passenger', 'home'],
    queryFn: () => fetchMonthlyFees({}),
  });

  const receiptsQuery = useQuery({
    queryKey: ['receipts', 'passenger', 'home'],
    queryFn: () => fetchReceipts('PENDING'),
  });

  const currentFee = useMemo(() => getCurrentMonthlyFee(feesQuery.data ?? []), [feesQuery.data]);

  const status = useMemo(() => {
    if (!currentFee) {
      return null;
    }

    const hasPendingReceipt = (receiptsQuery.data ?? []).some(
      (receipt) => receipt.monthlyFeeId === currentFee.id && receipt.status === 'PENDING',
    );

    if (currentFee.status !== 'PAID' && hasPendingReceipt) {
      return 'UNDER_REVIEW';
    }

    return currentFee.status;
  }, [currentFee, receiptsQuery.data]);

  if (feesQuery.isLoading || receiptsQuery.isLoading) {
    return <LoadingState label='Loading your current monthly fee...' />;
  }

  if (feesQuery.isError || receiptsQuery.isError) {
    return <ErrorState message='We could not load your payment summary. Please try again in a moment.' />;
  }

  if (!currentFee || !status) {
    return (
      <EmptyState
        title='No monthly fee found'
        description='No monthly fee is available for your account yet. Please contact support if needed.'
      />
    );
  }

  const showUploadAction = status === 'PENDING' || status === 'OVERDUE';

  return (
    <section className='space-y-4'>
      <div>
        <h1 className='text-xl font-semibold'>Home</h1>
        <p className='text-sm text-muted-foreground'>Here is your current monthly fee status.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Current monthly fee</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='rounded-lg border bg-muted/30 p-3'>
              <p className='text-xs text-muted-foreground'>Reference month</p>
              <p className='text-sm font-semibold'>{formatReferenceMonth(currentFee.referenceMonth)}</p>
            </div>
            <div className='rounded-lg border bg-muted/30 p-3'>
              <p className='text-xs text-muted-foreground'>Amount</p>
              <p className='text-sm font-semibold'>{formatCurrency(currentFee.amount)}</p>
            </div>
            <div className='rounded-lg border bg-muted/30 p-3'>
              <p className='text-xs text-muted-foreground'>Due date</p>
              <p className='text-sm font-semibold'>{formatDate(currentFee.dueDate)}</p>
            </div>
            <div className='rounded-lg border bg-muted/30 p-3'>
              <p className='text-xs text-muted-foreground'>Status</p>
              <div className='pt-1'>
                <PassengerPaymentStatusBadge status={status} />
              </div>
            </div>
          </div>

          <div className='flex flex-wrap gap-2'>
            {showUploadAction ? (
              <Link
                href={`/passenger/upload-receipt?monthlyFeeId=${currentFee.id}`}
                className={cn(buttonVariants({ variant: 'default' }), 'w-full sm:w-auto')}
              >
                Upload receipt
              </Link>
            ) : (
              <Link
                href={`/passenger/monthly-fees?feeId=${currentFee.id}`}
                className={cn(buttonVariants({ variant: 'default' }), 'w-full sm:w-auto')}
              >
                View monthly fee details
              </Link>
            )}
            <Link
              href='/passenger/monthly-fees'
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full sm:w-auto')}
            >
              View all monthly fees
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

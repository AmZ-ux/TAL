'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { fetchMonthlyFees, type MonthlyFee, type MonthlyFeeStatus } from '@/features/monthly-fees/api/monthly-fees';
import { MonthlyFeeStatusBadge } from '@/features/monthly-fees/components/monthly-fee-status-badge';
import { compareByReferenceMonth, formatCurrency, formatDate, formatReferenceMonth } from '@/features/passenger/lib/financial-format';
import { SelectInput } from '@/shared/ui/form/form-field';
import { EmptyState } from '@/shared/ui/states/empty-state';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';

type SortOrder = 'DESC' | 'ASC';

export default function PassengerMonthlyFeesPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<MonthlyFeeStatus | ''>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [selectedFee, setSelectedFee] = useState<MonthlyFee | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['monthly-fees', 'passenger', 'list', status],
    queryFn: () =>
      fetchMonthlyFees({
        status: status || undefined,
      }),
  });

  const sortedData = useMemo(() => {
    const fees = [...(data ?? [])];
    fees.sort((a, b) =>
      sortOrder === 'ASC'
        ? compareByReferenceMonth(a.referenceMonth, b.referenceMonth)
        : compareByReferenceMonth(b.referenceMonth, a.referenceMonth),
    );
    return fees;
  }, [data, sortOrder]);

  useEffect(() => {
    const feeIdFromQuery = searchParams.get('feeId');
    if (!feeIdFromQuery || !sortedData.length) {
      return;
    }

    const matchedFee = sortedData.find((fee) => fee.id === feeIdFromQuery);
    if (matchedFee) {
      setSelectedFee(matchedFee);
    }
  }, [searchParams, sortedData]);

  return (
    <section className='space-y-4'>
      <div>
        <h1 className='text-xl font-semibold'>Monthly Fees</h1>
        <p className='text-sm text-muted-foreground'>Check your monthly fees and open details for each month.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>Filters and sorting</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-3 sm:grid-cols-2'>
          <SelectInput value={status} onChange={(event) => setStatus(event.target.value as MonthlyFeeStatus | '')}>
            <option value=''>All statuses</option>
            <option value='PAID'>Paid</option>
            <option value='PENDING'>Pending</option>
            <option value='OVERDUE'>Overdue</option>
          </SelectInput>

          <SelectInput value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}>
            <option value='DESC'>Newest month first</option>
            <option value='ASC'>Oldest month first</option>
          </SelectInput>
        </CardContent>
      </Card>

      {isLoading ? <LoadingState label='Loading your monthly fees...' /> : null}
      {isError ? <ErrorState message='We could not load your monthly fees. Please try again.' /> : null}

      {!isLoading && !isError && sortedData.length === 0 ? (
        <EmptyState
          title='No monthly fees found'
          description='There are no monthly fees with this filter. Try another status.'
        />
      ) : null}

      {!isLoading && !isError && sortedData.length > 0 ? (
        <div className='space-y-3'>
          {sortedData.map((fee) => (
            <Card key={fee.id}>
              <CardContent className='space-y-3 pt-4'>
                <div className='flex items-start justify-between gap-2'>
                  <div>
                    <p className='text-sm font-semibold'>{formatReferenceMonth(fee.referenceMonth)}</p>
                    <p className='text-xs text-muted-foreground'>Due on {formatDate(fee.dueDate)}</p>
                  </div>
                  <MonthlyFeeStatusBadge status={fee.status} />
                </div>

                <div className='rounded-lg border bg-muted/30 p-3'>
                  <p className='text-xs text-muted-foreground'>Amount</p>
                  <p className='text-sm font-semibold'>{formatCurrency(fee.amount)}</p>
                </div>

                <Button variant='outline' className='w-full sm:w-auto' onClick={() => setSelectedFee(fee)}>
                  View details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      <Dialog open={!!selectedFee} onOpenChange={(open) => (!open ? setSelectedFee(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monthly fee details</DialogTitle>
            <DialogDescription>Details for this reference month.</DialogDescription>
          </DialogHeader>

          {selectedFee ? (
            <div className='space-y-2 rounded-lg border bg-muted/30 p-3 text-sm'>
              <p>
                <span className='font-medium'>Month:</span> {formatReferenceMonth(selectedFee.referenceMonth)}
              </p>
              <p>
                <span className='font-medium'>Amount:</span> {formatCurrency(selectedFee.amount)}
              </p>
              <p>
                <span className='font-medium'>Due date:</span> {formatDate(selectedFee.dueDate)}
              </p>
              <p>
                <span className='font-medium'>Status:</span>{' '}
                <span className='inline-block align-middle'>
                  <MonthlyFeeStatusBadge status={selectedFee.status} />
                </span>
              </p>
              <p>
                <span className='font-medium'>Payment date:</span>{' '}
                {selectedFee.paymentDate ? formatDate(selectedFee.paymentDate) : 'Not paid yet'}
              </p>
              <p>
                <span className='font-medium'>Notes:</span> {selectedFee.notes?.trim() ? selectedFee.notes : 'No notes'}
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant='outline' onClick={() => setSelectedFee(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

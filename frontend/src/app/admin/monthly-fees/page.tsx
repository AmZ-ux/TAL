'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
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
import {
  fetchMonthlyFees,
  markMonthlyFeeAsPaid,
  type MonthlyFee,
  type MonthlyFeeStatus,
} from '@/features/monthly-fees/api/monthly-fees';
import { MonthlyFeeStatusBadge } from '@/features/monthly-fees/components/monthly-fee-status-badge';
import { SelectInput } from '@/shared/ui/form/form-field';
import { EmptyState } from '@/shared/ui/states/empty-state';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';
import { toast } from '@/shared/ui/toast';

function formatMonth(referenceMonth: string) {
  const [year, month] = referenceMonth.split('-');
  if (!year || !month) {
    return referenceMonth;
  }

  return `${month}/${year}`;
}

function formatCurrency(amount: string) {
  const numericAmount = Number(amount);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isNaN(numericAmount) ? 0 : numericAmount);
}

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(dateIso));
}

export default function MonthlyFeesPage() {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState('');
  const [status, setStatus] = useState<MonthlyFeeStatus | ''>('');
  const [selectedFee, setSelectedFee] = useState<MonthlyFee | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['monthly-fees', { month, status }],
    queryFn: () =>
      fetchMonthlyFees({
        month: month || undefined,
        status: status || undefined,
      }),
  });

  const activeFilters = useMemo(() => {
    const items: string[] = [];

    if (month) {
      items.push(`Month: ${formatMonth(month)}`);
    }

    if (status) {
      items.push(`Status: ${status}`);
    }

    return items;
  }, [month, status]);

  const payMutation = useMutation({
    mutationFn: (id: string) => markMonthlyFeeAsPaid(id),
    onSuccess: () => {
      toast.success('Payment registered successfully.');
      setSelectedFee(null);
      void queryClient.invalidateQueries({ queryKey: ['monthly-fees'] });
    },
    onError: () => {
      toast.error('Could not register payment.');
    },
  });

  return (
    <section className='space-y-4'>
      <div>
        <h1 className='text-xl font-semibold'>Monthly Fees</h1>
        <p className='text-sm text-muted-foreground'>Track monthly fees, statuses, and manual payment updates.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>Filters</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='grid gap-3 sm:grid-cols-2'>
            <input
              type='month'
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className='h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
            />
            <SelectInput value={status} onChange={(event) => setStatus(event.target.value as MonthlyFeeStatus | '')}>
              <option value=''>All statuses</option>
              <option value='PAID'>Paid</option>
              <option value='PENDING'>Pending</option>
              <option value='OVERDUE'>Overdue</option>
            </SelectInput>
          </div>

          {activeFilters.length > 0 ? (
            <div className='flex flex-wrap items-center gap-2'>
              {activeFilters.map((filter) => (
                <span key={filter} className='rounded-md border bg-muted px-2 py-1 text-xs'>
                  {filter}
                </span>
              ))}
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setMonth('');
                  setStatus('');
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {isLoading ? <LoadingState label='Loading monthly fees...' /> : null}
      {isError ? <ErrorState message='Could not load monthly fees.' /> : null}

      {!isLoading && !isError && data?.length === 0 ? (
        <EmptyState
          title='No monthly fees found'
          description='Try changing filters or register monthly fee records for passengers.'
        />
      ) : null}

      {!isLoading && !isError && data && data.length > 0 ? (
        <div className='space-y-3'>
          <div className='space-y-3 md:hidden'>
            {data.map((fee) => (
              <Card key={fee.id}>
                <CardContent className='space-y-3 pt-4 text-sm'>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <p className='font-semibold'>{fee.passenger.fullName}</p>
                      <p className='text-muted-foreground'>{formatMonth(fee.referenceMonth)}</p>
                    </div>
                    <MonthlyFeeStatusBadge status={fee.status} />
                  </div>
                  <p>
                    <span className='font-medium'>Amount:</span> {formatCurrency(fee.amount)}
                  </p>
                  <p className='text-muted-foreground'>Due date: {formatDate(fee.dueDate)}</p>
                  <Button
                    size='sm'
                    variant='outline'
                    className='w-full'
                    disabled={fee.status === 'PAID'}
                    onClick={() => setSelectedFee(fee)}
                  >
                    Mark as paid
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className='hidden md:block'>
            <CardContent className='overflow-x-auto pt-4'>
              <table className='min-w-full text-left text-sm'>
                <thead>
                  <tr className='border-b text-muted-foreground'>
                    <th className='px-2 py-2 font-medium'>Passenger</th>
                    <th className='px-2 py-2 font-medium'>Month</th>
                    <th className='px-2 py-2 font-medium'>Amount</th>
                    <th className='px-2 py-2 font-medium'>Due date</th>
                    <th className='px-2 py-2 font-medium'>Status</th>
                    <th className='px-2 py-2 font-medium'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((fee) => (
                    <tr key={fee.id} className='border-b last:border-none'>
                      <td className='px-2 py-2'>{fee.passenger.fullName}</td>
                      <td className='px-2 py-2'>{formatMonth(fee.referenceMonth)}</td>
                      <td className='px-2 py-2'>{formatCurrency(fee.amount)}</td>
                      <td className='px-2 py-2'>{formatDate(fee.dueDate)}</td>
                      <td className='px-2 py-2'>
                        <MonthlyFeeStatusBadge status={fee.status} />
                      </td>
                      <td className='px-2 py-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          disabled={fee.status === 'PAID'}
                          onClick={() => setSelectedFee(fee)}
                        >
                          Mark as paid
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Dialog open={!!selectedFee} onOpenChange={(open) => (!open ? setSelectedFee(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm payment registration</DialogTitle>
            <DialogDescription>
              This action will mark the monthly fee as paid and set payment date to now.
            </DialogDescription>
          </DialogHeader>

          {selectedFee ? (
            <div className='rounded-lg border bg-muted/30 p-3 text-sm'>
              <p>
                <span className='font-medium'>Passenger:</span> {selectedFee.passenger.fullName}
              </p>
              <p>
                <span className='font-medium'>Month:</span> {formatMonth(selectedFee.referenceMonth)}
              </p>
              <p>
                <span className='font-medium'>Amount:</span> {formatCurrency(selectedFee.amount)}
              </p>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant='outline' onClick={() => setSelectedFee(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedFee) {
                  return;
                }

                payMutation.mutate(selectedFee.id);
              }}
              disabled={!selectedFee || payMutation.isPending}
            >
              {payMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
              Confirm payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

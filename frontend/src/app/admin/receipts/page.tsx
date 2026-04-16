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
  approveReceipt,
  fetchReceipts,
  rejectReceipt,
  type Receipt,
  type ReceiptStatus,
} from '@/features/receipts/api/receipts';
import { ReceiptStatusBadge } from '@/features/receipts/components/receipt-status-badge';
import { SelectInput } from '@/shared/ui/form/form-field';
import { EmptyState } from '@/shared/ui/states/empty-state';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';
import { toast } from '@/shared/ui/toast';

function formatMonth(referenceMonth: string) {
  const [year, month] = referenceMonth.split('-');
  return year && month ? `${month}/${year}` : referenceMonth;
}

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateIso));
}

function formatCurrency(amount: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(amount),
  );
}

export default function AdminReceiptsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ReceiptStatus | ''>('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const receiptsQuery = useQuery({
    queryKey: ['receipts', 'admin', statusFilter],
    queryFn: () => fetchReceipts(statusFilter || undefined),
  });

  const approveMutation = useMutation({
    mutationFn: (receiptId: string) => approveReceipt(receiptId, { adminNotes: adminNotes || undefined }),
    onSuccess: () => {
      toast.success('Receipt approved. Monthly fee updated to paid.');
      setSelectedReceipt(null);
      setAdminNotes('');
      setRejectionReason('');
      void queryClient.invalidateQueries({ queryKey: ['receipts'] });
      void queryClient.invalidateQueries({ queryKey: ['monthly-fees'] });
    },
    onError: () => {
      toast.error('Could not approve receipt.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (receiptId: string) =>
      rejectReceipt(receiptId, {
        rejectionReason,
        adminNotes: adminNotes || undefined,
      }),
    onSuccess: () => {
      toast.success('Receipt rejected successfully.');
      setSelectedReceipt(null);
      setAdminNotes('');
      setRejectionReason('');
      void queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
    onError: () => {
      toast.error('Could not reject receipt.');
    },
  });

  const pendingCount = useMemo(
    () => receiptsQuery.data?.filter((item) => item.status === 'PENDING').length ?? 0,
    [receiptsQuery.data],
  );

  return (
    <section className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl font-semibold'>Receipt Queue</h1>
          <p className='text-sm text-muted-foreground'>Review uploaded receipts and decide approval or rejection.</p>
        </div>
        <span className='rounded-md border bg-muted px-2 py-1 text-xs'>Pending: {pendingCount}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>Filters</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-wrap items-center gap-2'>
          <SelectInput
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ReceiptStatus | '')}
            className='w-full sm:w-52'
          >
            <option value=''>All statuses</option>
            <option value='PENDING'>Pending</option>
            <option value='APPROVED'>Approved</option>
            <option value='REJECTED'>Rejected</option>
          </SelectInput>

          {statusFilter ? (
            <Button variant='outline' size='sm' onClick={() => setStatusFilter('')}>
              Clear filter
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {receiptsQuery.isLoading ? <LoadingState label='Loading receipt queue...' /> : null}
      {receiptsQuery.isError ? <ErrorState message='Could not load receipts.' /> : null}
      {!receiptsQuery.isLoading && !receiptsQuery.isError && (receiptsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title='No receipts found' description='There are no receipts for the selected filter.' />
      ) : null}

      {!receiptsQuery.isLoading && !receiptsQuery.isError && (receiptsQuery.data?.length ?? 0) > 0 ? (
        <Card>
          <CardContent className='overflow-x-auto pt-4'>
            <table className='min-w-full text-left text-sm'>
              <thead>
                <tr className='border-b text-muted-foreground'>
                  <th className='px-2 py-2 font-medium'>Passenger</th>
                  <th className='px-2 py-2 font-medium'>Month</th>
                  <th className='px-2 py-2 font-medium'>Status</th>
                  <th className='px-2 py-2 font-medium'>Upload date</th>
                  <th className='px-2 py-2 font-medium'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receiptsQuery.data?.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className={`border-b last:border-none ${receipt.status === 'PENDING' ? 'bg-chart-5/10' : ''}`}
                  >
                    <td className='px-2 py-2'>{receipt.monthlyFee.passenger.fullName}</td>
                    <td className='px-2 py-2'>{formatMonth(receipt.monthlyFee.referenceMonth)}</td>
                    <td className='px-2 py-2'>
                      <ReceiptStatusBadge status={receipt.status} />
                    </td>
                    <td className='px-2 py-2'>{formatDate(receipt.uploadedAt)}</td>
                    <td className='px-2 py-2'>
                      <Button size='sm' variant='outline' onClick={() => setSelectedReceipt(receipt)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}

      <Dialog
        open={!!selectedReceipt}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReceipt(null);
            setAdminNotes('');
            setRejectionReason('');
          }
        }}
      >
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Receipt Review</DialogTitle>
            <DialogDescription>Inspect receipt data before approving or rejecting.</DialogDescription>
          </DialogHeader>

          {selectedReceipt ? (
            <div className='grid gap-4 lg:grid-cols-2'>
              <div className='space-y-3'>
                {selectedReceipt.fileType === 'application/pdf' ? (
                  <iframe src={selectedReceipt.fileUrl} title='Receipt PDF' className='h-96 w-full rounded-md border' />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedReceipt.fileUrl} alt='Receipt image' className='h-96 w-full rounded-md border object-contain' />
                )}
              </div>

              <div className='space-y-3 text-sm'>
                <div className='rounded-lg border p-3'>
                  <p><span className='font-medium'>Passenger:</span> {selectedReceipt.monthlyFee.passenger.fullName}</p>
                  <p><span className='font-medium'>Month:</span> {formatMonth(selectedReceipt.monthlyFee.referenceMonth)}</p>
                  <p><span className='font-medium'>Amount:</span> {formatCurrency(selectedReceipt.monthlyFee.amount)}</p>
                  <p><span className='font-medium'>Due date:</span> {formatDate(selectedReceipt.monthlyFee.dueDate)}</p>
                  <p className='mt-1'><ReceiptStatusBadge status={selectedReceipt.status} /></p>
                </div>

                <div className='space-y-2'>
                  <label htmlFor='adminNotes' className='text-sm font-medium'>Admin observations</label>
                  <textarea
                    id='adminNotes'
                    rows={3}
                    value={adminNotes}
                    onChange={(event) => setAdminNotes(event.target.value)}
                    className='w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
                  />
                </div>

                <div className='space-y-2'>
                  <label htmlFor='rejectionReason' className='text-sm font-medium'>Rejection reason</label>
                  <textarea
                    id='rejectionReason'
                    rows={2}
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    className='w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
                    placeholder='Required when rejecting'
                  />
                </div>

                {selectedReceipt.rejectionReason ? (
                  <p className='text-destructive'>Last rejection reason: {selectedReceipt.rejectionReason}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setSelectedReceipt(null);
                setAdminNotes('');
                setRejectionReason('');
              }}
            >
              Close
            </Button>
            <Button
              variant='destructive'
              disabled={
                !selectedReceipt ||
                selectedReceipt.status !== 'PENDING' ||
                rejectMutation.isPending ||
                rejectionReason.trim().length < 3
              }
              onClick={() => {
                if (!selectedReceipt) {
                  return;
                }

                rejectMutation.mutate(selectedReceipt.id);
              }}
            >
              {rejectMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
              Reject
            </Button>
            <Button
              disabled={!selectedReceipt || selectedReceipt.status !== 'PENDING' || approveMutation.isPending}
              onClick={() => {
                if (!selectedReceipt) {
                  return;
                }

                approveMutation.mutate(selectedReceipt.id);
              }}
            >
              {approveMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

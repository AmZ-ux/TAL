'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchMonthlyFees } from '@/features/monthly-fees/api/monthly-fees';
import {
  createReceipt,
  fetchReceipts,
  type CreateReceiptInput,
} from '@/features/receipts/api/receipts';
import { ReceiptStatusBadge } from '@/features/receipts/components/receipt-status-badge';
import { FormField, SelectInput } from '@/shared/ui/form/form-field';
import { EmptyState } from '@/shared/ui/states/empty-state';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';
import { toast } from '@/shared/ui/toast';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatMonth(referenceMonth: string) {
  const [year, month] = referenceMonth.split('-');
  return year && month ? `${month}/${year}` : referenceMonth;
}

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(dateIso));
}

export default function UploadReceiptPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [monthlyFeeId, setMonthlyFeeId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const feesQuery = useQuery({
    queryKey: ['monthly-fees', 'passenger-upload'],
    queryFn: () => fetchMonthlyFees({}),
  });

  const receiptsQuery = useQuery({
    queryKey: ['receipts', 'passenger'],
    queryFn: () => fetchReceipts(),
  });

  const availableFees = useMemo(
    () => (feesQuery.data ?? []).filter((fee) => fee.status !== 'PAID'),
    [feesQuery.data],
  );

  useEffect(() => {
    const monthlyFeeIdFromQuery = searchParams.get('monthlyFeeId');
    if (!monthlyFeeIdFromQuery || availableFees.length === 0) {
      return;
    }

    const hasMatchingFee = availableFees.some((fee) => fee.id === monthlyFeeIdFromQuery);
    if (hasMatchingFee) {
      setMonthlyFeeId(monthlyFeeIdFromQuery);
    }
  }, [availableFees, searchParams]);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) {
        throw new Error('Select a file first.');
      }

      if (!monthlyFeeId) {
        throw new Error('Select a monthly fee.');
      }

      const fileUrl = await fileToDataUrl(file);

      const payload: CreateReceiptInput = {
        monthlyFeeId,
        fileUrl,
        fileType: file.type,
      };

      return createReceipt(payload);
    },
    onSuccess: () => {
      toast.success('Receipt uploaded successfully.');
      setFile(null);
      setPreviewUrl('');
      setMonthlyFeeId('');
      void queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Could not upload receipt.';
      toast.error(message);
    },
  });

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl('');
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type as (typeof ALLOWED_TYPES)[number])) {
      toast.error('Invalid file type. Upload JPG, PNG, WEBP, or PDF.');
      event.target.value = '';
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File exceeds the 5MB limit.');
      event.target.value = '';
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  return (
    <section className='space-y-4'>
      <div>
        <h1 className='text-xl font-semibold'>Upload Receipt</h1>
        <p className='text-sm text-muted-foreground'>Select the month and send your payment receipt.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New receipt</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {feesQuery.isLoading ? <LoadingState label='Loading monthly fees...' /> : null}
          {feesQuery.isError ? <ErrorState message='Could not load monthly fees.' /> : null}

          {!feesQuery.isLoading && !feesQuery.isError ? (
            <>
              <FormField id='monthlyFeeId' label='Monthly fee' required>
                <SelectInput
                  id='monthlyFeeId'
                  value={monthlyFeeId}
                  onChange={(event) => setMonthlyFeeId(event.target.value)}
                >
                  <option value=''>Select monthly fee</option>
                  {availableFees.map((fee) => (
                    <option key={fee.id} value={fee.id}>
                      {formatMonth(fee.referenceMonth)} - due {formatDate(fee.dueDate)}
                    </option>
                  ))}
                </SelectInput>
              </FormField>

              <FormField id='receiptFile' label='Receipt file (image or PDF)' required>
                <input
                  id='receiptFile'
                  type='file'
                  accept='image/jpeg,image/jpg,image/png,image/webp,application/pdf'
                  onChange={onFileChange}
                  className='block w-full text-sm'
                />
                <p className='text-xs text-muted-foreground'>Maximum file size: 5MB.</p>
              </FormField>

              {previewUrl ? (
                <div className='space-y-2 rounded-lg border p-3'>
                  <p className='text-sm font-medium'>Preview</p>
                  {file?.type === 'application/pdf' ? (
                    <iframe src={previewUrl} title='Receipt preview' className='h-72 w-full rounded-md border' />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt='Receipt preview' className='max-h-72 rounded-md border object-contain' />
                  )}
                </div>
              ) : null}

              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={uploadMutation.isPending || !file || !monthlyFeeId}
              >
                {uploadMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
                Submit receipt
              </Button>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your receipts</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {receiptsQuery.isLoading ? <LoadingState label='Loading receipts...' /> : null}
          {receiptsQuery.isError ? <ErrorState message='Could not load receipts.' /> : null}
          {!receiptsQuery.isLoading && !receiptsQuery.isError && (receiptsQuery.data?.length ?? 0) === 0 ? (
            <EmptyState title='No receipts uploaded' description='Upload your first receipt to start review.' />
          ) : null}

          {!receiptsQuery.isLoading && !receiptsQuery.isError && (receiptsQuery.data?.length ?? 0) > 0 ? (
            <div className='space-y-2'>
              {receiptsQuery.data?.map((receipt) => (
                <div key={receipt.id} className='rounded-lg border p-3 text-sm'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <p className='font-medium'>Month {formatMonth(receipt.monthlyFee.referenceMonth)}</p>
                    <ReceiptStatusBadge status={receipt.status} />
                  </div>
                  <p className='mt-1 text-muted-foreground'>Uploaded at {formatDate(receipt.uploadedAt)}</p>
                  {receipt.adminNotes ? <p className='mt-2'>Admin notes: {receipt.adminNotes}</p> : null}
                  {receipt.rejectionReason ? (
                    <p className='mt-1 text-destructive'>Rejection reason: {receipt.rejectionReason}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}

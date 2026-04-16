import { api } from '@/shared/api/api-client';

export type ReceiptStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type Receipt = {
  id: string;
  monthlyFeeId: string;
  fileUrl: string;
  fileType: string;
  status: ReceiptStatus;
  rejectionReason?: string | null;
  adminNotes?: string | null;
  uploadedAt: string;
  analyzedAt?: string | null;
  analyzedBy?: string | null;
  monthlyFee: {
    id: string;
    referenceMonth: string;
    amount: string;
    dueDate: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    paymentDate?: string | null;
    passenger: {
      id: string;
      fullName: string;
      userId?: string | null;
    };
  };
  analyzedByUser?: {
    id: string;
    email: string;
  } | null;
};

export type CreateReceiptInput = {
  monthlyFeeId: string;
  fileUrl: string;
  fileType: string;
};

export type RejectReceiptInput = {
  rejectionReason: string;
  adminNotes?: string;
};

export type ApproveReceiptInput = {
  adminNotes?: string;
};

export async function createReceipt(input: CreateReceiptInput) {
  const { data } = await api.post<Receipt>('/receipts', input);
  return data;
}

export async function fetchReceipts(status?: ReceiptStatus) {
  const { data } = await api.get<Receipt[]>('/receipts', {
    params: {
      ...(status ? { status } : {}),
    },
  });

  return data;
}

export async function approveReceipt(id: string, input: ApproveReceiptInput) {
  const { data } = await api.patch<Receipt>(`/receipts/${id}/approve`, input);
  return data;
}

export async function rejectReceipt(id: string, input: RejectReceiptInput) {
  const { data } = await api.patch<Receipt>(`/receipts/${id}/reject`, input);
  return data;
}

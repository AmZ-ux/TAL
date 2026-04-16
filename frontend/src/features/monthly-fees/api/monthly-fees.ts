import { api } from '@/shared/api/api-client';

export type MonthlyFeeStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export type MonthlyFee = {
  id: string;
  passengerId: string;
  referenceMonth: string;
  amount: string;
  dueDate: string;
  status: MonthlyFeeStatus;
  paymentDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  passenger: {
    id: string;
    fullName: string;
  };
};

export type MonthlyFeeFilters = {
  passengerId?: string;
  month?: string;
  status?: MonthlyFeeStatus;
};

export async function fetchMonthlyFees(filters: MonthlyFeeFilters) {
  const { data } = await api.get<MonthlyFee[]>('/monthly-fees', {
    params: {
      ...(filters.passengerId ? { passengerId: filters.passengerId } : {}),
      ...(filters.month ? { month: filters.month } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
  });

  return data;
}

export async function markMonthlyFeeAsPaid(id: string) {
  const { data } = await api.patch<MonthlyFee>(`/monthly-fees/${id}/pay`);
  return data;
}

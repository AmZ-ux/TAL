import { Badge } from '@/components/ui/badge';
import type { MonthlyFeeStatus } from '@/features/monthly-fees/api/monthly-fees';

export type PassengerPaymentStatus = MonthlyFeeStatus | 'UNDER_REVIEW';

const statusClassMap: Record<PassengerPaymentStatus, string> = {
  PAID: 'bg-chart-3/20 text-chart-3',
  PENDING: 'bg-chart-5/20 text-chart-5',
  OVERDUE: 'bg-destructive/20 text-destructive',
  UNDER_REVIEW: 'bg-accent/20 text-accent-foreground',
};

const statusLabelMap: Record<PassengerPaymentStatus, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
  UNDER_REVIEW: 'Under review',
};

export function PassengerPaymentStatusBadge({ status }: { status: PassengerPaymentStatus }) {
  return <Badge className={statusClassMap[status]}>{statusLabelMap[status]}</Badge>;
}

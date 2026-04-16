import { Badge } from '@/components/ui/badge';
import type { MonthlyFeeStatus } from '@/features/monthly-fees/api/monthly-fees';
import { statusLabelMap } from '@/shared/ui/form/status-labels';

const statusClassMap: Record<MonthlyFeeStatus, string> = {
  PAID: 'bg-chart-3/20 text-chart-3',
  PENDING: 'bg-chart-5/20 text-chart-5',
  OVERDUE: 'bg-destructive/20 text-destructive',
};

export function MonthlyFeeStatusBadge({ status }: { status: MonthlyFeeStatus }) {
  return <Badge className={statusClassMap[status]}>{statusLabelMap[status]}</Badge>;
}

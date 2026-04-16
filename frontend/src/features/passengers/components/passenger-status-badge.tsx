import { Badge } from '@/components/ui/badge';
import { statusLabelMap } from '@/shared/ui/form/status-labels';
import type { PassengerStatus } from '@/features/passengers/api/passengers';

const statusClassMap: Record<PassengerStatus, string> = {
  PAID: 'bg-chart-3/20 text-chart-3',
  PENDING: 'bg-chart-5/20 text-chart-5',
  OVERDUE: 'bg-destructive/20 text-destructive',
};

export function PassengerStatusBadge({ status }: { status: PassengerStatus }) {
  return <Badge className={statusClassMap[status]}>{statusLabelMap[status]}</Badge>;
}

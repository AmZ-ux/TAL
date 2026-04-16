import { Badge } from '@/components/ui/badge';
import type { ReceiptStatus } from '@/features/receipts/api/receipts';

const statusClassMap: Record<ReceiptStatus, string> = {
  PENDING: 'bg-chart-5/20 text-chart-5',
  APPROVED: 'bg-chart-3/20 text-chart-3',
  REJECTED: 'bg-destructive/20 text-destructive',
};

const statusLabelMap: Record<ReceiptStatus, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function ReceiptStatusBadge({ status }: { status: ReceiptStatus }) {
  return <Badge className={statusClassMap[status]}>{statusLabelMap[status]}</Badge>;
}

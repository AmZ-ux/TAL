import { Status } from '@prisma/client';

export function resolveMonthlyFeeStatus(
  dueDate: Date,
  paymentDate?: Date | null,
  now: Date = new Date(),
): Status {
  if (paymentDate) {
    return Status.PAID;
  }

  return now <= dueDate ? Status.PENDING : Status.OVERDUE;
}

export function normalizeReferenceMonth(input: string) {
  const trimmed = input.trim();

  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{2}\/\d{4}$/.test(trimmed)) {
    const [month, year] = trimmed.split('/');
    return `${year}-${month}`;
  }

  return trimmed;
}

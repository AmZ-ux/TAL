import { api } from '@/shared/api/api-client';

export type AuditLog = {
  id: string;
  actorId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  payload?: Record<string, unknown> | null;
  createdAt: string;
  actor?: {
    id: string;
    email: string;
    role: 'ADMIN' | 'PASSENGER';
  } | null;
};

type AuditLogFilters = {
  user?: string;
  action?: string;
  date?: string;
};

export async function fetchAuditLogs(filters: AuditLogFilters) {
  const { data } = await api.get<AuditLog[]>('/audit-logs', {
    params: {
      ...(filters.user ? { user: filters.user } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(filters.date ? { date: filters.date } : {}),
    },
  });

  return data;
}

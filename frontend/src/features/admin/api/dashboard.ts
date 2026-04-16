import { api } from '@/shared/api/api-client';

export type DashboardSummary = {
  totalPassengers: number;
  paid: number;
  pending: number;
  overdue: number;
};

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  totalPassengers: 0,
  paid: 0,
  pending: 0,
  overdue: 0,
};

export async function fetchDashboardSummary() {
  const { data } = await api.get<DashboardSummary>('/admin/dashboard/summary');
  return data;
}

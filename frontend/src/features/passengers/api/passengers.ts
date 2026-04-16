import { api } from '@/shared/api/api-client';
import type { Institution } from '@/features/institutions/api/institutions';

export type PassengerStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export type Passenger = {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  course: string;
  shift: string;
  boardingPoint: string;
  notes?: string | null;
  status: PassengerStatus;
  institutionId: string;
  createdAt: string;
  updatedAt: string;
  institution: Pick<Institution, 'id' | 'name' | 'status'>;
};

export type PassengerFilters = {
  search?: string;
  status?: PassengerStatus;
  institutionId?: string;
};

export type UpsertPassengerInput = {
  fullName: string;
  phone: string;
  email?: string;
  institutionId: string;
  course: string;
  shift: string;
  boardingPoint: string;
  notes?: string;
  status?: PassengerStatus;
};

export async function fetchPassengers(filters: PassengerFilters) {
  const { data } = await api.get<Passenger[]>('/passengers', {
    params: {
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.institutionId ? { institutionId: filters.institutionId } : {}),
    },
  });

  return data;
}

export async function fetchPassengerById(id: string) {
  const { data } = await api.get<Passenger>(`/passengers/${id}`);
  return data;
}

export async function createPassenger(input: UpsertPassengerInput) {
  const { data } = await api.post<Passenger>('/passengers', input);
  return data;
}

export async function updatePassenger(id: string, input: Partial<UpsertPassengerInput>) {
  const { data } = await api.patch<Passenger>(`/passengers/${id}`, input);
  return data;
}

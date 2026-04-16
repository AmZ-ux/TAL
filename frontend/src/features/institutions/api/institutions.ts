import { api } from '@/shared/api/api-client';

export type InstitutionStatus = 'ACTIVE' | 'INACTIVE';

export type Institution = {
  id: string;
  name: string;
  status: InstitutionStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InstitutionDetails = Institution & {
  _count?: {
    passengers: number;
  };
};

export type UpsertInstitutionInput = {
  name: string;
  status: InstitutionStatus;
  notes?: string;
};

export async function fetchInstitutions() {
  const { data } = await api.get<Institution[]>('/institutions');
  return data;
}

export async function fetchInstitutionById(id: string) {
  const { data } = await api.get<InstitutionDetails>(`/institutions/${id}`);
  return data;
}

export async function createInstitution(input: UpsertInstitutionInput) {
  const { data } = await api.post<Institution>('/institutions', input);
  return data;
}

export async function updateInstitution(id: string, input: Partial<UpsertInstitutionInput>) {
  const { data } = await api.patch<Institution>(`/institutions/${id}`, input);
  return data;
}

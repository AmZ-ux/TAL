import { api } from '@/shared/api/api-client';

export type User = {
  id: string;
  email: string;
  role: 'ADMIN' | 'PASSENGER';
};

export async function fetchUsers() {
  const { data } = await api.get<User[]>('/users');
  return data;
}

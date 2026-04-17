'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAuditLogs } from '@/features/audit-logs/api/audit-logs';
import { fetchUsers } from '@/features/users/api/users';
import { SelectInput } from '@/shared/ui/form/form-field';
import { EmptyState } from '@/shared/ui/states/empty-state';
import { ErrorState } from '@/shared/ui/states/error-state';
import { LoadingState } from '@/shared/ui/states/loading-state';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

const actionOptions = [
  'AUTH_LOGIN',
  'MONTHLY_FEE_MARKED_PAID',
  'RECEIPT_APPROVED',
  'RECEIPT_REJECTED',
];

export default function AdminAuditLogsPage() {
  const [user, setUser] = useState('');
  const [action, setAction] = useState('');
  const [date, setDate] = useState('');

  const usersQuery = useQuery({
    queryKey: ['users', 'admin', 'audit'],
    queryFn: fetchUsers,
  });

  const logsQuery = useQuery({
    queryKey: ['audit-logs', { user, action, date }],
    queryFn: () =>
      fetchAuditLogs({
        user: user || undefined,
        action: action || undefined,
        date: date || undefined,
      }),
  });

  const users = useMemo(() => usersQuery.data ?? [], [usersQuery.data]);

  return (
    <section className='space-y-4'>
      <div>
        <h1 className='text-xl font-semibold'>Audit Logs</h1>
        <p className='text-sm text-muted-foreground'>Track sensitive actions and security-relevant events.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-sm'>Filters</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-3 sm:grid-cols-3'>
          <SelectInput value={user} onChange={(event) => setUser(event.target.value)}>
            <option value=''>All users</option>
            {users.map((item) => (
              <option key={item.id} value={item.id}>
                {item.email}
              </option>
            ))}
          </SelectInput>

          <SelectInput value={action} onChange={(event) => setAction(event.target.value)}>
            <option value=''>All actions</option>
            {actionOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectInput>

          <input
            type='date'
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className='h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
          />
        </CardContent>
      </Card>

      {logsQuery.isLoading ? <LoadingState label='Loading audit logs...' /> : null}
      {logsQuery.isError ? <ErrorState message='Could not load audit logs right now.' /> : null}

      {!logsQuery.isLoading && !logsQuery.isError && (logsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState title='No logs found' description='No audit records match the current filters.' />
      ) : null}

      {!logsQuery.isLoading && !logsQuery.isError && (logsQuery.data?.length ?? 0) > 0 ? (
        <div className='space-y-3'>
          {logsQuery.data?.map((log) => (
            <Card key={log.id}>
              <CardContent className='space-y-2 pt-4 text-sm'>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <div>
                    <p className='font-semibold'>{log.action}</p>
                    <p className='text-muted-foreground'>
                      {log.entity}
                      {log.entityId ? ` (${log.entityId})` : ''}
                    </p>
                  </div>
                  <span className='text-xs text-muted-foreground'>{formatDateTime(log.createdAt)}</span>
                </div>

                <p>
                  <span className='font-medium'>Actor:</span> {log.actor?.email ?? 'System'}
                </p>

                {log.payload ? (
                  <pre className='overflow-auto rounded-md border bg-muted/30 p-2 text-xs'>
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </section>
  );
}

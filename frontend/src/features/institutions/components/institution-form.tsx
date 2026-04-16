'use client';

import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { InstitutionStatus } from '@/features/institutions/api/institutions';
import { institutionSchema, type InstitutionSchema } from '@/features/institutions/schemas/institution-schema';
import { FormField, SelectInput } from '@/shared/ui/form/form-field';

type InstitutionFormProps = {
  initialValues?: {
    name: string;
    status: InstitutionStatus;
    notes?: string | null;
  };
  submitting?: boolean;
  onSubmit: (values: InstitutionSchema) => Promise<void>;
  submitLabel: string;
};

export function InstitutionForm({ initialValues, submitting, onSubmit, submitLabel }: InstitutionFormProps) {
  const defaultValues = useMemo(
    () => ({
      name: initialValues?.name ?? '',
      status: initialValues?.status ?? 'ACTIVE',
      notes: initialValues?.notes ?? '',
    }),
    [initialValues],
  );

  const form = useForm<InstitutionSchema>({
    resolver: zodResolver(institutionSchema),
    values: defaultValues,
  });

  return (
    <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
      <FormField id='name' label='Institution name' required error={form.formState.errors.name?.message}>
        <Input id='name' {...form.register('name')} />
      </FormField>

      <FormField id='status' label='Status' required error={form.formState.errors.status?.message}>
        <SelectInput id='status' {...form.register('status')}>
          <option value='ACTIVE'>Active</option>
          <option value='INACTIVE'>Inactive</option>
        </SelectInput>
      </FormField>

      <FormField id='notes' label='Notes' error={form.formState.errors.notes?.message}>
        <textarea
          id='notes'
          rows={4}
          className='w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
          {...form.register('notes')}
        />
      </FormField>

      <Button type='submit' disabled={submitting}>
        {submitting ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}

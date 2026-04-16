'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InstitutionSelect } from '@/features/institutions/components/institution-select';
import { type Passenger, updatePassenger } from '@/features/passengers/api/passengers';
import { passengerFormSchema, type PassengerFormSchema } from '@/features/passengers/schemas/passenger-schema';
import { FormField, SelectInput } from '@/shared/ui/form/form-field';
import { statusLabelMap } from '@/shared/ui/form/status-labels';
import { toast } from '@/shared/ui/toast';

export function PassengerEditForm({ passenger }: { passenger: Passenger }) {
  const router = useRouter();
  const [institutionId, setInstitutionId] = useState(passenger.institutionId);

  const form = useForm<PassengerFormSchema>({
    resolver: zodResolver(passengerFormSchema),
    values: {
      fullName: passenger.fullName,
      phone: passenger.phone,
      email: passenger.email ?? '',
      institutionId: passenger.institutionId,
      course: passenger.course,
      shift: passenger.shift,
      boardingPoint: passenger.boardingPoint,
      notes: passenger.notes ?? '',
      status: passenger.status,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: PassengerFormSchema) =>
      updatePassenger(passenger.id, {
        ...values,
        email: values.email || undefined,
        notes: values.notes || undefined,
      }),
    onSuccess: () => {
      toast.success('Passenger updated successfully.');
      router.push('/admin/passengers');
    },
    onError: () => {
      toast.error('Could not update passenger.');
    },
  });

  return (
    <form className='space-y-4' onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
      <FormField id='fullName' label='Name' required error={form.formState.errors.fullName?.message}>
        <Input id='fullName' {...form.register('fullName')} />
      </FormField>
      <FormField id='phone' label='Phone' required error={form.formState.errors.phone?.message}>
        <Input id='phone' {...form.register('phone')} />
      </FormField>
      <FormField id='email' label='Email (optional)' error={form.formState.errors.email?.message}>
        <Input id='email' type='email' {...form.register('email')} />
      </FormField>
      <FormField id='institutionId' label='Institution' required error={form.formState.errors.institutionId?.message}>
        <InstitutionSelect
          id='institutionId'
          value={institutionId}
          onChange={(value) => {
            setInstitutionId(value);
            form.setValue('institutionId', value, { shouldValidate: true });
          }}
        />
      </FormField>
      <FormField id='course' label='Course' required error={form.formState.errors.course?.message}>
        <Input id='course' {...form.register('course')} />
      </FormField>
      <FormField id='shift' label='Shift' required error={form.formState.errors.shift?.message}>
        <Input id='shift' {...form.register('shift')} />
      </FormField>
      <FormField id='boardingPoint' label='Boarding point' required error={form.formState.errors.boardingPoint?.message}>
        <Input id='boardingPoint' {...form.register('boardingPoint')} />
      </FormField>
      <FormField id='status' label='Status' required error={form.formState.errors.status?.message}>
        <SelectInput id='status' {...form.register('status')}>
          <option value='PENDING'>{statusLabelMap.PENDING}</option>
          <option value='PAID'>{statusLabelMap.PAID}</option>
          <option value='OVERDUE'>{statusLabelMap.OVERDUE}</option>
        </SelectInput>
      </FormField>
      <FormField id='notes' label='Notes (optional)' error={form.formState.errors.notes?.message}>
        <textarea
          id='notes'
          rows={4}
          className='w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
          {...form.register('notes')}
        />
      </FormField>
      <Button type='submit' disabled={mutation.isPending}>
        {mutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
        Save changes
      </Button>
    </form>
  );
}

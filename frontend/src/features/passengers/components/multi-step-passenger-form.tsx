'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { fetchInstitutions } from '@/features/institutions/api/institutions';
import { InstitutionSelect } from '@/features/institutions/components/institution-select';
import { createPassenger } from '@/features/passengers/api/passengers';
import {
  passengerAcademicSchema,
  passengerComplementarySchema,
  passengerFormSchema,
  passengerPersonalSchema,
  type PassengerFormSchema,
} from '@/features/passengers/schemas/passenger-schema';
import { FormField, SelectInput } from '@/shared/ui/form/form-field';
import { statusLabelMap } from '@/shared/ui/form/status-labels';
import { toast } from '@/shared/ui/toast';

const steps = [
  { key: 'personal', label: 'Personal data' },
  { key: 'academic', label: 'Academic data' },
  { key: 'complementary', label: 'Complementary data' },
] as const;

const fieldNamesByStep: Array<Array<keyof PassengerFormSchema>> = [
  ['fullName', 'phone', 'email'],
  ['institutionId', 'course', 'shift'],
  ['boardingPoint', 'notes', 'status'],
];

export function MultiStepPassengerForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [institutionIdValue, setInstitutionIdValue] = useState('');

  const { data: institutions = [] } = useQuery({
    queryKey: ['institutions', 'options'],
    queryFn: fetchInstitutions,
  });

  const form = useForm<PassengerFormSchema>({
    resolver: zodResolver(passengerFormSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      institutionId: '',
      course: '',
      shift: '',
      boardingPoint: '',
      notes: '',
      status: 'PENDING',
    },
    mode: 'onChange',
  });

  const createMutation = useMutation({
    mutationFn: createPassenger,
    onSuccess: () => {
      toast.success('Passenger registered successfully.');
      router.push('/admin/passengers');
    },
    onError: () => {
      toast.error('Could not register passenger. Please review the form.');
    },
  });

  const reviewData = form.getValues();

  const nextStep = async () => {
    const fields = fieldNamesByStep[currentStep];
    const isValid = await form.trigger(fields);

    if (!isValid) {
      return;
    }

    if (currentStep === 0) {
      const parsed = passengerPersonalSchema.safeParse(form.getValues());
      if (!parsed.success) {
        return;
      }
    }

    if (currentStep === 1) {
      const parsed = passengerAcademicSchema.safeParse(form.getValues());
      if (!parsed.success) {
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const submit = form.handleSubmit((values) => {
    const parsed = passengerComplementarySchema.safeParse(values);
    if (!parsed.success) {
      return;
    }

    createMutation.mutate({
      ...values,
      email: values.email || undefined,
      notes: values.notes || undefined,
    });
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Passenger Registration</CardTitle>
        <CardDescription>Complete the three steps to create a passenger profile.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid gap-2 sm:grid-cols-3'>
          {steps.map((step, index) => (
            <div
              key={step.key}
              className={`rounded-lg border p-3 text-sm ${
                index === currentStep
                  ? 'border-primary bg-primary/5 font-medium'
                  : index < currentStep
                    ? 'border-chart-3 bg-chart-3/10'
                    : 'border-border bg-muted/30 text-muted-foreground'
              }`}
            >
              Step {index + 1}: {step.label}
            </div>
          ))}
        </div>

        <form onSubmit={submit} className='space-y-4'>
          {currentStep === 0 ? (
            <>
              <FormField id='fullName' label='Name' required error={form.formState.errors.fullName?.message}>
                <Input id='fullName' {...form.register('fullName')} />
              </FormField>
              <FormField id='phone' label='Phone' required error={form.formState.errors.phone?.message}>
                <Input id='phone' {...form.register('phone')} />
              </FormField>
              <FormField id='email' label='Email (optional)' error={form.formState.errors.email?.message}>
                <Input id='email' type='email' {...form.register('email')} />
              </FormField>
            </>
          ) : null}

          {currentStep === 1 ? (
            <>
              <FormField
                id='institutionId'
                label='Institution'
                required
                error={form.formState.errors.institutionId?.message}
              >
                <InstitutionSelect
                  id='institutionId'
                  value={institutionIdValue}
                  onChange={(value) => {
                    setInstitutionIdValue(value);
                    form.setValue('institutionId', value, {
                      shouldValidate: true,
                    });
                  }}
                />
              </FormField>
              <FormField id='course' label='Course' required error={form.formState.errors.course?.message}>
                <Input id='course' {...form.register('course')} />
              </FormField>
              <FormField id='shift' label='Shift' required error={form.formState.errors.shift?.message}>
                <Input id='shift' {...form.register('shift')} />
              </FormField>
            </>
          ) : null}

          {currentStep === 2 ? (
            <>
              <FormField
                id='boardingPoint'
                label='Boarding point'
                required
                error={form.formState.errors.boardingPoint?.message}
              >
                <Input id='boardingPoint' {...form.register('boardingPoint')} />
              </FormField>
              <FormField id='notes' label='Notes (optional)' error={form.formState.errors.notes?.message}>
                <textarea
                  id='notes'
                  rows={4}
                  className='w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
                  {...form.register('notes')}
                />
              </FormField>
              <FormField id='status' label='Current status' required error={form.formState.errors.status?.message}>
                <SelectInput id='status' {...form.register('status')}>
                  <option value='PENDING'>{statusLabelMap.PENDING}</option>
                  <option value='PAID'>{statusLabelMap.PAID}</option>
                  <option value='OVERDUE'>{statusLabelMap.OVERDUE}</option>
                </SelectInput>
              </FormField>

              <div className='rounded-lg border bg-muted/30 p-4 text-sm'>
                <p className='mb-2 font-medium'>Final review</p>
                <ul className='space-y-1 text-muted-foreground'>
                  <li>Name: {reviewData.fullName || '-'}</li>
                  <li>Phone: {reviewData.phone || '-'}</li>
                  <li>Email: {reviewData.email || '-'}</li>
                  <li>
                    Institution:{' '}
                    {institutions.find((item) => item.id === reviewData.institutionId)?.name || '-'}
                  </li>
                  <li>Course: {reviewData.course || '-'}</li>
                  <li>Shift: {reviewData.shift || '-'}</li>
                  <li>Boarding point: {reviewData.boardingPoint || '-'}</li>
                  <li>Status: {statusLabelMap[reviewData.status]}</li>
                </ul>
              </div>
            </>
          ) : null}

          <div className='flex flex-wrap gap-2 pt-2'>
            <Button type='button' variant='outline' onClick={previousStep} disabled={currentStep === 0}>
              Back
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button type='button' onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type='submit' disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
                Submit
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

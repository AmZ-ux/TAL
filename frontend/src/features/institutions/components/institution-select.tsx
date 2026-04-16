'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchInstitutions } from '@/features/institutions/api/institutions';
import { SelectInput } from '@/shared/ui/form/form-field';

type InstitutionSelectProps = {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  includeAllOption?: boolean;
  disabled?: boolean;
};

export function InstitutionSelect({
  id,
  value,
  onChange,
  includeAllOption = false,
  disabled,
}: InstitutionSelectProps) {
  const { data = [], isLoading } = useQuery({
    queryKey: ['institutions', 'options'],
    queryFn: fetchInstitutions,
  });

  return (
    <SelectInput
      id={id}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled || isLoading}
    >
      {includeAllOption ? <option value=''>All institutions</option> : <option value=''>Select institution</option>}
      {data.map((institution) => (
        <option key={institution.id} value={institution.id}>
          {institution.name}
        </option>
      ))}
    </SelectInput>
  );
}

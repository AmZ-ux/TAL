import { cn } from '@/lib/utils';

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
};

export function FormField({ id, label, error, hint, required, children }: FormFieldProps) {
  return (
    <div className='space-y-2'>
      <label htmlFor={id} className='text-sm font-medium'>
        {label}
        {required ? <span className='ml-1 text-destructive'>*</span> : null}
      </label>
      {children}
      {error ? <p className='text-xs text-destructive'>{error}</p> : null}
      {!error && hint ? <p className='text-xs text-muted-foreground'>{hint}</p> : null}
    </div>
  );
}

export function SelectInput(props: React.ComponentProps<'select'>) {
  return (
    <select
      {...props}
      className={cn(
        'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
        props.className,
      )}
    />
  );
}

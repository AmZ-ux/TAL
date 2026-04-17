export function formatReferenceMonth(referenceMonth: string) {
  const [year, month] = referenceMonth.split('-');
  if (!year || !month) {
    return referenceMonth;
  }

  return `${month}/${year}`;
}

export function formatCurrency(value: string | number) {
  const amount = typeof value === 'string' ? Number(value) : value;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number.isNaN(amount) ? 0 : amount);
}

export function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateIso));
}

export function compareByReferenceMonth(a: string, b: string) {
  return a.localeCompare(b);
}

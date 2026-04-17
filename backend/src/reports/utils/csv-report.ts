type CsvRow = {
  passenger: string;
  amount: string;
  status: string;
  dueDate: string;
};

function escapeCsvValue(value: string) {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildMonthlyCsvReport(rows: CsvRow[]) {
  const header = ['passenger', 'amount', 'status', 'due_date'];
  const lines = [
    header.join(','),
    ...rows.map((row) =>
      [
        escapeCsvValue(row.passenger),
        escapeCsvValue(row.amount),
        escapeCsvValue(row.status),
        escapeCsvValue(row.dueDate),
      ].join(','),
    ),
  ];

  return `${lines.join('\n')}\n`;
}

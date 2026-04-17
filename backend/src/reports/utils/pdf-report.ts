type ReportRow = {
  passenger: string;
  amount: string;
  status: string;
  dueDate: string;
};

type MonthlyPdfReportInput = {
  generatedAt: string;
  monthFilter: string;
  totalRecords: number;
  totalAmount: string;
  paidAmount: string;
  pendingAmount: string;
  overdueAmount: string;
  rows: ReportRow[];
};

function escapePdfText(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}

export function buildMonthlyPdfReport(input: MonthlyPdfReportInput) {
  const lines: string[] = [
    'Transportation Monthly Report',
    `Generated at: ${input.generatedAt}`,
    `Month filter: ${input.monthFilter}`,
    `Total records: ${input.totalRecords}`,
    `Total amount: ${input.totalAmount}`,
    `Paid amount: ${input.paidAmount}`,
    `Pending amount: ${input.pendingAmount}`,
    `Overdue amount: ${input.overdueAmount}`,
    '',
    'Passenger | Amount | Status | Due date',
    '------------------------------------------------------------',
  ];

  for (const row of input.rows) {
    lines.push(
      `${truncate(row.passenger, 26)} | ${row.amount} | ${row.status} | ${row.dueDate}`,
    );
  }

  if (input.rows.length === 0) {
    lines.push('No data available for this filter.');
  }

  const textCommands = lines
    .map(
      (line, index) =>
        `1 0 0 1 40 ${810 - index * 14} Tm (${escapePdfText(line)}) Tj`,
    )
    .join('\n');

  const stream = `BT\n/F1 11 Tf\n${textCommands}\nET`;

  const objects: string[] = [];
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  objects.push(
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
  );
  objects.push('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  objects.push(
    `5 0 obj << /Length ${Buffer.byteLength(stream, 'utf8')} >> stream\n${stream}\nendstream endobj`,
  );

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${object}\n`;
  }

  const xrefPosition = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefPosition}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}

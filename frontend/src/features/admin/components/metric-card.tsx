import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MetricCardProps = {
  title: string;
  value: number;
  tone?: 'default' | 'success' | 'warning' | 'danger';
};

const toneClassMap = {
  default: '',
  success: 'text-chart-3',
  warning: 'text-chart-5',
  danger: 'text-destructive',
};

export function MetricCard({ title, value, tone = 'default' }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm text-muted-foreground'>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-semibold ${toneClassMap[tone]}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

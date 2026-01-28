import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  subtitle?: string;
  highlight?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  trend,
  trendValue,
  icon,
  subtitle,
  highlight = false,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        'card-gradient glow-border transition-all duration-300 hover:scale-[1.02]',
        highlight && 'border-status-critical/50',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn(
              'text-2xl font-bold tracking-tight',
              highlight && 'text-status-critical'
            )}>
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {icon && (
            <div className="rounded-lg bg-secondary/50 p-2">
              {icon}
            </div>
          )}
        </div>
        
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            {trend === 'up' && (
              <TrendingUp className="h-4 w-4 text-status-healthy" />
            )}
            {trend === 'down' && (
              <TrendingDown className="h-4 w-4 text-status-critical" />
            )}
            {trend === 'neutral' && (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
            {trendValue && (
              <span className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-status-healthy',
                trend === 'down' && 'text-status-critical',
                trend === 'neutral' && 'text-muted-foreground'
              )}>
                {trendValue}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

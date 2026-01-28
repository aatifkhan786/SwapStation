import { cn } from '@/lib/utils';
import { StationStatus } from '@/lib/mock-data';

interface StatusPillProps {
  status: StationStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

const statusConfig: Record<StationStatus, { label: string; className: string; dotClassName: string }> = {
  healthy: {
    label: 'Healthy',
    className: 'bg-status-healthy/20 text-status-healthy border-status-healthy/30',
    dotClassName: 'bg-status-healthy',
  },
  attention: {
    label: 'Attention',
    className: 'bg-status-attention/20 text-status-attention border-status-attention/30',
    dotClassName: 'bg-status-attention',
  },
  risk: {
    label: 'Risk',
    className: 'bg-status-risk/20 text-status-risk border-status-risk/30',
    dotClassName: 'bg-status-risk',
  },
  critical: {
    label: 'Critical',
    className: 'bg-status-critical/20 text-status-critical border-status-critical/30',
    dotClassName: 'bg-status-critical status-pulse',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function StatusPill({ status, size = 'md', showDot = true, className }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        config.className,
        sizeConfig[size],
        className
      )}
    >
      {showDot && (
        <span className={cn('h-2 w-2 rounded-full', config.dotClassName)} />
      )}
      {config.label}
    </span>
  );
}

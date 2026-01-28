import { cn } from '@/lib/utils';
import { AlertPriority } from '@/lib/mock-data';

interface PriorityBadgeProps {
  priority: AlertPriority;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const priorityConfig: Record<AlertPriority, { className: string }> = {
  P0: {
    className: 'bg-priority-p0 text-white border-priority-p0',
  },
  P1: {
    className: 'bg-priority-p1 text-white border-priority-p1',
  },
  P2: {
    className: 'bg-priority-p2 text-black border-priority-p2',
  },
  P3: {
    className: 'bg-priority-p3 text-white border-priority-p3',
  },
};

const sizeConfig = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2 py-0.5',
  lg: 'text-sm px-2.5 py-1',
};

export function PriorityBadge({ priority, size = 'md', className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded font-bold border',
        config.className,
        sizeConfig[size],
        priority === 'P0' && 'status-pulse',
        className
      )}
    >
      {priority}
    </span>
  );
}

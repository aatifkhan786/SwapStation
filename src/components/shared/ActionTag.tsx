import { cn } from '@/lib/utils';
import { ActionType } from '@/lib/mock-data';
import { 
  Navigation, 
  Wrench, 
  RefreshCw, 
  AlertTriangle, 
  Eye 
} from 'lucide-react';

interface ActionTagProps {
  action: ActionType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const actionConfig: Record<ActionType, { 
  label: string; 
  icon: React.ElementType; 
  className: string 
}> = {
  reroute: {
    label: 'REROUTE',
    icon: Navigation,
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  ticket: {
    label: 'TICKET',
    icon: Wrench,
    className: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  rebalance: {
    label: 'REBALANCE',
    icon: RefreshCw,
    className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  escalate: {
    label: 'ESCALATE',
    icon: AlertTriangle,
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  monitor: {
    label: 'MONITOR',
    icon: Eye,
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

const iconSizeConfig = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

export function ActionTag({ action, size = 'md', className }: ActionTagProps) {
  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-bold uppercase tracking-wider',
        config.className,
        sizeConfig[size],
        className
      )}
    >
      <Icon className={iconSizeConfig[size]} />
      {config.label}
    </span>
  );
}

import { cn } from '@/lib/utils';
import { RiskType } from '@/lib/mock-data';
import { 
  Car, 
  Battery, 
  Wrench, 
  AlertTriangle, 
  Activity 
} from 'lucide-react';

interface RiskTypeIconProps {
  riskType: RiskType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const riskConfig: Record<RiskType, { 
  label: string; 
  icon: React.ElementType; 
  className: string 
}> = {
  congestion: {
    label: 'Congestion',
    icon: Car,
    className: 'text-status-attention',
  },
  stockout: {
    label: 'Stockout',
    icon: Battery,
    className: 'text-status-risk',
  },
  charger_fault: {
    label: 'Charger Fault',
    icon: Wrench,
    className: 'text-status-risk',
  },
  outage: {
    label: 'Outage',
    icon: AlertTriangle,
    className: 'text-status-critical',
  },
  error_spike: {
    label: 'Error Spike',
    icon: Activity,
    className: 'text-status-attention',
  },
};

const sizeConfig = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function RiskTypeIcon({ riskType, size = 'md', showLabel = false, className }: RiskTypeIconProps) {
  const config = riskConfig[riskType];
  const Icon = config.icon;

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Icon className={cn(sizeConfig[size], config.className)} />
      {showLabel && (
        <span className={cn('text-sm', config.className)}>{config.label}</span>
      )}
    </span>
  );
}

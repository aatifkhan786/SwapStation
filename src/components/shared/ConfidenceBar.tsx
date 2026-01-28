import { cn } from '@/lib/utils';

interface ConfidenceBarProps {
  score: number; // 0-1
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ConfidenceBar({ 
  score, 
  showLabel = true, 
  size = 'md',
  className 
}: ConfidenceBarProps) {
  const percentage = Math.round(score * 100);
  
  const getColor = () => {
    if (percentage >= 80) return 'bg-status-healthy';
    if (percentage >= 60) return 'bg-status-attention';
    if (percentage >= 40) return 'bg-status-risk';
    return 'bg-status-critical';
  };

  const heightConfig = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'flex-1 rounded-full bg-secondary/50 overflow-hidden',
        heightConfig[size]
      )}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground min-w-[3ch]">
          {percentage}%
        </span>
      )}
    </div>
  );
}

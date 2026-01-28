import { cn } from '@/lib/utils';
import { Station, StationMetrics } from '@/lib/mock-data';
import { StatusPill } from './StatusPill';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Battery, Clock, Users } from 'lucide-react';

interface StationCardProps {
  station: Station;
  metrics?: StationMetrics;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function StationCard({
  station,
  metrics,
  compact = false,
  selected = false,
  onClick,
  className,
}: StationCardProps) {
  return (
    <Card
      className={cn(
        'card-gradient transition-all duration-300 cursor-pointer',
        selected ? 'glow-border border-primary' : 'border-border hover:border-primary/50',
        onClick && 'hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className={cn(
                'font-semibold truncate',
                compact ? 'text-sm' : 'text-base'
              )}>
                {station.station_name}
              </h3>
              <StatusPill status={station.status} size="sm" />
            </div>
            
            <div className="mt-1 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-xs">{station.city}</span>
              {station.distance && (
                <>
                  <span className="text-xs">•</span>
                  <span className="text-xs">{station.distance} km</span>
                </>
              )}
            </div>
          </div>
        </div>

        {metrics && !compact && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" />
                <span className="text-xs">Queue</span>
              </div>
              <p className="font-semibold">{metrics.queue_level}</p>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Battery className="h-3 w-3" />
                <span className="text-xs">Available</span>
              </div>
              <p className="font-semibold">{metrics.charged_inventory}</p>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Wait</span>
              </div>
              <p className="font-semibold">~{Math.round(metrics.queue_level * 2.5)} min</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

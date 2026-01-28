import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { 
  mockStations, 
  mockNotifications, 
  generateMockMetrics,
  simulateMetricChange,
  Station,
  StationMetrics,
  Notification
} from '@/lib/mock-data';
import { StationCard, StatusPill } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Navigation, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Battery, 
  Users,
  ExternalLink,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DriverDashboard() {
  const [currentStation, setCurrentStation] = useState<Station>(mockStations[0]);
  const [currentMetrics, setCurrentMetrics] = useState<StationMetrics>(
    generateMockMetrics(currentStation.id)
  );
  const [nearbyStations, setNearbyStations] = useState<Station[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Filter driver notifications and nearby stations
  useEffect(() => {
    const driverNotifs = mockNotifications
      .filter(n => n.target_role === 'driver')
      .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
    setNotifications(driverNotifs);

    const nearby = mockStations
      .filter(s => s.id !== currentStation.id && s.city === currentStation.city)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 5);
    setNearbyStations(nearby);
  }, [currentStation]);

  // Simulate live metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetrics(prev => simulateMetricChange(prev));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const hasActiveReroute = currentStation.status === 'critical' || currentStation.status === 'risk';
  const bestAlternative = nearbyStations.find(s => s.status === 'healthy');

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Reroute Alert Banner */}
      {hasActiveReroute && bestAlternative && (
        <Card className="border-status-attention bg-status-attention/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-status-attention/20 p-2">
                <AlertTriangle className="h-5 w-5 text-status-attention" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-status-attention">
                  Reroute Recommended
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentStation.station_name} is {currentStation.status === 'critical' ? 'offline' : 'congested'}. 
                  Head to <span className="font-medium text-foreground">{bestAlternative.station_name}</span> ({bestAlternative.distance} km)
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {currentStation.status === 'critical' ? 'Station Offline' : 'High Queue'}
                  </Badge>
                </div>
              </div>
              <Button size="sm" className="shrink-0">
                <ExternalLink className="h-4 w-4 mr-1" />
                Navigate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Station Card (Hero) */}
      <Card className="card-gradient glow-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">My Current Station</CardTitle>
            <StatusPill status={currentStation.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{currentStation.station_name}</h2>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{currentStation.city} • {currentStation.distance} km away</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Est. Wait</span>
              </div>
              <p className={cn(
                'text-xl font-bold',
                currentMetrics.queue_level > 8 && 'text-status-attention'
              )}>
                ~{Math.round(currentMetrics.queue_level * 2.5)} min
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Battery className="h-4 w-4" />
                <span className="text-xs">Available</span>
              </div>
              <p className={cn(
                'text-xl font-bold',
                currentMetrics.charged_inventory < 10 && 'text-status-risk'
              )}>
                {currentMetrics.charged_inventory}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-xs">In Queue</span>
              </div>
              <p className="text-xl font-bold">{currentMetrics.queue_level}</p>
            </div>
          </div>

          <Button className="w-full" size="lg">
            <Navigation className="h-4 w-4 mr-2" />
            Navigate to Station
          </Button>
        </CardContent>
      </Card>

      {/* Nearby Stations */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Nearby Stations
        </h3>
        <div className="space-y-2">
          {nearbyStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              compact
              onClick={() => setCurrentStation(station)}
            />
          ))}
        </div>
      </div>

      {/* Notification History */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Recent Notifications
        </h3>
        <Card className="card-gradient">
          <ScrollArea className="h-[300px]">
            <div className="p-4 space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={cn(
                    'p-3 rounded-lg border',
                    notif.is_read ? 'bg-secondary/30 border-border' : 'bg-primary/5 border-primary/20'
                  )}
                >
                  <p className="text-sm">{notif.message_text}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {notif.channel.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notif.sent_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
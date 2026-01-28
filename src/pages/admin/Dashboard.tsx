import { useState, useEffect } from 'react';
import { 
  mockStations, 
  mockAlerts, 
  mockRecommendations,
  mockTickets,
  generateMockMetrics,
  calculateKPIs,
  simulateMetricChange,
  StationMetrics,
  Recommendation,
  DecisionStatus
} from '@/lib/mock-data';
import { 
  MetricCard, 
  PriorityBadge, 
  ActionTag, 
  ConfidenceBar,
  RiskTypeIcon,
  StatusPill
} from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  AlertTriangle, 
  Users, 
  Activity, 
  Bell,
  Lightbulb,
  Check,
  Clock,
  X,
  MapPin,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<StationMetrics[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const { toast } = useToast();

  // Initialize metrics for all stations
  useEffect(() => {
    const initialMetrics = mockStations.map(s => generateMockMetrics(s.id));
    setMetrics(initialMetrics);
  }, []);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(m => simulateMetricChange(m)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const kpis = calculateKPIs(mockStations, mockAlerts, metrics);
  
  const pendingRecommendations = recommendations.filter(r => r.decision_status === 'pending');
  const topRecommendations = pendingRecommendations
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, 3);

  const handleDecision = (recId: string, decision: DecisionStatus) => {
    setRecommendations(prev => prev.map(r => 
      r.id === recId ? { ...r, decision_status: decision } : r
    ));
    
    const action = decision === 'approved' ? 'approved' : 
                   decision === 'rejected' ? 'rejected' : 'snoozed';
    
    toast({
      title: `Recommendation ${action}`,
      description: decision === 'approved' 
        ? 'Action has been initiated and notifications sent.'
        : decision === 'snoozed'
        ? 'Recommendation will resurface in 1 hour.'
        : 'Recommendation has been dismissed.',
    });
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Stations"
          value={kpis.totalStations}
          subtitle={`Jakarta: ${kpis.jakartaCount} • Surabaya: ${kpis.surabayaCount}`}
          icon={<Building2 className="h-5 w-5 text-primary" />}
        />
        <MetricCard
          label="Stations at Risk"
          value={kpis.stationsAtRisk}
          highlight={kpis.stationsAtRisk > 0}
          trend={kpis.stationsAtRisk > 2 ? 'down' : 'neutral'}
          icon={<AlertTriangle className="h-5 w-5 text-status-risk" />}
        />
        <MetricCard
          label="Avg Queue Level"
          value={kpis.avgQueueLevel.toFixed(1)}
          trend={kpis.avgQueueLevel > 6 ? 'down' : 'up'}
          trendValue={kpis.avgQueueLevel > 6 ? '+12% from avg' : '-8% from avg'}
          icon={<Users className="h-5 w-5 text-status-attention" />}
        />
        <MetricCard
          label="Fleet Uptime"
          value={`${kpis.avgUptime.toFixed(1)}%`}
          trend={kpis.avgUptime > 95 ? 'up' : 'down'}
          trendValue={kpis.avgUptime > 95 ? 'Healthy' : 'Below target'}
          icon={<Activity className="h-5 w-5 text-status-healthy" />}
        />
        <MetricCard
          label="Active Alerts"
          value={kpis.activeAlerts}
          subtitle={kpis.p0Alerts > 0 ? `${kpis.p0Alerts} P0 critical` : 'No P0 alerts'}
          highlight={kpis.p0Alerts > 0}
          icon={<Bell className="h-5 w-5 text-status-critical" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Actions Now */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Top Actions Now
            </h2>
            <Badge variant="outline" className="text-xs">
              {pendingRecommendations.length} pending
            </Badge>
          </div>

          <div className="grid gap-4">
            {topRecommendations.map((rec, index) => (
              <Card 
                key={rec.id} 
                className={cn(
                  'card-gradient transition-all',
                  index === 0 && 'glow-border border-primary'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ActionTag action={rec.action_type} />
                        <span className="font-semibold">{rec.station_name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium text-foreground">Why: </span>
                        {rec.why_text}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium text-status-healthy">Impact: </span>
                        {rec.impact_text}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex-1 max-w-[200px]">
                          <ConfidenceBar score={rec.confidence_score} size="sm" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {getTimeSince(rec.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-status-healthy hover:bg-status-healthy/90"
                        onClick={() => handleDecision(rec.id, 'approved')}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDecision(rec.id, 'snoozed')}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-muted-foreground hover:text-status-critical"
                        onClick={() => handleDecision(rec.id, 'rejected')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-status-critical" />
            Active Alerts
          </h2>
          
          <Card className="card-gradient">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-3">
                {mockAlerts
                  .filter(a => a.status !== 'resolved')
                  .sort((a, b) => {
                    const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'p-3 rounded-lg border',
                        alert.priority === 'P0' && 'bg-status-critical/10 border-status-critical/30',
                        alert.priority === 'P1' && 'bg-status-risk/10 border-status-risk/30',
                        alert.priority === 'P2' && 'bg-status-attention/10 border-status-attention/30',
                        alert.priority === 'P3' && 'bg-secondary border-border'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <RiskTypeIcon riskType={alert.risk_type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {alert.station_name}
                            </span>
                            <PriorityBadge priority={alert.priority} size="sm" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alert.description}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {getTimeSince(alert.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>

      {/* Reroute Scope Policy */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4" />
            Reroute Scope Policy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-status-healthy" />
              <span className="text-sm">Default: 3 km radius</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-status-attention" />
              <span className="text-sm">Expanded: 5 km (no suitable station)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-status-critical" />
              <span className="text-sm">Emergency: 10 km (critical outage)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Station Overview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Station Overview
          </h2>
          <Tabs defaultValue="jakarta" className="w-auto">
            <TabsList>
              <TabsTrigger value="jakarta">Jakarta</TabsTrigger>
              <TabsTrigger value="surabaya">Surabaya</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mockStations.slice(0, 8).map((station) => {
            const stationMetrics = metrics.find(m => m.station_id === station.id);
            return (
              <Card key={station.id} className="card-gradient hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm truncate">{station.station_name}</h4>
                    <StatusPill status={station.status} size="sm" showDot={false} />
                  </div>
                  {stationMetrics && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Queue</span>
                        <p className="font-medium">{stationMetrics.queue_level}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Uptime</span>
                        <p className="font-medium">{stationMetrics.charger_uptime.toFixed(0)}%</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

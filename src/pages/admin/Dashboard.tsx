import { Link } from 'react-router-dom';
import { useAdminStore } from './hooks/useAdminStore';
import { calculateKPIs, Recommendation } from '@/lib/mock-data';
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
import { 
  Building2, AlertTriangle, Users, Activity, Bell, Zap, Check, Clock, X, MapPin, Target 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { OpsAssistant } from './components/OpsAssistant';

export default function AdminDashboard() {
  const { 
    stations, metrics, alerts, recommendations, config, handleRecommendationDecision 
  } = useAdminStore();
  const { toast } = useToast();

  const kpis = calculateKPIs(stations, alerts, metrics);

  const pendingRecommendations = recommendations.filter(r => r.decision_status === 'pending');
  const topRecommendations = pendingRecommendations
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, 3);

  const handleDecision = (recId: string, decision: 'approved' | 'rejected' | 'snoozed') => {
    handleRecommendationDecision(recId, decision);
    toast({
      title: decision === 'approved' ? "Action Approved" : "Action Updated",
      description: `Recommendation has been ${decision}.`,
      variant: decision === 'rejected' ? 'destructive' : 'default'
    });
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          label="Total Stations"
          value={kpis.totalStations}
          subtitle={`Jkt: ${kpis.jakartaCount} • Sby: ${kpis.surabayaCount}`}
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
          label="Avg Queue"
          value={kpis.avgQueueLevel.toFixed(1)}
          trend={kpis.avgQueueLevel > 6 ? 'down' : 'up'}
          icon={<Users className="h-5 w-5 text-status-attention" />}
        />
        <MetricCard
          label="Fleet Uptime"
          value={`${kpis.avgUptime.toFixed(1)}%`}
          trend={kpis.avgUptime > 95 ? 'up' : 'down'}
          icon={<Activity className="h-5 w-5 text-status-healthy" />}
        />
        <MetricCard
          label="Active Alerts"
          value={kpis.activeAlerts}
          subtitle={`${kpis.p0Alerts} Critical (P0)`}
          highlight={kpis.p0Alerts > 0}
          icon={<Bell className="h-5 w-5 text-status-critical" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 3 Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Top Actions Now
            </h2>
            <Link to="/admin/recommendations" className="text-sm text-primary hover:underline">View All</Link>
          </div>

          <div className="grid gap-4">
            {topRecommendations.map((rec, index) => (
              <Card key={rec.id} className={cn('card-gradient transition-all', index === 0 && 'glow-border border-primary')}>
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
                        <span className="font-medium text-foreground">Why: </span>{rec.why_text}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <span className="font-medium text-status-healthy">Impact: </span>{rec.impact_text}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex-1 max-w-[200px]">
                          <ConfidenceBar score={rec.confidence_score} size="sm" />
                        </div>
                        <span className="text-xs text-muted-foreground">{getTimeSince(rec.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-status-healthy hover:bg-status-healthy/90" onClick={() => handleDecision(rec.id, 'approved')}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDecision(rec.id, 'snoozed')}>
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDecision(rec.id, 'rejected')}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {topRecommendations.length === 0 && (
              <div className="text-center p-8 text-muted-foreground border rounded-lg border-dashed">
                All clear! No pending recommendations.
              </div>
            )}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-status-critical" />
              Active Alerts
            </h2>
            <Link to="/admin/alerts" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          <Card className="card-gradient">
            <ScrollArea className="h-[400px]">
              <div className="p-4 space-y-3">
                {alerts.filter(a => a.status !== 'resolved').slice(0, 6).map((alert) => (
                  <div key={alert.id} className="p-3 rounded-lg border bg-background/50">
                    <div className="flex items-start gap-2">
                      <RiskTypeIcon riskType={alert.risk_type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{alert.station_name}</span>
                          <PriorityBadge priority={alert.priority} size="sm" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{alert.description}</p>
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
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2"><Target className="h-4 w-4" /> Reroute Scope Policy</div>
            <Link to="/admin/settings" className="text-xs text-primary font-normal hover:underline">Configure</Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-status-healthy" />
              <span className="text-sm">Default: <span className="font-mono font-bold">{config.reroute_radius_default}km</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-status-attention" />
              <span className="text-sm">Fallback: <span className="font-mono font-bold">{config.reroute_radius_fallback}km</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-status-critical" />
              <span className="text-sm">Emergency: <span className="font-mono font-bold">{config.reroute_radius_emergency}km</span></span>
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
          <Button asChild variant="link" className="text-primary p-0">
            <Link to="/admin/city">View All Stations</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stations.slice(0, 8).map((station) => {
            const stationMetrics = metrics.find(m => m.station_id === station.id);
            return (
              <Card key={station.id} className="card-gradient hover:border-primary/50 transition-colors cursor-pointer group">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{station.station_name}</h4>
                    <StatusPill status={station.status} size="sm" showDot={false} />
                  </div>
                  {stationMetrics && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-muted-foreground">Queue</span><p className="font-medium">{stationMetrics.queue_level}</p></div>
                      <div><span className="text-muted-foreground">Uptime</span><p className="font-medium">{stationMetrics.charger_uptime.toFixed(0)}%</p></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <OpsAssistant />
    </div>
  );
}
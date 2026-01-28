import { useState, useEffect } from 'react';
import { 
  mockTickets, 
  mockNotifications,
  mockStations,
  generateMockMetrics,
  Ticket,
  TicketStatus,
  StationMetrics
} from '@/lib/mock-data';
import { PriorityBadge, StatusPill, RiskTypeIcon } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Activity,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusTabs: { value: TicketStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

export default function FieldOpsDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<StationMetrics | null>(null);
  const [activeTab, setActiveTab] = useState<TicketStatus | 'all'>('all');

  // Calculate stats
  const openTickets = tickets.filter(t => t.status !== 'resolved').length;
  const urgentTickets = tickets.filter(t => 
    (t.priority === 'P0' || t.priority === 'P1') && t.status !== 'resolved'
  ).length;
  const resolvedToday = tickets.filter(t => {
    if (!t.resolved_at) return false;
    const today = new Date();
    const resolved = new Date(t.resolved_at);
    return resolved.toDateString() === today.toDateString();
  }).length;

  const filteredTickets = activeTab === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === activeTab);

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setSelectedMetrics(generateMockMetrics(ticket.station_id));
  };

  const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : t.resolved_at
        };
      }
      return t;
    }));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { 
        ...prev, 
        status: newStatus,
        resolved_at: newStatus === 'resolved' ? new Date().toISOString() : prev.resolved_at
      } : null);
    }
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
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-gradient glow-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold">{openTickets}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          'card-gradient',
          urgentTickets > 0 && 'border-status-critical/50'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent (P0/P1)</p>
                <p className={cn(
                  'text-2xl font-bold',
                  urgentTickets > 0 && 'text-status-critical'
                )}>{urgentTickets}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-status-critical/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-status-critical" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-gradient">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-status-healthy">{resolvedToday}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-status-healthy/20 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-status-healthy" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TicketStatus | 'all')}>
            <TabsList className="w-full justify-start">
              {statusTabs.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-3 pr-4">
              {filteredTickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  className={cn(
                    'card-gradient cursor-pointer transition-all',
                    selectedTicket?.id === ticket.id 
                      ? 'glow-border border-primary' 
                      : 'hover:border-primary/50'
                  )}
                  onClick={() => handleSelectTicket(ticket)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <RiskTypeIcon 
                        riskType={ticket.issue_type.toLowerCase().includes('charger') ? 'charger_fault' : 'outage'} 
                        size="lg" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{ticket.station_name}</h4>
                          <PriorityBadge priority={ticket.priority} size="sm" />
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs capitalize',
                              ticket.status === 'resolved' && 'text-status-healthy border-status-healthy',
                              ticket.status === 'in_progress' && 'text-primary border-primary'
                            )}
                          >
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {ticket.issue_type}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ticket.probable_root_cause}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{getTimeSince(ticket.created_at)}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Ticket Detail Panel */}
        <div className="space-y-4">
          {selectedTicket ? (
            <>
              <Card className="card-gradient glow-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Ticket Details</CardTitle>
                    <PriorityBadge priority={selectedTicket.priority} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{selectedTicket.station_name}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">
                        {mockStations.find(s => s.id === selectedTicket.station_id)?.city}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Issue Type</p>
                    <p className="text-sm text-muted-foreground">{selectedTicket.issue_type}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Probable Root Cause</p>
                    <p className="text-sm text-muted-foreground">{selectedTicket.probable_root_cause}</p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedTicket.created_at).toLocaleString()}
                    </p>
                  </div>

                  {selectedTicket.status !== 'resolved' && (
                    <div className="flex gap-2 pt-2">
                      {selectedTicket.status === 'new' && (
                        <Button 
                          className="flex-1"
                          onClick={() => handleUpdateStatus(selectedTicket.id, 'acknowledged')}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {selectedTicket.status === 'acknowledged' && (
                        <Button 
                          className="flex-1"
                          onClick={() => handleUpdateStatus(selectedTicket.id, 'in_progress')}
                        >
                          Start Work
                        </Button>
                      )}
                      {selectedTicket.status === 'in_progress' && (
                        <Button 
                          className="flex-1 bg-status-healthy hover:bg-status-healthy/90"
                          onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  )}

                  {selectedTicket.status === 'resolved' && selectedTicket.resolution_notes && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      <p className="text-sm font-medium">Resolution Notes</p>
                      <p className="text-sm text-muted-foreground">{selectedTicket.resolution_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Station Health Snapshot */}
              {selectedMetrics && (
                <Card className="card-gradient">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Station Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Uptime</p>
                        <p className={cn(
                          'text-lg font-bold',
                          selectedMetrics.charger_uptime < 90 && 'text-status-attention'
                        )}>
                          {selectedMetrics.charger_uptime.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Errors</p>
                        <p className={cn(
                          'text-lg font-bold',
                          selectedMetrics.error_count > 2 && 'text-status-risk'
                        )}>
                          {selectedMetrics.error_count}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Queue</p>
                        <p className="text-lg font-bold">{selectedMetrics.queue_level}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Swap Rate</p>
                        <p className="text-lg font-bold">{selectedMetrics.swap_rate.toFixed(1)}/h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="card-gradient">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a ticket to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

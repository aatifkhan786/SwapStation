import { useState, useMemo } from 'react';
import { useAdminStore } from './hooks/useAdminStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PriorityBadge, RiskTypeIcon } from '@/components/shared';
import { Alert, AlertPriority } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  AlertTriangle, 
  Ticket, 
  Check, 
  Search, 
  Filter, 
  ArrowUpDown,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function Alerts() {
  const { alerts, tickets, escalateAlert, acknowledgeAlert } = useAdminStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'time'>('priority');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string[]>(['P0', 'P1', 'P2', 'P3']);

  const hasExistingTicket = (alert: Alert) => {
    return tickets.some(t => 
      t.station_id === alert.station_id && 
      t.status !== 'resolved' && 
      (t.probable_root_cause === alert.description)
    );
  };

  const handleEscalate = (alert: Alert) => {
    escalateAlert(alert);
    toast({ 
      title: "Alert Escalated", 
      description: `Ticket created for ${alert.station_name}. Field Ops notified.` 
    });
  };

  const handleAck = (id: string) => {
    acknowledgeAlert(id);
    toast({ title: "Alert Acknowledged" });
  };

  const togglePriorityFilter = (priority: string) => {
    setPriorityFilter(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const processedAlerts = useMemo(() => {
    return alerts
      .filter(alert => {
        const matchesSearch = 
          alert.station_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alert.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = 
          statusFilter === 'all' ? true :
          statusFilter === 'active' ? alert.status !== 'resolved' :
          alert.status === 'resolved';

        const matchesPriority = priorityFilter.includes(alert.priority);

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (a.status === 'resolved' && b.status !== 'resolved') return 1;
        if (a.status !== 'resolved' && b.status === 'resolved') return -1;

        if (sortBy === 'priority') {
          const priorityOrder: Record<AlertPriority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [alerts, tickets, searchQuery, sortBy, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="text-status-critical" /> Alert Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor and respond to system-wide anomalies.
          </p>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 bg-secondary/30 px-3 py-2 rounded-lg border text-xs cursor-help">
                <Info className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-2">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-critical animate-pulse"></span> P0 Critical</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-risk"></span> P1 Risk</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-attention"></span> P2 Warn</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>P0: Immediate Outage (Emergency)</p>
              <p>P1: Service Degradation (High Risk)</p>
              <p>P2: Warning / Maintenance Required</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col md:flex-row gap-3 p-1">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stations or issues..."
            className="pl-9 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
          <SelectTrigger className="w-full md:w-[140px] bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-card gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4" />
              Priority
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {['P0', 'P1', 'P2', 'P3'].map((p) => (
              <DropdownMenuCheckboxItem
                key={p}
                checked={priorityFilter.includes(p)}
                onCheckedChange={() => togglePriorityFilter(p)}
              >
                {p}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
          <SelectTrigger className="w-full md:w-[140px] bg-card">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Sort: Severity</SelectItem>
            <SelectItem value="time">Sort: Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {processedAlerts.length === 0 ? (
          <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
            No alerts match your filters.
          </div>
        ) : (
          processedAlerts.map(alert => {
            const isTicketCreated = hasExistingTicket(alert);

            return (
              <Card key={alert.id} className={cn(
                "card-gradient transition-all",
                alert.status === 'resolved' ? 'opacity-60 bg-muted/20' : 'hover:border-primary/50',
                alert.priority === 'P0' && alert.status !== 'resolved' && 'border-status-critical/50'
              )}>
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <RiskTypeIcon riskType={alert.risk_type} size="lg" className="shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-lg">{alert.station_name}</h3>
                        <PriorityBadge priority={alert.priority} />
                        
                        {alert.status === 'resolved' && (
                            <span className="text-xs font-mono bg-green-500/20 text-green-500 px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Resolved
                            </span>
                        )}
                        
                        {isTicketCreated && alert.status !== 'resolved' && (
                           <span className="text-xs font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded flex items-center gap-1">
                              <Ticket className="w-3 h-3" /> Ticket Active
                           </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">{alert.description}</p>
                    </div>
                  </div>

                  {alert.status !== 'resolved' && (
                    <div className="flex gap-2 shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAck(alert.id)}
                        disabled={alert.status === 'acknowledged' || isTicketCreated}
                      >
                        {alert.status === 'acknowledged' || isTicketCreated ? 'Ack\'d' : 'Acknowledge'}
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant={isTicketCreated ? "secondary" : "destructive"}
                        onClick={() => handleEscalate(alert)}
                        disabled={isTicketCreated}
                        className={cn(isTicketCreated && "opacity-70 cursor-not-allowed")}
                      >
                        {isTicketCreated ? (
                          <>
                            <Check className="mr-2 h-4 w-4" /> Ticket Created
                          </>
                        ) : (
                          "Escalate to Ticket"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
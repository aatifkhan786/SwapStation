import { useState, useMemo } from 'react';
import { useAdminStore } from './hooks/useAdminStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PriorityBadge, StatusPill } from '@/components/shared';
import { Ticket, Search, Filter, ArrowUpDown, Info } from 'lucide-react';
import { TicketStatus, AlertPriority } from '@/lib/mock-data';

export default function Tickets() {
  const { tickets } = useAdminStore();

  // --- Local State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'time'>('time');
  const [statusFilters, setStatusFilters] = useState<TicketStatus[]>(['new', 'acknowledged', 'in_progress', 'resolved']);
  const [priorityFilters, setPriorityFilters] = useState<AlertPriority[]>(['P0', 'P1', 'P2', 'P3']);

  const allStatuses: TicketStatus[] = ['new', 'acknowledged', 'in_progress', 'resolved'];
  const allPriorities: AlertPriority[] = ['P0', 'P1', 'P2', 'P3'];

  // --- Helper: Map Ticket Status to Visual Status ---
  const getStatusColor = (status: string) => {
    switch(status) {
        case 'new': return 'risk';
        case 'acknowledged': return 'attention';
        case 'in_progress': return 'attention';
        case 'resolved': return 'healthy';
        default: return 'healthy';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // --- Handlers ---
  const toggleStatusFilter = (status: TicketStatus) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const togglePriorityFilter = (priority: AlertPriority) => {
    setPriorityFilters(prev => 
      prev.includes(priority) 
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  // --- Filter & Sort Logic ---
  const processedTickets = useMemo(() => {
    return tickets
      .filter(t => {
        // 1. Search Filter (ID, Station, Issue)
        const matchesSearch = 
          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.station_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.issue_type.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Status Filter
        const matchesStatus = statusFilters.includes(t.status);

        // 3. Priority Filter
        const matchesPriority = priorityFilters.includes(t.priority);

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        // Always push resolved to bottom if sorting by time, unless explicitly filtering for them
        if (sortBy === 'priority') {
          const priorityOrder: Record<AlertPriority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        } else {
          // Sort by Time (Newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [tickets, searchQuery, statusFilters, priorityFilters, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Maintenance Tickets</h1>
            <p className="text-sm text-muted-foreground">Track field operations and issue resolution.</p>
          </div>
        </div>

        {/* Legend / Info */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 bg-secondary/30 px-3 py-2 rounded-lg border text-xs cursor-help">
                <Info className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-2">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-risk"></span> New</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-attention"></span> In Progress</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-healthy"></span> Resolved</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>New: Assigned but untouched</p>
              <p>In Progress: Ops team is on-site/working</p>
              <p>Resolved: Issue fixed and verified</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-3 p-1">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Ticket ID, Station, or Issue..."
            className="pl-9 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
           {/* Status Filter */}
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-card gap-2 justify-between md:justify-start">
                <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilters.includes(status)}
                  onCheckedChange={() => toggleStatusFilter(status)}
                  className="capitalize"
                >
                  {getStatusLabel(status)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-card gap-2 justify-between md:justify-start">
                <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Priority</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allPriorities.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={priorityFilters.includes(p)}
                  onCheckedChange={() => togglePriorityFilter(p)}
                >
                  {p}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="w-full md:w-[160px] bg-card">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Sort: Newest</SelectItem>
              <SelectItem value="priority">Sort: Severity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Content */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Issue Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Created At</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {processedTickets.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No tickets found matching your filters.
                        </TableCell>
                    </TableRow>
                ) : (
                    processedTickets.map(ticket => (
                    <TableRow key={ticket.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                            {ticket.id}
                        </TableCell>
                        <TableCell className="font-medium">{ticket.station_name}</TableCell>
                        <TableCell>{ticket.issue_type}</TableCell>
                        <TableCell>
                            <PriorityBadge priority={ticket.priority} size="sm" />
                        </TableCell>
                        <TableCell>
                            <StatusPill 
                                status={getStatusColor(ticket.status) as any} 
                                size="sm" 
                                showDot={true} 
                                // Override label to show exact ticket status text
                            />
                            <span className="sr-only">{ticket.status}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleString()}
                        </TableCell>
                    </TableRow>
                    ))
                )}
            </TableBody>
            </Table>
        </div>
      </Card>
    </div>
  );
}
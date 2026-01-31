import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ticket, TicketStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { PriorityBadge, RiskTypeIcon } from "@/components/shared";

export function TicketQueue({ tickets, selectedId, onSelect }: { 
  tickets: Ticket[], 
  selectedId?: string, 
  onSelect: (t: Ticket) => void 
}) {
  const [filter, setFilter] = useState<TicketStatus | 'all'>('all');

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  const getTimeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
      <div className="mb-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
            <TabsTrigger value="in_progress">Active</TabsTrigger>
            <TabsTrigger value="resolved">Done</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 -mr-4 pr-4">
        <div className="space-y-3 pb-4">
          {filtered.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onSelect(ticket)}
              className={cn(
                "group flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer hover:bg-muted/50",
                selectedId === ticket.id 
                  ? "bg-muted border-primary/50 shadow-sm" 
                  : "bg-card border-border"
              )}
            >
              <RiskTypeIcon 
                riskType={ticket.issue_type.toLowerCase().includes('charger') ? 'charger_fault' : 'outage'} 
                size="md" 
              />
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm truncate">{ticket.station_name}</h4>
                  <PriorityBadge priority={ticket.priority} size="sm" />
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {ticket.issue_type}
                </p>
                
                <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {getTimeAgo(ticket.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {ticket.station_id.split('-')[0]}
                  </span>
                </div>
              </div>
              
              <ChevronRight className={cn(
                "h-4 w-4 text-muted-foreground self-center transition-transform",
                selectedId === ticket.id ? "text-primary translate-x-1" : "opacity-0 group-hover:opacity-50"
              )} />
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
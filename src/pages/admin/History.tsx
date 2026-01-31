import { useState } from 'react';
import { useAdminStore } from './hooks/useAdminStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActionTag, ConfidenceBar, StatusPill } from '@/components/shared';
import { Search, History, CheckCircle2, XCircle, Clock, ChevronRight, User, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RecommendationHistory() {
  const { recommendations } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRec, setSelectedRec] = useState<any | null>(null);

  // Filter for history items (not pending)
  const historyItems = recommendations
    .filter(r => r.decision_status !== 'pending')
    .filter(r => r.station_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.handled_at || b.created_at).getTime() - new Date(a.handled_at || a.created_at).getTime());

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved': return <Badge className="bg-green-500/15 text-green-600 hover:bg-green-500/25 border-green-200 gap-1"><CheckCircle2 className="w-3 h-3"/> Approved</Badge>;
      case 'rejected': return <Badge variant="destructive" className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-red-200 gap-1"><XCircle className="w-3 h-3"/> Rejected</Badge>;
      case 'snoozed': return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3"/> Snoozed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Decision Audit Trail</h1>
            <p className="text-sm text-muted-foreground">Immutable record of AI recommendations and human actions.</p>
          </div>
        </div>
        <div className="relative w-72">
           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
           <Input placeholder="Search history..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Decision Time</TableHead>
              <TableHead>Station</TableHead>
              <TableHead>Suggested Action</TableHead>
              <TableHead>AI Confidence</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyItems.map((rec) => (
              <TableRow key={rec.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedRec(rec)}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {new Date(rec.handled_at || rec.created_at).toLocaleString()}
                </TableCell>
                <TableCell className="font-medium">{rec.station_name}</TableCell>
                <TableCell><ActionTag action={rec.action_type} size="sm" /></TableCell>
                <TableCell><ConfidenceBar score={rec.confidence_score} showLabel size="sm" /></TableCell>
                <TableCell>{getStatusBadge(rec.decision_status)}</TableCell>
                <TableCell className="text-xs">{rec.handled_by || 'System'}</TableCell>
                <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={!!selectedRec} onOpenChange={(open) => !open && setSelectedRec(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Decision Record #{selectedRec?.id.slice(-6)}</SheetTitle>
            <SheetDescription>Snapshot of system state at time of decision.</SheetDescription>
          </SheetHeader>
          
          {selectedRec && (
            <div className="space-y-8">
              {/* 1. What the AI Saw */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Server className="w-4 h-4" /> What the AI Saw (Input Signals)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/40 p-3 rounded-lg border">
                     <span className="text-xs text-muted-foreground">Queue Level</span>
                     <div className="text-lg font-bold">{selectedRec.snapshot_metrics?.queue_level ?? 'N/A'}</div>
                  </div>
                  <div className="bg-secondary/40 p-3 rounded-lg border">
                     <span className="text-xs text-muted-foreground">Charger Uptime</span>
                     <div className="text-lg font-bold text-status-healthy">{selectedRec.snapshot_metrics?.charger_uptime ?? 'N/A'}%</div>
                  </div>
                  <div className="bg-secondary/40 p-3 rounded-lg border">
                     <span className="text-xs text-muted-foreground">Alert Context</span>
                     <div className="text-sm font-medium">{selectedRec.why_text}</div>
                  </div>
                  <div className="bg-secondary/40 p-3 rounded-lg border">
                     <span className="text-xs text-muted-foreground">Calculated Confidence</span>
                     <div className="mt-1"><ConfidenceBar score={selectedRec.confidence_score} /></div>
                  </div>
                </div>
              </div>

              {/* 2. The Decision */}
              <div className="space-y-3 relative">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border"></div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2 relative z-10 bg-background pr-2 w-fit">
                  <User className="w-4 h-4" /> The Human Decision
                </h3>
                
                <div className="ml-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Action Taken:</span>
                    {getStatusBadge(selectedRec.decision_status)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Actor:</span>
                    <span className="text-sm font-medium">{selectedRec.handled_by}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Timestamp:</span>
                    <span className="text-sm font-mono">{new Date(selectedRec.handled_at).toLocaleString()}</span>
                  </div>

                  {/* Rejection Specifics */}
                  {selectedRec.decision_status === 'rejected' && (
                    <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md space-y-2">
                       <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                          <XCircle className="w-4 h-4" /> Rejected: {selectedRec.rejection_reason}
                       </div>
                       {selectedRec.rejection_note && (
                         <p className="text-xs text-muted-foreground italic">"{selectedRec.rejection_note}"</p>
                       )}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Downstream Effects */}
              {selectedRec.decision_status === 'approved' && (
                 <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Downstream Effects</h3>
                  <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-md">
                     <ul className="space-y-2 text-sm">
                       {selectedRec.action_type === 'ticket' && (
                         <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> Ticket created automatically</li>
                       )}
                       {selectedRec.action_type === 'reroute' && (
                         <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> Drivers notified via App (Push)</li>
                       )}
                       <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> Logged in System Notifications</li>
                     </ul>
                  </div>
                 </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
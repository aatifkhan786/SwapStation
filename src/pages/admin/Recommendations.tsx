import { useState, useMemo } from 'react';
import { useAdminStore } from './hooks/useAdminStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActionTag, ConfidenceBar } from '@/components/shared';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Check, 
  X, 
  Clock, 
  Lightbulb, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Info,
  Lock,
  Sparkles,
  Loader2
} from 'lucide-react';
import { ActionType } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { SafetyBanner } from './components/SafetyBanner';

export default function Recommendations() {
  const { 
    recommendations, 
    handleRecommendationDecision, 
    behaviorMode, 
    systemStatus,
    generateAIRecommendations, // Import the new action
    isGenerating // Import loading state
  } = useAdminStore();
  const { toast } = useToast();

  // --- Local State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'confidence' | 'time'>('confidence');
  const [actionFilters, setActionFilters] = useState<ActionType[]>(['reroute', 'ticket', 'rebalance', 'escalate', 'monitor']);

  // Rejection Dialog State
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNote, setRejectionNote] = useState('');

  const allActionTypes: ActionType[] = ['reroute', 'ticket', 'rebalance', 'escalate', 'monitor'];

  // --- Handlers ---
  const handleApprove = (id: string) => {
    handleRecommendationDecision(id, 'approved');
    toast({ title: "Recommendation Approved", description: "System actions triggered successfully." });
  };

  const handleSnooze = (id: string) => {
    handleRecommendationDecision(id, 'snoozed');
    toast({ title: "Recommendation Snoozed", description: "It will resurface in 1 hour." });
  };

  const initiateReject = (id: string) => {
    setRejectingId(id);
    setRejectionReason('');
    setRejectionNote('');
  };

  const confirmReject = () => {
    if (!rejectingId) return;
    handleRecommendationDecision(rejectingId, 'rejected', { reason: rejectionReason, note: rejectionNote });
    toast({ title: "Recommendation Rejected", description: "Reason logged in audit trail." });
    setRejectingId(null);
  };

  const toggleActionFilter = (action: ActionType) => {
    setActionFilters(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  const handleRunDiagnostics = async () => {
      toast({ title: "Running AI Diagnostics", description: "Analyzing live telemetry..." });
      await generateAIRecommendations();
      toast({ title: "Analysis Complete", description: "New recommendations added to the queue." });
  };

  const getTimeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  // --- Filter & Sort Logic ---
  const processedRecs = useMemo(() => {
    return recommendations
      .filter(rec => {
        // 1. Core Filter: Pending only
        if (rec.decision_status !== 'pending') return false;

        // 2. GOVERNANCE FILTER: Conservative Mode
        if (behaviorMode === 'conservative' && rec.confidence_score < 0.8) {
            return false;
        }

        // 3. Search Filter
        const matchesSearch = 
          rec.station_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rec.why_text.toLowerCase().includes(searchQuery.toLowerCase());

        // 4. Action Type Filter
        const matchesAction = actionFilters.includes(rec.action_type);

        return matchesSearch && matchesAction;
      })
      .sort((a, b) => {
        if (sortBy === 'confidence') {
          return b.confidence_score - a.confidence_score;
        } else {
          // Sort by Time (Newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [recommendations, searchQuery, sortBy, actionFilters, behaviorMode]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* GLOBAL SAFETY BANNER */}
      <SafetyBanner />

      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
              <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div>
              <h1 className="text-2xl font-bold">AI Recommendations</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Actionable insights from live telemetry.</span>
                {behaviorMode === 'conservative' && (
                    <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded border border-blue-500/20">
                        Mode: Conservative (Filtering low confidence)
                    </span>
                )}
              </div>
          </div>
        </div>

        <div className="flex gap-2">
            {/* NEW AI GENERATION BUTTON */}
            <Button 
                onClick={handleRunDiagnostics} 
                disabled={isGenerating || systemStatus === 'frozen'}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                    </>
                ) : (
                    <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Run AI Diagnostics
                    </>
                )}
            </Button>

            {/* Legend / Info */}
            <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                <div className="hidden md:flex items-center gap-3 bg-secondary/30 px-3 py-2 rounded-lg border text-xs cursor-help">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <div className="flex gap-2 items-center">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-healthy"></span> High</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-attention"></span> Medium</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-risk"></span> Low</span>
                    </div>
                </div>
                </TooltipTrigger>
                <TooltipContent>
                <p>AI Confidence Score determines automation reliability.</p>
                </TooltipContent>
            </Tooltip>
            </TooltipProvider>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-3 p-1">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search station or reasoning..."
            className="pl-9 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Action Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="bg-card gap-2 w-full md:w-auto justify-between md:justify-start">
              <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Action Type</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Filter by Action</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allActionTypes.map((action) => (
              <DropdownMenuCheckboxItem
                key={action}
                checked={actionFilters.includes(action)}
                onCheckedChange={() => toggleActionFilter(action)}
                className="capitalize"
              >
                {action}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
          <SelectTrigger className="w-full md:w-[180px] bg-card">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="confidence">Sort: Confidence</SelectItem>
            <SelectItem value="time">Sort: Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content Grid */}
      <div className="grid gap-4">
        {processedRecs.length === 0 ? (
            <div className="text-center py-12 bg-card border rounded-xl border-dashed">
                <p className="text-muted-foreground">
                    {behaviorMode === 'conservative' 
                        ? "No high-confidence recommendations available in Conservative Mode." 
                        : "No pending recommendations match your filters."}
                </p>
                <Button variant="link" onClick={handleRunDiagnostics} className="mt-2 text-primary">
                    Run diagnostics to find new issues
                </Button>
            </div>
        ) : (
            processedRecs.map(rec => (
            <Card key={rec.id} className={cn(
                "card-gradient border-l-4", 
                systemStatus === 'frozen' ? 'border-l-muted opacity-80' : 'border-l-primary'
            )}>
                <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Info */}
                    <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <ActionTag action={rec.action_type} size="lg" />
                        <h3 className="text-xl font-bold">{rec.station_name}</h3>
                        <span className="text-sm text-muted-foreground ml-auto md:ml-0">{getTimeSince(rec.created_at)}</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-secondary/30 p-3 rounded-lg border">
                            <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Reasoning</span>
                            <p className="text-sm mt-1">{rec.why_text}</p>
                        </div>
                        <div className="bg-secondary/30 p-3 rounded-lg border border-status-healthy/20">
                            <span className="text-xs text-status-healthy uppercase font-bold tracking-wider">Expected Impact</span>
                            <p className="text-sm mt-1">{rec.impact_text}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-muted-foreground">CONFIDENCE SCORE</span>
                        <div className="flex-1 max-w-xs">
                            <ConfidenceBar score={rec.confidence_score} />
                        </div>
                    </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                        {/* AUTO-FREEZE LOGIC */}
                        {systemStatus === 'frozen' ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-2">
                                <Lock className="h-6 w-6 mb-2 text-red-400" />
                                <span className="text-xs font-medium">Actions Frozen</span>
                                <span className="text-[10px] opacity-70">Check Safety Banner</span>
                            </div>
                        ) : (
                            <>
                                <Button className="bg-status-healthy hover:bg-status-healthy/90 w-full" onClick={() => handleApprove(rec.id)}>
                                    <Check className="mr-2 h-4 w-4" /> Approve
                                </Button>
                                <Button variant="outline" className="w-full" onClick={() => handleSnooze(rec.id)}>
                                    <Clock className="mr-2 h-4 w-4" /> Snooze
                                </Button>
                                <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive" onClick={() => initiateReject(rec.id)}>
                                    <X className="mr-2 h-4 w-4" /> Reject
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                </CardContent>
            </Card>
            ))
        )}
      </div>

      {/* Rejection Dialog */}
      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Recommendation</DialogTitle>
            <DialogDescription>
              Please specify why this AI recommendation is being rejected. This helps improve future accuracy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason Category</Label>
              <Select onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="False Positive">False Positive (Data Incorrect)</SelectItem>
                  <SelectItem value="Policy Conflict">Policy Conflict / Business Rule</SelectItem>
                  <SelectItem value="Temporary Spike">Temporary Spike (Self-Correcting)</SelectItem>
                  <SelectItem value="Human Override">Human Override / Strategy</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional Notes (Optional)</Label>
              <Textarea 
                placeholder="E.g., Field team already on site, no ticket needed."
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReject} disabled={!rejectionReason}>Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
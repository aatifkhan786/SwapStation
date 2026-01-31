import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StationMetrics, Ticket, TicketStatus } from '@/lib/mock-data'; // Ensure TicketStatus is imported
import { PriorityBadge } from '@/components/shared';
import { 
  Zap, Activity, CheckCircle2, Play, AlertOctagon, 
  Bot, Sparkles, Terminal, Cpu, Database, Wrench, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Typewriter Hook for AI Effect
const useTypewriter = (text: string, speed = 30) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayText('');
    // Ensure text is not null before starting timer
    if (!text) return;

    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return displayText;
};

// --- ACTION CENTER COMPONENT ---
export function ActionCenter({ 
  ticket, 
  metrics, 
  onUpdateStatus 
}: { 
  ticket: Ticket | null, 
  metrics: StationMetrics | null, 
  onUpdateStatus: (id: string, status: TicketStatus) => void 
}) {
  const [analysisStep, setAnalysisStep] = useState(0);

  // Simulation of AI Thinking Process
  useEffect(() => {
    if (ticket) {
      setAnalysisStep(0);
      const t1 = setTimeout(() => setAnalysisStep(1), 1000); // Step 1: Connect to DB
      const t2 = setTimeout(() => setAnalysisStep(2), 2500); // Step 2: Analyze Logs
      const t3 = setTimeout(() => setAnalysisStep(3), 4000); // Step 3: Generate Solution
      return () => { 
        clearTimeout(t1); 
        clearTimeout(t2); 
        clearTimeout(t3); 
      };
    }
  }, [ticket]);

  // AI Generated Text (Mocked) - Final fix to use AI's RCA
  const aiReasoningFull = `RCA: ${ticket?.probable_root_cause || "No cause provided."} Recommended action: Inspect main power coupling and reset firmware to clear residual error codes. Impact: 98% Uptime Restoration.`;
  
  const aiReasoning = useTypewriter(
    ticket ? aiReasoningFull : "", 
    20 // Typing speed
  );

  if (!ticket) {
    return (
      <Card className="h-full flex items-center justify-center border-dashed bg-muted/20 rounded-[2rem]">
        <div className="text-center text-muted-foreground p-8">
          <div className="relative mx-auto mb-4 w-16 h-16">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <Bot className="w-16 h-16 text-primary opacity-50 relative z-10" />
          </div>
          <p className="text-sm font-bold uppercase tracking-widest">AI COPILOT STANDBY</p>
          <p className="text-xs opacity-50 mt-2">Select a ticket to initiate diagnosis</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* 1. TICKET HEADER (Compact) */}
      <Card className="border-white/10 bg-card/50 backdrop-blur-md flex-shrink-0">
        <CardHeader className="pb-3 pt-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-black uppercase tracking-tight">{ticket.station_name}</CardTitle>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-primary/30 text-primary">ID: {ticket.id.split('-')[1]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono uppercase">INCIDENT: {ticket.issue_type}</p>
            </div>
            <PriorityBadge priority={ticket.priority} />
          </div>
        </CardHeader>
      </Card>

      {/* 2. AI COPILOT TERMINAL (The WOW Factor) */}
      <Card className="flex-1 bg-black/80 border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] overflow-hidden relative group">
        
        {/* Terminal Header */}
        <div className="bg-primary/10 border-b border-primary/20 p-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">DeepLinker_AI_Agent</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/50" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
            <div className="w-2 h-2 rounded-full bg-green-500/50" />
          </div>
        </div>

        <CardContent className="p-4 font-mono text-sm relative z-10 h-[280px]">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-3">
              {/* Step 1: Connecting */}
              {analysisStep >= 0 && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Database className="w-3 h-3" />
                  <span className="text-xs uppercase tracking-wider">INITIATE: Fetching telemetry logs...</span>
                  {analysisStep === 0 && <span className="animate-pulse">|</span>}
                </div>
              )}
              
              {/* Step 2: Processing */}
              {analysisStep >= 1 && (
                <div className="flex items-center gap-3 text-blue-400">
                  <Cpu className="w-3 h-3" />
                  <span className="text-xs uppercase tracking-wider">PROCESSING: Running diagnostic models...</span>
                  {analysisStep === 1 && <span className="animate-pulse">|</span>}
                </div>
              )}

              {/* Step 3: Result */}
              {analysisStep >= 2 && (
                <div className="flex items-center gap-3 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-xs uppercase tracking-wider">DIAGNOSIS: Root cause identified. Confidence: 98%</span>
                </div>
              )}

              {/* Step 4: The AI Output */}
              {analysisStep >= 3 && (
                <div className="mt-4 p-3 bg-primary/10 border-l-2 border-primary rounded-r-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Generated Solution Plan</span>
                  </div>
                  <p className="text-xs leading-relaxed text-foreground/90">
                    {aiReasoning}<span className="animate-pulse font-black text-primary">|</span>
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        {/* Background Grid for Tech Feel */}
        <div className="absolute inset-0 bg-grid-white/[0.02] opacity-10 pointer-events-none" />
      </Card>

      {/* 3. LIVE SENSORS (Sense) */}
      {metrics && (
        <Card className="flex-shrink-0">
          <CardHeader className='py-2'>
             <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Activity className="h-3 w-3 animate-pulse text-emerald-500" />
                Live Sensor Readout
             </div>
          </CardHeader>
          <CardContent className="grid grid-cols-4 gap-4 p-4 pt-0">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <span className="text-xs text-muted-foreground uppercase font-medium">Uptime (%)</span>
              <p className="text-xl font-black font-mono">{metrics.charger_uptime.toFixed(1)}%</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <span className="text-xs text-muted-foreground uppercase font-medium">Errors/Hr</span>
              <p className={cn("text-xl font-black font-mono", metrics.error_count > 0 ? "text-red-500" : "text-emerald-500")}>
                {metrics.error_count}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <span className="text-xs text-muted-foreground uppercase font-medium">Queue</span>
              <p className="text-xl font-black font-mono">{metrics.queue_level}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <span className="text-xs text-muted-foreground uppercase font-medium">Swap Rate</span>
              <p className="text-xl font-black font-mono">{metrics.swap_rate.toFixed(1)}/h</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. ACTIONS (Act) */}
      <div className="grid grid-cols-1 gap-3 flex-shrink-0 pb-4">
        {ticket.status === 'new' && (
          <Button size="lg" className="w-full font-bold shadow-lg shadow-primary/20" onClick={() => onUpdateStatus(ticket.id, 'acknowledged')}>
            ACKNOWLEDGE TICKET
          </Button>
        )}
        {ticket.status === 'acknowledged' && (
          <Button size="lg" className="w-full font-bold" onClick={() => onUpdateStatus(ticket.id, 'in_progress')}>
            <Play className="h-4 w-4 mr-2" /> DEPLOY FIX
          </Button>
        )}
        {ticket.status === 'in_progress' && (
          <Button size="lg" className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onUpdateStatus(ticket.id, 'resolved')}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> CONFIRM RESOLUTION
          </Button>
        )}
        {ticket.status === 'resolved' && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-center text-xs font-black uppercase tracking-widest">
            CASE CLOSED // ARCHIVED
          </div>
        )}
      </div>
    </div>
  );
}
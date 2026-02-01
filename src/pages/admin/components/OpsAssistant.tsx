import { useState, useRef, useEffect } from 'react';
import { useAdminStore } from '../hooks/useAdminStore';
import { GoogleGenerativeAI } from "@google/generative-ai";

// UI Imports
import { MessageSquare, Send, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// --- 1. The FINAL AI Persona & System Prompt ---
const SYSTEM_PROMPT = `You are Deeplinkers Admin Ops Explainer, a read-only, rule-based, system-explaining AI agent.

**RULES:**
- You MUST only base responses on the JSON data provided in the prompt.
- **You CAN perform simple calculations on the data provided, such as counting items in an array, if the user asks for it (e.g., 'how many pending recommendations?').**
- **Guardrail:** If the user's query is purely conversational ('hello', 'yo', 'thanks') OR cannot be answered using the provided data, you MUST respond with: "I can only provide information based on the current system data. Please ask a specific question about stations, alerts, or recommendations."
- Do NOT invent data. Do NOT use emojis or casual language. Speak as the system's reasoning voice.

**RESPONSE STRUCTURE (MANDATORY for valid operational queries):**
A. **CURRENT OBSERVATION:** Summarize the detection.
B. **WHY THIS IS HAPPENING:** Explain the reasoning.
C. **SYSTEM RISK IF NO ACTION IS TAKEN:** Explain consequences.
D. **RECOMMENDED SYSTEM ACTION:** Describe the system's recommendation.
E. **CONFIDENCE & LIMITATIONS:** State confidence and limitations.`;

// --- 2. The OpsAssistant Component ---
export function OpsAssistant() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Ops Assistant initialized. Ask about system status, specific stations, or recommendations.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // ✅ FIX 2: Make the component reactive to store changes.
  // This prevents the race condition where we try to use data before it's loaded.
  const { alerts, recommendations, stations, config, tickets, initialize } = useAdminStore();
  const isStoreInitialized = alerts.length > 0; // A simple check to see if data is loaded

  useEffect(() => {
    // Ensure the store is initialized if it hasn't been already.
    if (!isStoreInitialized) {
        initialize();
    }
  }, [isStoreInitialized, initialize]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleChatSubmit = async () => {
    // Prevent submission if loading or if the store data isn't ready
    if (!chatInput.trim() || isLoading || !isStoreInitialized) return;

    const userQuery = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setChatInput('');
    setIsLoading(true);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "ERROR: Gemini API key is not configured." }]);
      setIsLoading(false);
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Using the latest stable model name
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Data is now sourced from the reactive hooks, ensuring it's always up-to-date.
      const liveDataContext = JSON.stringify({
        timestamp: new Date().toISOString(),
        active_alerts: alerts.filter(a => a.status !== 'resolved'),
        pending_recommendations: recommendations.filter(r => r.decision_status === 'pending'),
        stations_at_risk: stations.filter(s => s.status === 'risk' || s.status === 'critical'),
        system_policies: config,
        recent_tickets: tickets.slice(0, 5)
      }, null, 2);

      // ✅ FIX 1: The improved prompt will handle questions like "how many pending" correctly.
      const prompt = `Here is the live system data:\n\`\`\`json\n${liveDataContext}\n\`\`\`\nNow, answer the following user query based ONLY on the provided data and your system instructions: "${userQuery}"`;
      
      const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
      const text = result.response.text();
      setChatMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "An error occurred while communicating with the AI. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50" onClick={() => setIsMinimized(false)}>
              <ChevronUp className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>Open Ops Assistant</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 md:w-96 shadow-2xl z-50 flex flex-col" style={{ maxHeight: 'calc(100vh - 4rem)', height: '500px' }}>
      <CardHeader className="p-3 border-b border-border flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Ops Assistant
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(true)}>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-3" ref={scrollAreaRef as any}>
          <div className="space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={cn('text-sm p-2.5 rounded-lg max-w-[95%]', msg.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted')}>
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Analyzing...</span>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-border flex gap-2">
          <Input
            placeholder={isStoreInitialized ? "How many pending recommendations?" : "Initializing..."}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
            disabled={isLoading || !isStoreInitialized}
            className="bg-background text-sm"
          />
          <Button size="icon" onClick={handleChatSubmit} disabled={isLoading || !isStoreInitialized}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
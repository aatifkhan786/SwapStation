import { useState, useRef, useEffect } from 'react';
import { useAdminStore } from '@/pages/admin/hooks/useAdminStore';
import { GoogleGenerativeAI } from "@google/generative-ai";

// UI Imports
import { MessageSquare, Send, Loader2, ChevronDown, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const DRIVER_PROMPT = `You are the DeepLinkers Driver Support Assistant.
Your job is to help drivers find station information and handle confusion.

RULES:
- Base info ONLY on the provided station data.
- If the driver is confused, frustrated, or asks for a human, explicitly give them the Support Line: 1-800-DEEP-HELP.
- Keep answers short and professional.
- Use the station status (healthy, risk, or critical) to advise drivers.`;

export function DriverAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hi! I can help you with station updates or connect you to support. What can I do for you?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { stations, initialize } = useAdminStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [chatMessages]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isLoading) return;

    const userQuery = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setChatInput('');
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // FIX: Map only properties we know exist to avoid TS errors
      const driverContext = JSON.stringify({
        stations: stations.map(s => ({
          name: s.station_name,
          status: s.status,
          location: s.station_name
        })),
        support_contact: "1-800-DEEP-HELP"
      });

      const prompt = `Context: ${driverContext}\n\nUser: ${userQuery}`;
      const result = await model.generateContent([DRIVER_PROMPT, prompt]);
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: result.response.text() }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please call support at 1-800-DEEP-HELP for immediate help." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-10 right-10 z-[9999]">
        <Button 
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full shadow-[0_10px_40px_rgba(59,130,246,0.6)] bg-primary hover:bg-primary/90 hover:scale-110 transition-all border-4 border-white/20 flex items-center justify-center p-0"
        >
          <MessageSquare className="h-8 w-8 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-10 right-10 w-80 md:w-96 shadow-2xl z-[9999] flex flex-col border-primary/20 bg-background animate-in slide-in-from-bottom-5">
      <CardHeader className="p-4 border-b bg-primary text-primary-foreground flex flex-row items-center justify-between rounded-t-lg">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Phone className="h-4 w-4" /> Driver Support
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsOpen(false)}>
          <ChevronDown className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-[400px]">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={cn('text-[13px] p-3 rounded-2xl max-w-[85%] leading-relaxed', 
                msg.role === 'user' ? 'ml-auto bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none')}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" /> Checking station data...
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-3 border-t flex gap-2 bg-background rounded-b-lg">
          <Input
            placeholder="How is the station in Downtown?"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
            className="h-9 text-xs"
          />
          <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleChatSubmit} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
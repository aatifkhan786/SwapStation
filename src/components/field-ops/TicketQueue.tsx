import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Ticket, TicketStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Clock,
  MapPin,
  ChevronRight,
  Check,
  X,
  Navigation,
  Flag,
} from "lucide-react";
import { PriorityBadge, RiskTypeIcon } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Confetti from 'react-confetti';

// --- HOOK: Window Size for Full Screen Confetti ---
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export function TicketQueue({
  tickets,
  selectedId,
  onSelect,
  onApprove,
  onDecline,
}: {
  tickets: Ticket[];
  selectedId?: string;
  onSelect: (t: Ticket) => void;
  onApprove?: (t: Ticket) => void;
  onDecline?: (t: Ticket, reason?: string) => void;
}) {
  // 1. Get full screen dimensions
  const { width, height } = useWindowSize(); 
  const [filter, setFilter] = useState<TicketStatus | "all">("all");

  /* Decline Logic */
  const [declineFor, setDeclineFor] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  /* Active Task Logic */
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  /* Celebration State */
  const [showConfetti, setShowConfetti] = useState(false);

  /* Auto Redirect to Active Tab */
  useEffect(() => {
    if (activeTaskId) {
      setFilter("in_progress");
    }
  }, [activeTaskId]);

  /* Handle Complete Task (Logic + Celebration) */
  const handleCompleteTask = (e: React.MouseEvent, ticket: Ticket) => {
    e.stopPropagation();
    
    // 1. Logic Update
    onDecline?.(ticket); // Assuming parent handles 'resolve' logic via this prop
    setFilter("resolved");
    setActiveTaskId(null);

    // 2. Trigger Celebration
    setShowConfetti(true);

    // 3. Colorful Toast Notification
    toast.success("✨ Task Completed Successfully! ✨", {
      description: "Great job! The grid is back online.",
      duration: 5000,
      style: {
        background: "linear-gradient(to right, #10B981, #0EA5E9)", // Green to Blue Gradient
        color: "#ffffff",
        border: "none",
        fontSize: "14px",
        fontWeight: "500"
      },
    });

    // 4. Stop Confetti after 5 seconds
    setTimeout(() => {
      setShowConfetti(false);
    }, 5000);
  };

  /* Filtering Data */
  const filtered =
    filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  const getTimeAgo = (date: string) => {
    const mins = Math.floor(
      (Date.now() - new Date(date).getTime()) / 60000
    );
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <>
      {/* ================= CONFETTI LAYER (FULL SCREEN) ================= */}
      {/* Placed outside the Card to ensure it covers everything including Navbar */}
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: 'none' }}>
          <Confetti
            width={width}
            height={height}
            recycle={true} // Keeps raining for the duration
            numberOfPieces={600} // High density for better effect
            gravity={0.15}
          />
        </div>
      )}

      <Card className="h-full flex flex-col border-none shadow-none bg-transparent relative z-0">
        {/* ================= TABS ================= */}
        <div className="mb-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="w-full grid grid-cols-4 p-1 rounded-xl bg-white border border-slate-200">
              {[
                { label: "All", value: "all" },
                { label: "New", value: "new" },
                { label: "Active", value: "in_progress" },
                { label: "Done", value: "resolved" },
              ].map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="text-sm font-semibold text-black data-[state=active]:bg-emerald-100"
                >
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* ================= LIST ================= */}
        <ScrollArea className="flex-1 -mr-4 pr-4">
          <div className="space-y-3 pb-4">
            {filtered.map((ticket) => {
              const isSelected = selectedId === ticket.id;
              const isNew = ticket.status === "new";
              const isActive = ticket.status === "in_progress";

              return (
                <div
                  key={ticket.id}
                  onClick={() => onSelect(ticket)}
                  className={cn(
                    "group p-4 rounded-xl transition-all cursor-pointer",
                    "border border-white/30 backdrop-blur-xl",
                    "bg-gradient-to-br from-emerald-400/20 via-sky-400/15 to-blue-500/20",
                    (isSelected || isActive) &&
                      "ring-2 ring-emerald-500 shadow-emerald-500/30"
                  )}
                >
                  <div className="flex gap-4">
                    <RiskTypeIcon
                      riskType={
                        ticket.issue_type.toLowerCase().includes("charger")
                          ? "charger_fault"
                          : "outage"
                      }
                      size="md"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between">
                        <h4 className="font-semibold text-black">
                          {ticket.station_name}
                        </h4>
                        <PriorityBadge priority={ticket.priority} size="sm" />
                      </div>

                      <p className="text-xs text-slate-700">
                        {ticket.issue_type}
                      </p>

                      <div className="flex gap-3 text-xs text-slate-600">
                        <span className="flex gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(ticket.created_at)}
                        </span>
                        <span className="flex gap-1">
                          <MapPin className="h-3 w-3" />
                          {ticket.station_id.split("-")[0]}
                        </span>
                      </div>

                      {isActive && (
                        <div className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Work In Progress
                        </div>
                      )}

                      {/* ACTIONS FOR NEW TICKETS */}
                      {isNew && (
                        <div className="flex gap-2 pt-3">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              onApprove?.(ticket);
                              setActiveTaskId(ticket.id);
                              toast.success("Ticket moved to Active");
                            }}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="border-slate-300 hover:bg-slate-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeclineFor(ticket.id);
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {/* DECLINE FORM */}
                      {declineFor === ticket.id && (
                        <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                          <textarea
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Reason for declining (sent to HQ)"
                            className="w-full rounded-md border border-slate-300 p-2 text-xs text-black focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDecline?.(ticket, declineReason);
                              setDeclineFor(null);
                              setDeclineReason("");
                              toast.success("Decline sent to HQ");
                            }}
                          >
                            Confirm Decline
                          </Button>
                        </div>
                      )}

                      {/* ACTIVE TASK VIEW (MAP & COMPLETE) */}
                      {isActive && activeTaskId === ticket.id && (
                        <div className="mt-4 space-y-3 animate-in zoom-in-95 duration-300">
                          <iframe
                            title="map"
                            className="w-full h-[260px] rounded-lg border border-slate-200 shadow-sm"
                            loading="lazy"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(
                              ticket.station_name
                            )}&output=embed`}
                          />

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 bg-white hover:bg-slate-50">
                              <Navigation className="h-4 w-4 mr-1" />
                              Navigate
                            </Button>

                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
                              onClick={(e) => handleCompleteTask(e, ticket)}
                            >
                              <Flag className="h-4 w-4 mr-1" />
                              Complete Task
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <ChevronRight className="h-4 w-4 text-slate-500 self-center" />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </Card>
    </>
  );
}
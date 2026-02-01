import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminStore } from "@/pages/admin/hooks/useAdminStore";
import {
  mockStations,
  generateMockMetrics,
  TicketStatus,
  StationMetrics,
  Ticket,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  Activity,
  History as HistoryIcon,
  Settings,
  LogOut,
  Zap,
  MapPin,
  MessageSquare,
  Trophy,
  CheckCircle2,
  Clock,
  ChevronRight,
  Flag, // Added for Complete Task button in ActionCenter
  Navigation, // Added for Navigate button in ActionCenter
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import Confetti from 'react-confetti'; // Import Confetti
// Import useWindowSize from TicketQueue or define locally if not globally available
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


import { OpsStats } from "@/components/field-ops/OpsStats";
import { TicketQueue } from "@/components/field-ops/TicketQueue";
import { ActionCenter } from "@/components/field-ops/ActionCenter";
import { OpsMap } from "@/components/field-ops/OpsMap";
import { StatusPill } from "@/components/shared";

/* ✅ NEW PAGES */
import FieldOpsReviews from "./FieldOpsReviews";
import Rewards from "./Rewards";
import FieldOpsLogs from "./FieldOpsLogs";

/* ---------------- NAV ITEM (NO CHANGE) ---------------- */
const NavItem = ({ icon: Icon, label, isActive, onClick }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
      isActive
        ? "bg-emerald-500/80 text-white shadow-md shadow-emerald-500/30"
        : "text-slate-600 hover:bg-white/30 hover:text-slate-900",
    )}
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

/* ---------------- GLASS CARD (NO CHANGE) ---------------- */
const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("rounded-2xl overflow-hidden border border-white/30 bg-gradient-to-br from-emerald-400/15 via-sky-400/10 to-blue-500/15 backdrop-blur-xl shadow-lg shadow-emerald-400/20 transition-all duration-500", className)}>
    {children}
  </div>
);

/* ================= MAIN DASHBOARD ================= */

export default function FieldOpsDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { signOut } = useAuth();
  const { width, height } = useWindowSize(); // For Confetti

  const isDashboard = currentPath === "/field-ops";
  const isTicketsPage = currentPath === "/field-ops/tickets";
  const isHealthPage = currentPath === "/field-ops/health";
  const isHistoryPage = currentPath === "/field-ops/history";
  const isSettingsPage = currentPath === "/field-ops/settings";
  const isReviewsPage = currentPath === "/field-ops/reviews";
  const isRewardsPage = currentPath === "/field-ops/rewards";

  const initializeStore = useAdminStore((s) => s.initialize);
  const tickets = useAdminStore((s) => s.tickets);
  const updateTicketStatus = useAdminStore((s) => s.updateTicketStatus);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<StationMetrics | null>(null);
  const [showConfetti, setShowConfetti] = useState(false); // Confetti state

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // 🛠️ BACKEND FILTERING: Get only new tickets from Admin for Dashboard
  const adminTickets = tickets.filter((t) => t.status === "new");
  
  // Determine the currently selected ticket based on state or initial admin ticket
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  // If in dashboard and no ticket is explicitly selected, default to the first admin ticket
  useEffect(() => {
    if (isDashboard && !selectedTicketId && adminTickets.length > 0) {
      setSelectedTicketId(adminTickets[0].id);
    }
  }, [isDashboard, selectedTicketId, adminTickets]);


  useEffect(() => {
    if (!selectedTicket) return;
    setSelectedMetrics(generateMockMetrics(selectedTicket.station_id));
    const i = setInterval(() => setSelectedMetrics(generateMockMetrics(selectedTicket.station_id)), 5000);
    return () => clearInterval(i);
  }, [selectedTicket?.id]);

  // 🚀 ACTION LOGIC: Approve & Auto-Redirect (Updated for state passing)
  const handleApproveAction = (ticketId: string) => {
    updateTicketStatus(ticketId, "in_progress");
    toast.success("Mission Accepted! Navigating to Active Queue...");
    
    // Redirecting to Queue Page with state
    setTimeout(() => {
      navigate("/field-ops/tickets", { state: { redirectToTicketId: ticketId, defaultTab: "in_progress" } });
    }, 500);
  };

  const handleUpdateStatus = (id: string, status: TicketStatus) => {
    updateTicketStatus(id, status);
    toast.success("Status Updated");
    // If a task is resolved, trigger confetti and clear selection
    if (status === 'resolved') {
        setShowConfetti(true);
        toast.success("✨ Task Completed Successfully! ✨", {
          description: "Great job! The grid is back online.",
          duration: 5000,
          style: {
            background: "linear-gradient(to right, #10B981, #0EA5E9)", 
            color: "#ffffff",
            border: "none",
            fontSize: "14px",
            fontWeight: "500"
          },
        });
        setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds
        setSelectedTicketId(null);
    }
  };

  const handleSignOut = async () => {
    try { await signOut(); navigate("/login"); } catch { toast.error("Failed to sign out"); }
  };

  const navItems = [
    { label: "Ops Center", icon: LayoutDashboard, path: "/field-ops" },
    { label: "Queue", icon: TicketIcon, path: "/field-ops/tickets" },
    { label: "Grid Health", icon: Activity, path: "/field-ops/health" },
    { label: "Logs", icon: HistoryIcon, path: "/field-ops/history" },
    { label: "Reviews", icon: MessageSquare, path: "/field-ops/reviews" },
    { label: "Rewards", icon: Trophy, path: "/field-ops/rewards" },
    { label: "Config", icon: Settings, path: "/field-ops/settings" },
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800">
      {/* ================= CONFETTI LAYER (FULL SCREEN) ================= */}
      {showConfetti && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: 'none' }}>
          <Confetti
            width={width}
            height={height}
            recycle={true} 
            numberOfPieces={600} 
            gravity={0.15}
          />
        </div>
      )}

      {/* BG & NAV (NO CHANGE) */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 scale-110" style={{ backgroundImage: "url('/intro-bg.png')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(1.5px)", opacity: 0.85 }} />
      </div>

      <nav className="sticky top-0 z-50 px-6 py-3 flex items-center bg-gradient-to-r from-emerald-400/20 via-sky-400/15 to-blue-500/20 backdrop-blur-xl border-b border-white/30 shadow-lg shadow-emerald-400/20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md"><Zap className="h-5 w-5 text-white" /></div>
          <div><h1 className="font-bold text-lg leading-none">Deep<span className="text-emerald-600">Linkers</span></h1><p className="text-[10px] uppercase text-slate-500">Field Operations Unit</p></div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {navItems.map((n) => ( <NavItem key={n.path} icon={n.icon} label={n.label} isActive={currentPath === n.path} onClick={() => navigate(n.path)} /> ))}
          <Button variant="outline" onClick={handleSignOut} className="ml-2 border-red-200 text-red-600 hover:bg-red-50 rounded-full"> <LogOut className="h-4 w-4 mr-2" /> Sign Out </Button>
        </div>
      </nav>

      <div className="relative z-10 max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* ================= DASHBOARD VIEW ================= */}
        {isDashboard && (
          <>
            <OpsStats tickets={tickets} />
            <div className="grid xl:grid-cols-12 gap-6">
              
              {/* LEFT: SIMPLIFIED ASSIGNED TASKS */}
              <GlassCard className="xl:col-span-4 h-[700px] flex flex-col">
                <div className="p-5 border-b border-white/30 font-bold text-slate-700 flex items-center justify-between bg-white/10">
                  <span>Assigned Tasks</span>
                  <div className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-[10px] font-bold">NEW FROM ADMIN</div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {adminTickets.length > 0 ? (
                    adminTickets.map((ticket) => (
                      <div 
                        key={ticket.id}
                        onClick={() => setSelectedTicketId(ticket.id)}
                        className={cn(
                          "group p-4 rounded-xl border transition-all cursor-pointer",
                          selectedTicketId === ticket.id || (!selectedTicketId && adminTickets[0].id === ticket.id)
                            ? "bg-white border-emerald-400 shadow-md shadow-emerald-500/10"
                            : "bg-white/40 border-transparent hover:bg-white/60"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800">{ticket.station_name}</h4>
                          <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", ticket.priority === 'P0' ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600")}>
                            {ticket.priority}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-4 flex items-center gap-1.5 italic">
                          <Activity className="h-3 w-3" /> {ticket.issue_type}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleApproveAction(ticket.id); }}
                            className="flex-1 h-9 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm"
                          >
                            Approve Mission
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="h-9 px-3 rounded-lg border border-slate-200 text-slate-400 hover:text-red-500"
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(ticket.id, 'resolved'); }} // Use handleUpdateStatus here for consistency
                          >
                            Ignore
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    /* PYARA EMPTY STATE */
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 opacity-60">
                      <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-2">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <p className="font-bold text-slate-700">All Caught Up!</p>
                      <p className="text-xs text-slate-500">No new tasks from admin. Take a short break or check the logs.</p>
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* RIGHT: MAP & DETAILS for Dashboard */}
              <div className="xl:col-span-8 space-y-6">
                <GlassCard className="h-[380px]">
                  <OpsMap selectedStationId={selectedTicket?.station_id} />
                </GlassCard>
                <GlassCard className="min-h-[260px]">
                  {/* Action Center logic as is - AI works in backend */}
                  <ActionCenter ticket={selectedTicket} metrics={selectedMetrics} onUpdateStatus={handleUpdateStatus} />
                </GlassCard>
              </div>
            </div>
          </>
        )}

        {/* ================= QUEUE VIEW (UPDATED LAYOUT) ================= */}
        {isTicketsPage && (
          <div className="grid xl:grid-cols-12 gap-6">
            {/* LEFT: Full Ticket Queue List */}
            <GlassCard className="xl:col-span-4 h-[700px] flex flex-col">
              <div className="p-5 border-b border-white/30 font-semibold bg-white/10">Manage All Operations</div>
              <TicketQueue
                tickets={tickets}
                selectedId={selectedTicketId || undefined} 
                onSelect={(t) => setSelectedTicketId(t.id)}
                onApprove={(t) => handleUpdateStatus(t.id, "in_progress")} // Uses parent's handleUpdateStatus
                onDecline={(t, reason) => handleUpdateStatus(t.id, "resolved")} // Uses parent's handleUpdateStatus
              />
            </GlassCard>

            {/* RIGHT: Map & ActionCenter for Queue Page */}
            {selectedTicket ? ( // Only show right column if a ticket is selected
              <div className="xl:col-span-8 space-y-6">
                <GlassCard className="h-[380px]">
                  <OpsMap selectedStationId={selectedTicket?.station_id} />
                </GlassCard>
                <GlassCard className="min-h-[260px]">
                  <ActionCenter
                    ticket={selectedTicket}
                    metrics={selectedMetrics}
                    onUpdateStatus={handleUpdateStatus} // Pass handleUpdateStatus from parent
                  />
                </GlassCard>
              </div>
            ) : (
              // Message when no ticket is selected on Queue page
              <div className="xl:col-span-8 h-[700px] flex flex-col items-center justify-center text-center text-slate-500 opacity-70 p-8">
                <MapPin className="h-16 w-16 mb-4 text-slate-400" />
                <p className="font-semibold text-lg">No Mission Selected</p>
                <p className="text-sm">Select a ticket from the left queue to view its details, map location, and take action.</p>
              </div>
            )}
          </div>
        )}

        {/* OTHER PAGES AS IS (NO CHANGE) */}
        {isHealthPage && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockStations.map((station) => (
              <GlassCard key={station.id} className="p-6 space-y-4">
                <div className="flex justify-between font-bold"><h3>{station.station_name}</h3><StatusPill status={station.status} /></div>
                <div className="text-sm text-slate-600 flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-500" />{station.city}</div>
              </GlassCard>
            ))}
          </div>
        )}
        {isHistoryPage && <GlassCard className="min-h-[600px] p-6"><FieldOpsLogs /></GlassCard>}
        {isReviewsPage && <FieldOpsReviews />}
        {isRewardsPage && <Rewards />}
        {isSettingsPage && <GlassCard className="p-6 min-h-[400px]"><h2 className="text-xl font-bold">System Configuration</h2></GlassCard>}
      </div>
    </div>
  );
}
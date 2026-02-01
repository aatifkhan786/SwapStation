import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminStore } from "@/pages/admin/hooks/useAdminStore";
import {
  mockStations,
  generateMockMetrics,
  TicketStatus,
  StationMetrics,
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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

import { OpsStats } from "@/components/field-ops/OpsStats";
import { TicketQueue } from "@/components/field-ops/TicketQueue";
import { ActionCenter } from "@/components/field-ops/ActionCenter";
import { OpsMap } from "@/components/field-ops/OpsMap";
import { StatusPill } from "@/components/shared";

/* ✅ NEW PAGES */
import FieldOpsReviews from "./FieldOpsReviews";
import Rewards from "./Rewards";
import FieldOpsLogs from "./FieldOpsLogs";


/* ---------------- NAV ITEM ---------------- */

const NavItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
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

/* ---------------- GLASS CARD ---------------- */

const GlassCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-2xl overflow-hidden",
      "border border-white/30",
      "bg-gradient-to-br from-emerald-400/15 via-sky-400/10 to-blue-500/15",
      "backdrop-blur-xl shadow-lg shadow-emerald-400/20",
      "transition-all duration-500",
      className,
    )}
  >
    {children}
  </div>
);

/* ================= MAIN ================= */

export default function FieldOpsDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const { signOut } = useAuth();

  /* ---------- ROUTE FLAGS ---------- */
  const isDashboard = currentPath === "/field-ops";
  const isTicketsPage = currentPath === "/field-ops/tickets";
  const isHealthPage = currentPath === "/field-ops/health";
  const isHistoryPage = currentPath === "/field-ops/history";
  const isSettingsPage = currentPath === "/field-ops/settings";
  const isReviewsPage = currentPath === "/field-ops/reviews";
  const isRewardsPage = currentPath === "/field-ops/rewards";

  /* ---------- STORE ---------- */
  const initializeStore = useAdminStore((s) => s.initialize);
  const tickets = useAdminStore((s) => s.tickets);
  const updateTicketStatus = useAdminStore((s) => s.updateTicketStatus);

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<StationMetrics | null>(
    null,
  );

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  useEffect(() => {
    if (!selectedTicket) return;
    setSelectedMetrics(generateMockMetrics(selectedTicket.station_id));
    const i = setInterval(
      () => setSelectedMetrics(generateMockMetrics(selectedTicket.station_id)),
      5000,
    );
    return () => clearInterval(i);
  }, [selectedTicketId]);

  const handleUpdateStatus = (id: string, status: TicketStatus) => {
    updateTicketStatus(id, status);
    toast.success("Ticket Updated");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch {
      toast.error("Failed to sign out");
    }
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
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: "url('/intro-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(1.5px)",
            opacity: 0.85,
          }}
        />
        <div className="absolute inset-0 bg-white/10" />
      </div>

      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 px-6 py-3 flex items-center bg-gradient-to-r from-emerald-400/20 via-sky-400/15 to-blue-500/20 backdrop-blur-xl border-b border-white/30 shadow-lg shadow-emerald-400/20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">
              Deep<span className="text-emerald-600">Linkers</span>
            </h1>
            <p className="text-[10px] uppercase text-slate-500">
              Field Operations Unit
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {navItems.map((n) => (
            <NavItem
              key={n.path}
              icon={n.icon}
              label={n.label}
              isActive={currentPath === n.path}
              onClick={() => navigate(n.path)}
            />
          ))}

          <Button
            variant="outline"
            onClick={handleSignOut}
            className="ml-2 border-red-200 text-red-600 hover:bg-red-50 rounded-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </nav>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 max-w-[1600px] mx-auto p-6 space-y-6">
        {isDashboard && (
          <>
            <OpsStats tickets={tickets} />
            <div className="grid xl:grid-cols-12 gap-6">
              <GlassCard className="xl:col-span-4 h-[700px]">
                <div className="p-5 border-b border-white/30 font-semibold">
                  Active Queue
                </div>
                <TicketQueue
                  tickets={tickets}
                  selectedId={selectedTicketId || undefined}
                  onSelect={(t) => setSelectedTicketId(t.id)}
                />
              </GlassCard>

              <div className="xl:col-span-8 space-y-6">
                <GlassCard className="h-[380px]">
                  <OpsMap selectedStationId={selectedTicket?.station_id} />
                </GlassCard>

                <GlassCard className="min-h-[260px]">
                  <ActionCenter
                    ticket={selectedTicket}
                    metrics={selectedMetrics}
                    onUpdateStatus={handleUpdateStatus}
                  />
                </GlassCard>
              </div>
            </div>
          </>
        )}

        {isTicketsPage && (
          <GlassCard className="min-h-[600px]">
            <div className="p-5 border-b border-white/30 font-semibold">
              Ticket Queue
            </div>
            <TicketQueue
              tickets={tickets}
              selectedId={selectedTicketId || undefined}
              onSelect={(t) => setSelectedTicketId(t.id)}
              onApprove={(t) => {
                updateTicketStatus(t.id, "in_progress");

                useAdminStore.setState((state) => ({
                  notifications: [
                    {
                      id: `ntf-${Date.now()}`,
                      target_role: "field_ops",
                      channel: "dashboard_log",
                      message_text: `🟢 Task accepted by Field Ops for ${t.station_name}`,
                      is_read: false,
                      sent_at: new Date().toISOString(),
                    },
                    ...state.notifications,
                  ],
                }));
              }}
              onDecline={(t) => {
                updateTicketStatus(t.id, "resolved");

                useAdminStore.setState((state) => ({
                  notifications: [
                    {
                      id: `ntf-${Date.now()}`,
                      target_role: "admin",
                      channel: "dashboard_log",
                      message_text: `🔴 Task completed by Field Ops for ${t.station_name}`,
                      is_read: false,
                      sent_at: new Date().toISOString(),
                    },
                    ...state.notifications,
                  ],
                }));
              }}
            />
          </GlassCard>
        )}

        {isHealthPage && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockStations.map((station) => (
              <GlassCard key={station.id}>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <h3 className="font-bold">{station.station_name}</h3>
                    <StatusPill status={station.status} />
                  </div>
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    {station.city}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {isHistoryPage && (
          <GlassCard className="min-h-[600px] p-6">
            <FieldOpsLogs />
          </GlassCard>
        )}

        {isReviewsPage && <FieldOpsReviews />}

        {isRewardsPage && <Rewards />}

        {isSettingsPage && (
          <GlassCard className="p-6 min-h-[400px]">
            <h2 className="text-xl font-bold">Configuration</h2>
            <p className="text-slate-600 mt-2">Settings panel.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

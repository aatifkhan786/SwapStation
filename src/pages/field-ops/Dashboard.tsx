import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAdminStore } from "@/pages/admin/hooks/useAdminStore"; // Connected Store
import {
  mockStations, 
  generateMockMetrics,
  Ticket,
  TicketStatus,
  StationMetrics,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RefreshCcw,
  Wifi,
  User,
  Radio,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Importing Modular Components
import { OpsStats } from "@/components/field-ops/OpsStats";
import { TicketQueue } from "@/components/field-ops/TicketQueue";
import { ActionCenter } from "@/components/field-ops/ActionCenter";
import { OpsMap } from "@/components/field-ops/OpsMap";
import { StatusPill } from "@/components/shared"; 
import { ScrollArea } from '@/components/ui/scroll-area';

export default function FieldOpsDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // --- CONNECTED GLOBAL STATE ---
  const initializeStore = useAdminStore((state) => state.initialize);
  const tickets = useAdminStore((state) => state.tickets);
  const updateTicketStatus = useAdminStore((state) => state.updateTicketStatus);

  // Use ID for selection to maintain reactivity with store updates
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<StationMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize store on mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Derived selected ticket from store
  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;

  // --- LOGIC: TELEMETRY SIMULATION ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedTicket) {
      setSelectedMetrics(generateMockMetrics(selectedTicket.station_id));
      interval = setInterval(() => {
        setSelectedMetrics(generateMockMetrics(selectedTicket.station_id));
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [selectedTicketId]);

  // --- HANDLERS ---
  const handleUpdateStatus = (ticketId: string, newStatus: TicketStatus) => {
    // Calling the shared store action
    updateTicketStatus(ticketId, newStatus);

    toast.success("Sync Complete", {
      description: `Ticket status updated to ${newStatus.replace("_", " ").toUpperCase()}. HQ notified.`,
    });
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Grid Synced", {
        description: "Latest field telemetry fetched from HQ.",
      });
    }, 1000);
  };

  // --- ROUTING LOGIC ---
  const isDashboard = currentPath === "/field-ops";
  const isTicketsPage = currentPath === "/field-ops/tickets";
  const isHealthPage = currentPath === "/field-ops/health";
  const isHistoryPage = currentPath === "/field-ops/history";
  const isSettingsPage = currentPath === "/field-ops/settings";

  const pageTitle = isDashboard
    ? "Field Operations"
    : isTicketsPage
      ? "My Ticket Queue"
      : isHealthPage
        ? "Station Network Health"
        : isHistoryPage
          ? "Resolution Logs"
          : "Engineer Settings";

  return (
    <div className="h-[calc(100vh-1rem)] flex flex-col gap-6 p-6 max-w-[1600px] mx-auto overflow-hidden">
      {/* 1. PROFESSIONAL HEADER */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>HQ Uplink Secure</span>
            <span className="text-border opacity-50">|</span>
            <span>Sector 042-Alpha</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="font-mono font-normal text-xs py-1"
          >
            <Wifi className="h-3 w-3 mr-2" />
            Uplink: 12ms
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            className="gap-2"
          >
            <RefreshCcw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
            Sync Grid
          </Button>
        </div>
      </div>

      {/* 2. STATS ROW (Uses Live Store Tickets) */}
      {!isSettingsPage && (
        <div className="flex-shrink-0">
          <OpsStats tickets={tickets} />
        </div>
      )}

      {/* 3. DYNAMIC CONTENT AREA */}
      <div className="flex-1 min-h-0 overflow-hidden relative rounded-xl border bg-card/30">
        {/* VIEW: MAIN DASHBOARD (Split View) */}
        {isDashboard && (
          <div className="grid grid-cols-12 gap-6 h-full p-6">
            <div className="col-span-4 h-full overflow-hidden">
              <TicketQueue
                tickets={tickets}
                selectedId={selectedTicketId || undefined}
                onSelect={(t) => setSelectedTicketId(t.id)}
              />
            </div>
            <div className="col-span-8 flex flex-col gap-6 h-full overflow-y-auto pr-2">
              <div className="h-[320px] shrink-0 rounded-xl border bg-muted/20 overflow-hidden relative">
                <OpsMap selectedStationId={selectedTicket?.station_id} />
              </div>
              <div className="flex-1">
                <ActionCenter
                  ticket={selectedTicket}
                  metrics={selectedMetrics}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW: MY TICKETS / HISTORY (Full List) */}
        {(isTicketsPage || isHistoryPage) && (
          <div className="h-full p-6">
            <TicketQueue
              tickets={
                isHistoryPage
                  ? tickets.filter((t) => t.status === "resolved")
                  : tickets
              }
              selectedId={selectedTicketId || undefined}
              onSelect={(t) => {
                setSelectedTicketId(t.id);
                navigate("/field-ops");
              }}
            />
          </div>
        )}

        {/* VIEW: STATION HEALTH (Grid) */}
        {isHealthPage && (
          <ScrollArea className="h-full w-full rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {mockStations.map((station) => (
                <Card
                  key={station.id}
                  className="hover:border-primary/50 transition-all cursor-default group"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base font-bold">
                      {station.station_name}
                    </CardTitle>
                    <StatusPill status={station.status} />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mr-1" /> {station.city}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider">
                          Uptime
                        </p>
                        <p className="font-mono font-medium">99.4%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider">
                          Load
                        </p>
                        <p className="font-mono font-medium">42 kW</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* VIEW: SETTINGS */}
        {isSettingsPage && (
          <div className="h-full flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center pb-8">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <CardTitle className="text-2xl">Field Engineer Agent</CardTitle>
                <p className="text-sm text-muted-foreground">
                  ID: 0X-AF42 • Senior Technician
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Radio className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">
                        SMS & App priority alerts
                      </p>
                    </div>
                  </div>
                  <Badge>Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Biometric Token</p>
                      <p className="text-xs text-muted-foreground">
                        Secure HQ Auth
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Re-auth
                  </Button>
                </div>
                <Button className="w-full" variant="destructive">
                  Secure Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
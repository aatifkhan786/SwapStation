import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdminStore } from "@/pages/admin/hooks/useAdminStore";
import { cn } from "@/lib/utils";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Send,
  ShieldCheck,
} from "lucide-react";

/* ======================================================
   FIELD OPS LOGS – FINAL VERSION
   Shows everything that happens in Queue / Active / Done
====================================================== */

export default function FieldOpsLogs() {
  const notifications = useAdminStore((s) => s.notifications);

  /* -------- TIME FORMAT -------- */
  const getTimeAgo = (date: string) => {
    const mins = Math.floor(
      (Date.now() - new Date(date).getTime()) / 60000
    );
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  /* -------- ICON BASED ON LOG TYPE -------- */
  const getIcon = (text: string) => {
    const t = text.toLowerCase();

    if (t.includes("accepted") || t.includes("approved"))
      return <CheckCircle className="h-4 w-4 text-emerald-600" />;

    if (t.includes("resolved") || t.includes("completed"))
      return <CheckCircle className="h-4 w-4 text-emerald-600" />;

    if (t.includes("declined") || t.includes("rejected"))
      return <AlertTriangle className="h-4 w-4 text-red-500" />;

    if (t.includes("new ticket") || t.includes("assigned"))
      return <Wrench className="h-4 w-4 text-sky-600" />;

    if (t.includes("reroute"))
      return <Send className="h-4 w-4 text-orange-500" />;

    if (t.includes("system"))
      return <ShieldCheck className="h-4 w-4 text-red-600" />;

    return <AlertTriangle className="h-4 w-4 text-slate-500" />;
  };

  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      {/* ================= HEADER ================= */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-black">Activity Logs</h2>
        <p className="text-sm text-slate-600">
          All Field Ops & system actions are tracked automatically
        </p>
      </div>

      {/* ================= LOG LIST ================= */}
      <ScrollArea className="h-[calc(100vh-220px)] pr-4">
        <div className="space-y-3 pb-6">
          {notifications.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-16">
              No activity yet. Logs will appear automatically.
            </div>
          )}

          {notifications.map((log) => (
            <div
              key={log.id}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl",
                "border border-white/40 backdrop-blur-xl",
                "bg-gradient-to-br from-emerald-400/15 via-sky-400/10 to-blue-500/15",
                "hover:shadow-md hover:shadow-emerald-400/20 transition-all"
              )}
            >
              {/* ICON */}
              <div className="mt-1">
                {getIcon(log.message_text)}
              </div>

              {/* CONTENT */}
              <div className="flex-1">
                <p className="text-sm font-medium text-black">
                  {log.message_text}
                </p>

                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                  <Clock className="h-3 w-3" />
                  {getTimeAgo(log.sent_at)}
                  <span className="mx-1">•</span>
                  <span className="capitalize">
                    {log.target_role.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}

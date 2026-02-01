import { Card, CardContent } from "@/components/ui/card";
import { Wrench, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Ticket } from "@/lib/mock-data";

export function OpsStats({ tickets }: { tickets: Ticket[] }) {
  const active = tickets.filter((t) => t.status !== "resolved").length;
  const critical = tickets.filter(
    (t) => t.priority === "P0" && t.status !== "resolved"
  ).length;
  const resolved = tickets.filter((t) => t.status === "resolved").length;

  const StatItem = ({
    label,
    value,
    icon: Icon,
    alert = false,
    success = false,
  }: any) => (
    <Card
      className="
        rounded-2xl
        border border-white/30
        bg-gradient-to-br from-emerald-400/20 via-sky-400/15 to-blue-500/20
        backdrop-blur-xl
        shadow-lg shadow-emerald-400/20
      "
    >
      <CardContent className="p-5 flex items-center justify-between">
        {/* LEFT TEXT */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600">
            {label}
          </p>

          <p
            className={`text-3xl font-bold ${
              alert
                ? "text-red-600"
                : success
                ? "text-emerald-600"
                : "text-slate-900"
            }`}
          >
            {value}
          </p>
        </div>

        {/* RIGHT ICON */}
        <div
          className={`p-3 rounded-full ${
            alert
              ? "bg-red-100 text-red-600"
              : success
              ? "bg-emerald-100 text-emerald-600"
              : "bg-sky-100 text-sky-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatItem label="Active Tickets" value={active} icon={Wrench} />
      <StatItem
        label="Critical Issues"
        value={critical}
        icon={AlertCircle}
        alert={critical > 0}
      />
      <StatItem
        label="Resolved Today"
        value={resolved}
        icon={CheckCircle2}
        success
      />
      <StatItem label="Avg Response" value="12m" icon={Clock} />
    </div>
  );
}

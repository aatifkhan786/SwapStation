import { Card, CardContent } from "@/components/ui/card";
import { Wrench, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Ticket } from "@/lib/mock-data";

export function OpsStats({ tickets }: { tickets: Ticket[] }) {
  const active = tickets.filter(t => t.status !== 'resolved').length;
  const critical = tickets.filter(t => t.priority === 'P0' && t.status !== 'resolved').length;
  const resolved = tickets.filter(t => t.status === 'resolved').length;

  const StatItem = ({ label, value, icon: Icon, alert = false, success = false }: any) => (
    <Card className="shadow-sm">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${alert ? 'text-destructive' : success ? 'text-emerald-500' : 'text-foreground'}`}>
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-full ${alert ? 'bg-destructive/10 text-destructive' : success ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatItem label="Active Tickets" value={active} icon={Wrench} />
      <StatItem label="Critical Issues" value={critical} icon={AlertCircle} alert={critical > 0} />
      <StatItem label="Resolved Today" value={resolved} icon={CheckCircle2} success />
      <StatItem label="Avg Response" value="12m" icon={Clock} />
    </div>
  );
}
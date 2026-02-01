import { useAdminStore } from '../hooks/useAdminStore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertOctagon, RefreshCw } from 'lucide-react';

export function SafetyBanner() {
  const { systemStatus, freezeReason, resetSystem } = useAdminStore();

  if (systemStatus === 'active') return null;

  return (
    <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-950/20 text-red-500 animate-in slide-in-from-top-2">
      <div className="flex items-start gap-4">
        <AlertOctagon className="h-5 w-5 mt-0.5 animate-pulse" />
        <div className="flex-1">
          <AlertTitle className="text-lg font-bold flex items-center gap-2">
            SYSTEM FROZEN
            <span className="text-xs font-normal border border-red-500 px-2 py-0.5 rounded-full uppercase">
                Safety Protocol Active
            </span>
          </AlertTitle>
          <AlertDescription className="mt-1 text-red-400">
            {freezeReason || "Automated recommendations paused due to safety thresholds."}
          </AlertDescription>
          <div className="mt-3 text-sm text-red-400/80">
            AI recommendations are set to <strong>Observation Only</strong>. Human approval required to resume.
          </div>
        </div>
        <Button 
          variant="outline" 
          className="bg-red-950/40 border-red-500/50 hover:bg-red-900/50 text-red-200"
          onClick={resetSystem}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Resume System
        </Button>
      </div>
    </Alert>
  );
}
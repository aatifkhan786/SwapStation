import { useAdminStore, AIBehaviorMode } from './hooks/useAdminStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, Settings as SettingsIcon, Zap, Lock, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { 
    config, 
    updateConfig, 
    behaviorMode, 
    setBehaviorMode, 
    systemStatus, 
    resetSystem, 
    triggerManualFreeze 
  } = useAdminStore();
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ [e.target.name]: Number(e.target.value) });
  };

  const handleModeChange = (mode: string) => {
    setBehaviorMode(mode as AIBehaviorMode);
    toast({ title: "Behavior Mode Updated", description: `System is now running in ${mode.toUpperCase()} mode.` });
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">System Configuration</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* LEFT COLUMN: Governance & Safety */}
        <div className="space-y-6">
           <Card className={cn("border-2", systemStatus === 'frozen' ? 'border-red-500/50 bg-red-950/10' : 'border-primary/20')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className={cn("h-5 w-5", systemStatus === 'frozen' ? 'text-red-500' : 'text-primary')} />
                Governance & Safety
              </CardTitle>
              <CardDescription>
                Control AI autonomy and safety overrides.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* System Status */}
              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border">
                <div>
                    <Label className="text-base">System Status</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                        {systemStatus === 'active' ? 'Normal Operations' : 'Safety Freeze Active'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {systemStatus === 'active' ? (
                        <div className="flex items-center gap-2 text-green-500 text-sm font-bold bg-green-500/10 px-3 py-1 rounded-full">
                            <Activity className="h-4 w-4" /> ACTIVE
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-500/10 px-3 py-1 rounded-full animate-pulse">
                            <Lock className="h-4 w-4" /> FROZEN
                        </div>
                    )}
                </div>
              </div>

              {/* Behavior Mode */}
              <div className="space-y-3">
                <Label>AI Behavior Mode</Label>
                <Tabs value={behaviorMode} onValueChange={handleModeChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="conservative">Conservative</TabsTrigger>
                        <TabsTrigger value="balanced">Balanced</TabsTrigger>
                        <TabsTrigger value="aggressive">Aggressive</TabsTrigger>
                    </TabsList>
                </Tabs>
                <p className="text-xs text-muted-foreground p-2 bg-secondary/30 rounded">
                    {behaviorMode === 'conservative' && "High confidence required (85%+). No auto-actions. Monitor & Flag only."}
                    {behaviorMode === 'balanced' && "Standard thresholds. Human approval required for critical actions."}
                    {behaviorMode === 'aggressive' && "Lower thresholds for faster escalation. Maximize uptime over precision."}
                </p>
              </div>

              {/* Auto-Freeze Settings */}
              <div className="space-y-4 pt-4 border-t">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Auto-Freeze Protocol</Label>
                        <p className="text-xs text-muted-foreground">Pause AI on high rejection rate.</p>
                    </div>
                    <Switch checked={true} disabled /> {/* Always on for demo */}
                 </div>
                 
                 <div className="flex gap-2">
                    {systemStatus === 'active' ? (
                        <Button variant="destructive" className="w-full" onClick={() => triggerManualFreeze('Admin Override')}>
                            <Lock className="mr-2 h-4 w-4" /> Emergency Freeze
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full border-green-500 text-green-500 hover:text-green-600" onClick={resetSystem}>
                            <Zap className="mr-2 h-4 w-4" /> Resume System
                        </Button>
                    )}
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Operational Config */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle>Reroute Policies (Geofencing)</CardTitle>
                <CardDescription>
                    Define the radius logic for the recommendation engine.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="default_radius">Default Search Radius (km)</Label>
                    <Input 
                        id="default_radius" 
                        name="reroute_radius_default" 
                        type="number" 
                        value={config.reroute_radius_default} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="fallback_radius">Fallback Radius (km)</Label>
                    <Input 
                        id="fallback_radius" 
                        name="reroute_radius_fallback" 
                        type="number" 
                        value={config.reroute_radius_fallback} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="grid gap-2">
                    <Label htmlFor="emergency_radius">Emergency Radius (km)</Label>
                    <Input 
                        id="emergency_radius" 
                        name="reroute_radius_emergency" 
                        type="number" 
                        value={config.reroute_radius_emergency} 
                        onChange={handleChange} 
                    />
                </div>

                <div className="pt-4">
                    <Button onClick={() => toast({ title: "Configuration Saved" })}>Save Changes</Button>
                </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
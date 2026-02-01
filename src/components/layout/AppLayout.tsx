import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { userName } = useAuth();
  const location = useLocation();

  // ✅ ONLY FIELD OPS SHOULD HIDE SIDEBAR + HEADER
  const isFieldOps = location.pathname.startsWith('/field-ops');

  // =========================
  // FIELD OPS → NO SIDEBAR LAYOUT
  // =========================
  if (isFieldOps) {
    return (
      <div className="min-h-screen w-full">
        {/* No Sidebar, No Header */}
        <main className="min-h-screen w-full overflow-auto">
          {children}
        </main>
      </div>
    );
  }

  // =========================
  // ADMIN / DRIVER → SAME AS BEFORE
  // =========================
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <SidebarInset className="flex flex-col flex-1">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4">
            <SidebarTrigger />

            <div className="flex-1" />

            {/* Connection indicator */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Wifi className="h-4 w-4 text-status-healthy" />
              <span className="hidden sm:inline">Live</span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1"
              >
                3
              </Badge>
            </Button>

            {/* User info */}
            <div className="hidden md:flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                {userName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

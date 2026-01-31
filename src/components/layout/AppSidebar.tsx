import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Bell, 
  Settings, 
  LogOut,
  Ticket,
  Activity,
  AlertTriangle,
  Lightbulb,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History } from 'lucide-react'; //NEW
interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
}

const navItemsByRole: Record<UserRole, NavItem[]> = {
  driver: [
    { title: 'Dashboard', url: '/driver', icon: LayoutDashboard },
    { title: 'Nearby Stations', url: '/driver/stations', icon: MapPin },
    { title: 'Notifications', url: '/driver/notifications', icon: Bell, badge: 2 },
    { title: 'Settings', url: '/driver/settings', icon: Settings },
  ],
  field_ops: [
    { title: 'Dashboard', url: '/field-ops', icon: LayoutDashboard },
    { title: 'My Tickets', url: '/field-ops/tickets', icon: Ticket, badge: 5 },
    { title: 'Station Health', url: '/field-ops/health', icon: Activity },
    { title: 'Resolved History', url: '/field-ops/history', icon: FileText },
    { title: 'Settings', url: '/field-ops/settings', icon: Settings },
  ],
  admin: [
    { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
    { title: 'City View', url: '/admin/city', icon: MapPin },
    { title: 'Alerts', url: '/admin/alerts', icon: AlertTriangle, badge: 8 },
    { title: 'Recommendations', url: '/admin/recommendations', icon: Lightbulb, badge: 7 },
    { title: 'Audit Trail', url: '/admin/history', icon: History }, // ✅ NEW LINK
    { title: 'Tickets Overview', url: '/admin/tickets', icon: Ticket },
    { title: 'Notification Log', url: '/admin/notifications', icon: Bell },
    { title: 'Settings', url: '/admin/settings', icon: Settings },
  ],
};

const roleLabels: Record<UserRole, { label: string; color: string }> = {
  driver: { label: 'Driver', color: 'bg-status-attention text-black' },
  field_ops: { label: 'Field Ops', color: 'bg-status-healthy text-white' },
  admin: { label: 'Admin', color: 'bg-primary text-primary-foreground' },
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
const { userRole: authRole, userName, signOut } = useAuth();

// Ye logic check karega URL se ki kaunsa page hai agar auth fail ho jaye
const getRoleFromPath = () => {
  const path = window.location.pathname;
  if (path.includes('/admin')) return 'admin';
  if (path.includes('/field-ops')) return 'field_ops';
  return 'driver'; // Default
};

const userRole = authRole || getRoleFromPath(); 

// Ab return null wali line ki zaroorat nahi hai, sidebar dikhega hi dikhega

  if (!userRole) return null;

  const navItems = navItemsByRole[userRole];
  const roleInfo = roleLabels[userRole];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className={cn(
          'flex items-center gap-3',
          collapsed && 'justify-center'
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-lg truncate">Deeplinkers</h1>
              <Badge className={cn('mt-0.5', roleInfo.color)}>
                {roleInfo.label}
              </Badge>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url || 
                  (item.url !== `/${userRole}` && location.pathname.startsWith(item.url));
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <NavLink
                        to={item.url}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
                          isActive 
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                        )}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="h-5 min-w-[1.25rem] px-1.5">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && userName && (
          <div className="mb-3 text-sm text-muted-foreground truncate">
            {userName}
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          onClick={signOut}
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-foreground',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && 'Sign Out'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

import { useState, useMemo } from 'react';
import { useAdminStore } from './hooks/useAdminStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Info,
  Smartphone,
  LayoutDashboard,
  MessageCircle
} from 'lucide-react';
import { UserRole } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const { notifications } = useAdminStore();

  // --- Local State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [roleFilters, setRoleFilters] = useState<UserRole[]>(['admin', 'driver', 'field_ops']);
  const [channelFilters, setChannelFilters] = useState<string[]>(['sms', 'whatsapp', 'dashboard_log']);

  const allRoles: UserRole[] = ['admin', 'driver', 'field_ops'];
  const allChannels = ['sms', 'whatsapp', 'dashboard_log'];

  // --- Visual Helpers ---
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/15 text-purple-600 hover:bg-purple-500/25 border-purple-200';
      case 'field_ops': return 'bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-200';
      case 'driver': return 'bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25 border-yellow-200';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms': return <Smartphone className="h-3.5 w-3.5" />;
      case 'whatsapp': return <MessageCircle className="h-3.5 w-3.5" />;
      case 'dashboard_log': return <LayoutDashboard className="h-3.5 w-3.5" />;
      default: return <MessageSquare className="h-3.5 w-3.5" />;
    }
  };

  const formatChannelName = (channel: string) => {
    if (channel === 'dashboard_log') return 'System Log';
    return channel.toUpperCase();
  };

  // --- Handlers ---
  const toggleRoleFilter = (role: UserRole) => {
    setRoleFilters(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleChannelFilter = (channel: string) => {
    setChannelFilters(prev => 
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  // --- Filter & Sort Logic ---
  const processedNotifications = useMemo(() => {
    return notifications
      .filter(n => {
        // 1. Search Filter
        const matchesSearch = n.message_text.toLowerCase().includes(searchQuery.toLowerCase());
        
        // 2. Role Filter
        const matchesRole = roleFilters.includes(n.target_role);

        // 3. Channel Filter
        const matchesChannel = channelFilters.includes(n.channel);

        return matchesSearch && matchesRole && matchesChannel;
      })
      .sort((a, b) => {
        const dateA = new Date(a.sent_at).getTime();
        const dateB = new Date(b.sent_at).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [notifications, searchQuery, roleFilters, channelFilters, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notification Logs</h1>
            <p className="text-sm text-muted-foreground">Audit trail of all system outbound communications.</p>
          </div>
        </div>

        {/* Legend / Info */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 bg-secondary/30 px-3 py-2 rounded-lg border text-xs cursor-help">
                <Info className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-2">
                  <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> SMS</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> WhatsApp</span>
                  <span className="flex items-center gap-1"><LayoutDashboard className="w-3 h-3" /> Dashboard</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Communication channels used by the system</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-3 p-1">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search message content..."
            className="pl-9 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Target Role Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-card gap-2 justify-between md:justify-start">
                <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Target Role</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Filter by Target</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allRoles.map((role) => (
                <DropdownMenuCheckboxItem
                  key={role}
                  checked={roleFilters.includes(role)}
                  onCheckedChange={() => toggleRoleFilter(role)}
                  className="capitalize"
                >
                  {role.replace('_', ' ')}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Channel Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-card gap-2 justify-between md:justify-start">
                <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Channel</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuLabel>Filter by Channel</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {allChannels.map((channel) => (
                <DropdownMenuCheckboxItem
                  key={channel}
                  checked={channelFilters.includes(channel)}
                  onCheckedChange={() => toggleChannelFilter(channel)}
                >
                  {formatChannelName(channel)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="w-full md:w-[160px] bg-card">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Sort: Newest</SelectItem>
              <SelectItem value="oldest">Sort: Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Content */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[180px]">Time</TableHead>
                <TableHead className="w-[140px]">Target Role</TableHead>
                <TableHead className="w-[140px]">Channel</TableHead>
                <TableHead>Message Payload</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {processedNotifications.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No logs found matching your filters.
                        </TableCell>
                    </TableRow>
                ) : (
                    processedNotifications.map(n => (
                    <TableRow key={n.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(n.sent_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                            <Badge 
                                variant="outline" 
                                className={cn("capitalize whitespace-nowrap", getRoleBadgeVariant(n.target_role))}
                            >
                                {n.target_role.replace('_', ' ')}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                {getChannelIcon(n.channel)}
                                {formatChannelName(n.channel)}
                            </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-foreground/90">
                            {n.message_text}
                        </TableCell>
                    </TableRow>
                    ))
                )}
            </TableBody>
            </Table>
        </div>
      </Card>
    </div>
  );
}
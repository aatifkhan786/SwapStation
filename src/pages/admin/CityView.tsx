import { useState, useMemo } from 'react';
import { useAdminStore } from './hooks/useAdminStore';
import { StationCard } from '@/components/shared/StationCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { MapPin, Search, Filter, ArrowUpDown, Info } from 'lucide-react';

export default function CityView() {
  const { stations, metrics } = useAdminStore();
  
  // --- Local State ---
  const [city, setCity] = useState('Jakarta');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('health');
  // Default to showing all statuses
  const [statusFilters, setStatusFilters] = useState<string[]>(['healthy', 'attention', 'risk', 'critical']);

  // --- Handlers ---
  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // --- Filter & Sort Logic ---
  const processedStations = useMemo(() => {
    return stations
      .filter(s => {
        // 1. City Filter
        const matchesCity = s.city === city;
        
        // 2. Search Filter
        const matchesSearch = s.station_name.toLowerCase().includes(searchQuery.toLowerCase());

        // 3. Status Filter
        const matchesStatus = statusFilters.includes(s.status);

        return matchesCity && matchesSearch && matchesStatus;
      })
      .map(s => {
        const stationMetrics = metrics.find(m => m.station_id === s.id);
        return { ...s, metrics: stationMetrics };
      })
      .sort((a, b) => {
        if (sortBy === 'queue' && a.metrics && b.metrics) return b.metrics.queue_level - a.metrics.queue_level;
        if (sortBy === 'uptime' && a.metrics && b.metrics) return a.metrics.charger_uptime - b.metrics.charger_uptime;
        
        // Default: Sort by Health (Critical -> Risk -> Attention -> Healthy)
        const healthOrder: Record<string, number> = { critical: 0, risk: 1, attention: 2, healthy: 3 };
        return healthOrder[a.status] - healthOrder[b.status];
      });
  }, [stations, metrics, city, searchQuery, statusFilters, sortBy]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="text-primary" /> City Monitor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time telemetry for swap stations.
          </p>
        </div>

        {/* Legend / Info */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-3 bg-secondary/30 px-3 py-2 rounded-lg border text-xs cursor-help">
                <Info className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-2">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-critical animate-pulse"></span> Critical</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-risk"></span> Risk</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-attention"></span> Attention</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-healthy"></span> Healthy</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Critical: Outage or 0% Uptime</p>
              <p>Risk: High Queue or Equipment Failure</p>
              <p>Attention: Approaching Thresholds</p>
              <p>Healthy: Optimal Operations</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-3 p-1">
        
        {/* City Tabs */}
        <Tabs value={city} onValueChange={setCity} className="w-full xl:w-auto">
          <TabsList className="w-full xl:w-auto grid grid-cols-2 xl:flex">
            <TabsTrigger value="Jakarta">Jakarta</TabsTrigger>
            <TabsTrigger value="Surabaya">Surabaya</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col md:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search station name..."
              className="pl-9 bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-card gap-2 w-full md:w-auto justify-between md:justify-start">
                <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['critical', 'risk', 'attention', 'healthy'].map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={statusFilters.includes(status)}
                  onCheckedChange={() => toggleStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px] bg-card">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="health">Sort: Health (Risk First)</SelectItem>
              <SelectItem value="queue">Sort: Queue Length</SelectItem>
              <SelectItem value="uptime">Sort: Uptime (Low First)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {processedStations.length === 0 ? (
           <div className="col-span-full py-12 text-center border rounded-lg border-dashed text-muted-foreground">
             No stations match your current filters for {city}.
           </div>
        ) : (
          processedStations.map(station => (
            <StationCard 
              key={station.id}
              station={station}
              metrics={station.metrics}
              className="h-full"
              onClick={() => console.log('Station clicked:', station.station_name)}
            />
          ))
        )}
      </div>
    </div>
  );
}
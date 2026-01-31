import { useState, useMemo, useEffect, useContext } from 'react';
import { Station } from '@/lib/mock-data';
import { StationCard } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SettingsContext } from './Dashboard'; 
import { 
  MapPin, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Filter, 
  X, 
  Zap, 
  Info 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = ['healthy', 'attention', 'risk', 'critical'];
const DISTANCE_OPTIONS = [
    { label: 'All', value: 999 }, 
    { label: '< 2 km', value: 2 }, 
    { label: '< 5 km', value: 5 },
    { label: '< 10 km', value: 10 }
];

interface Props {
  stations: Station[];
  onSelect: (s: Station) => void;
  currentStationId: string;
  initialSearch?: string;
  onSearchClear?: () => void;
}

export default function NearbyView({ 
  stations, 
  onSelect, 
  currentStationId, 
  initialSearch, 
  onSearchClear 
}: Props) {
  const { settings } = useContext(SettingsContext);

  // 1. DEFINE ALL TRANSLATIONS FIRST
  const allTranslations: any = {
    en: {
      title: "Nearby Stations",
      searchPlaceholder: "Search station or area...",
      filters: "Filters",
      status: "Status",
      maxDist: "Max Distance",
      reset: "Reset Filters",
      legendTitle: "Status Legend",
      sortBy: "Sort by:",
      recommended: "Recommended",
      distance: "Distance",
      name: "Name",
      results: "found",
      noResults: "No stations match your search or filters.",
      legendHealthy: "Optimal operation. Low wait times.",
      legendAttention: "Moderate traffic and wait times.",
      legendRisk: "High congestion. Consider alternatives.",
      legendCritical: "Station offline or full. Avoid."
    },
    id: {
      title: "Stasiun Terdekat",
      searchPlaceholder: "Cari stasiun atau area...",
      filters: "Filter",
      status: "Status",
      maxDist: "Jarak Maksimal",
      reset: "Reset Filter",
      legendTitle: "Legenda Status",
      sortBy: "Urutkan:",
      recommended: "Direkomendasikan",
      distance: "Jarak",
      name: "Nama",
      results: "ditemukan",
      noResults: "Tidak ada stasiun yang cocok dengan filter.",
      legendHealthy: "Operasi optimal. Waktu tunggu singkat.",
      legendAttention: "Lalu lintas sedang.",
      legendRisk: "Kemacetan tinggi. Cari alternatif.",
      legendCritical: "Stasiun offline atau penuh. Hindari."
    }
  };

  // 2. PICK THE ACTIVE TRANSLATION (Fixed logic)
  const t = allTranslations[settings.language] || allTranslations.en;

  const STATUS_DEFINITIONS = [
    { label: 'Healthy', color: 'bg-green-500', desc: t.legendHealthy },
    { label: 'Attention', color: 'bg-yellow-500', desc: t.legendAttention },
    { label: 'Risk', color: 'bg-orange-500', desc: t.legendRisk },
    { label: 'Critical', color: 'bg-red-500', desc: t.legendCritical },
  ];

  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [sortBy, setSortBy] = useState('recommended');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState(999);

  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
      onSearchClear?.();
    }
  }, [initialSearch, onSearchClear]);

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    return [...stations]
      .filter(s => {
        if (s.id === currentStationId) return true;
        const matchesSearch = s.station_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             s.city.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(s.status);
        const matchesDistance = (s.distance || 0) <= maxDistance;
        return matchesSearch && matchesStatus && matchesDistance;
      })
      .sort((a, b) => {
        if (a.id === currentStationId) return -1;
        if (b.id === currentStationId) return 1;
        if (sortBy === 'recommended') {
          const weights: any = { healthy: 4, attention: 3, risk: 2, critical: 1 };
          if (weights[b.status] !== weights[a.status]) return weights[b.status] - weights[a.status];
          return (a.distance || 0) - (b.distance || 0);
        }
        const valA = a[sortBy as keyof Station] || 0;
        const valB = b[sortBy as keyof Station] || 0;
        return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
      });
  }, [searchTerm, sortBy, sortOrder, selectedStatuses, maxDistance, stations, currentStationId]);

  return (
    <div className="animate-in fade-in duration-700 max-w-6xl mx-auto pt-10 px-6 space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${settings.darkMode ? "text-white" : "text-gray-900"}`}>
          <MapPin className="h-6 w-6 text-primary" /> {t.title}
        </h2>
        <div className="flex gap-2 w-full md:w-[450px]">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${settings.darkMode ? "opacity-40" : "text-gray-400"}`} />
            <Input 
              placeholder={t.searchPlaceholder} 
              className={`pl-10 h-11 ${settings.darkMode ? "bg-secondary/10 border-white/5 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn(`h-11 px-5 gap-2 ${settings.darkMode ? "border-white/10" : "border-gray-300"}`, (selectedStatuses.length > 0 || maxDistance < 999) && "border-primary text-primary")}>
                  <Filter className="h-4 w-4" /> {t.filters}
                </Button>
            </PopoverTrigger>
            <PopoverContent className={`w-64 p-4 space-y-4 shadow-2xl ${settings.darkMode ? "bg-[#0a0c10] border-white/10" : "bg-white border-gray-200"}`} align="end">
                <div className="space-y-2">
                  <h4 className={`text-[10px] font-bold uppercase tracking-widest ${settings.darkMode ? "opacity-50" : "text-gray-500"}`}>
                    {t.status}
                  </h4>
                  {STATUS_OPTIONS.map(status => (
                    <div key={status} className="flex items-center gap-3">
                      <Checkbox 
                        id={status} 
                        checked={selectedStatuses.includes(status)} 
                        onCheckedChange={(checked) => setSelectedStatuses(prev => checked ? [...prev, status] : prev.filter(s => s !== status))} 
                      />
                      <label 
                        htmlFor={status} 
                        className={`text-sm capitalize cursor-pointer font-medium ${settings.darkMode ? "text-white" : "text-gray-700"}`}
                      >
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
                <div className={`pt-3 ${settings.darkMode ? "border-t border-white/5" : "border-t border-gray-200"}`}>
                  <h4 className={`text-[10px] font-bold uppercase tracking-widest ${settings.darkMode ? "opacity-50" : "text-gray-500"}`}>
                    {t.maxDist}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {DISTANCE_OPTIONS.map(opt => (
                      <Button 
                        key={opt.value} 
                        variant={maxDistance === opt.value ? 'secondary' : 'outline'} 
                        size="sm" 
                        className="h-8 text-[10px]" 
                        onClick={() => setMaxDistance(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full text-[11px] h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10" 
                  onClick={() => {setSelectedStatuses([]); setMaxDistance(999);}}
                >
                  <X className="h-3 w-3 mr-2" /> {t.reset}
                </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className={`p-6 rounded-2xl ${settings.darkMode ? "bg-secondary/10 border-white/5" : "bg-gray-50 border-gray-200"} space-y-6 sticky top-10`}>
            <h3 className={`text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 ${settings.darkMode ? "opacity-40" : "text-gray-500"}`}>
              <Info className="h-4 w-4" /> {t.legendTitle}
            </h3>
            <div className="space-y-6">
              {STATUS_DEFINITIONS.map(d => (
                <div key={d.label} className="space-y-1.5">
                  <div className={`flex items-center gap-2 font-bold text-sm ${settings.darkMode ? "text-white" : "text-gray-800"}`}>
                    <span className={cn("h-2 w-2 rounded-full", d.color)} /> {d.label}
                  </div>
                  <p className={`text-xs leading-relaxed font-medium ${settings.darkMode ? "opacity-60" : "text-gray-600"}`}>
                    {d.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className={`flex items-center gap-3 text-sm pb-4 overflow-x-auto no-scrollbar ${settings.darkMode ? "border-b border-white/5" : "border-b border-gray-200"}`}>
    <span className={`whitespace-nowrap ${settings.darkMode ? "opacity-40" : "text-gray-500"}`}>
      {t.sortBy}
    </span>
    
    {/* RECOMMENDED SORT BUTTON */}
    <Button 
      variant={sortBy === 'recommended' ? 'default' : 'ghost'} 
      size="sm" 
      className={cn(
        "rounded-full gap-2 font-semibold h-9 px-4",
        sortBy !== 'recommended' && !settings.darkMode && "text-black bg-white border border-gray-200 hover:bg-gray-50 hover:text-black"
      )} 
      onClick={() => setSortBy('recommended')}
    >
      <Zap className="h-3.5 w-3.5" /> {t.recommended}
    </Button>
    
    {/* DISTANCE SORT BUTTON */}
    <Button 
      variant={sortBy === 'distance' ? 'secondary' : 'ghost'} 
      size="sm" 
      className={cn(
        "rounded-full gap-2 h-9 px-4",
        sortBy !== 'distance' && !settings.darkMode && "text-black bg-white border border-gray-200 hover:bg-gray-50 hover:text-black"
      )} 
      onClick={() => toggleSort('distance')}
    >
      {t.distance} {sortBy === 'distance' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </Button>
    
    {/* NAME SORT BUTTON */}
    <Button 
      variant={sortBy === 'station_name' ? 'secondary' : 'ghost'} 
      size="sm" 
      className={cn(
        "rounded-full gap-2 h-9 px-4",
        sortBy !== 'station_name' && !settings.darkMode && "text-black bg-white border border-gray-200 hover:bg-gray-50 hover:text-black"
      )} 
      onClick={() => toggleSort('station_name')}
    >
      {t.name} {sortBy === 'station_name' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
    </Button>
    
    {/* RESULTS COUNT */}
    <div className={`ml-auto text-xs font-medium hidden md:block ${settings.darkMode ? "opacity-40" : "text-gray-500"}`}>
      {filteredAndSorted.length} {t.results}
    </div>
  </div>
          <div className="grid gap-4">
            {filteredAndSorted.length > 0 ? (
              filteredAndSorted.map(s => (
                <div key={s.id} className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {s.id === currentStationId && (
                    <Badge className="absolute -top-2 -left-2 z-10 bg-primary text-[10px] h-5 px-2 font-bold shadow-lg shadow-primary/20">
                      CURRENT
                    </Badge>
                  )}
                  <StationCard 
                    station={s} 
                    className={cn(s.id === currentStationId && "border-primary/50 bg-primary/5 opacity-90")} 
                    onClick={() => onSelect(s)} 
                  />
                </div>
              ))
            ) : (
              <div className={`py-24 text-center border-2 border-dashed rounded-3xl ${settings.darkMode ? "border-white/5 opacity-30" : "border-gray-300 opacity-50"}`}>
                <Search className="h-10 w-10 mx-auto mb-3" />
                <p className={`font-medium text-sm ${settings.darkMode ? "text-white" : "text-gray-700"}`}>
                  {t.noResults}
                </p>
                <Button 
                  variant="link" 
                  className="mt-2 text-xs" 
                  onClick={() => {setSearchTerm(''); setSelectedStatuses([]); setMaxDistance(999);}}
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
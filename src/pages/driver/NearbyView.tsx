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
        <h2 className="text-2xl font-bold flex items-center gap-2"><MapPin className="h-6 w-6 text-primary" /> {t.title}</h2>
        <div className="flex gap-2 w-full md:w-[450px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-40" />
            <Input placeholder={t.searchPlaceholder} className="pl-10 h-11 bg-secondary/10 border-white/5" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-11 px-5 gap-2 border-white/10", (selectedStatuses.length > 0 || maxDistance < 999) && "border-primary text-primary")}><Filter className="h-4 w-4" /> {t.filters}</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 bg-[#0a0c10] border-white/10 p-4 space-y-4 shadow-2xl" align="end">
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase opacity-50 mb-2 tracking-widest">{t.status}</h4>
                  {STATUS_OPTIONS.map(status => (
                    <div key={status} className="flex items-center gap-3">
                      <Checkbox id={status} checked={selectedStatuses.includes(status)} onCheckedChange={(checked) => setSelectedStatuses(prev => checked ? [...prev, status] : prev.filter(s => s !== status))} />
                      <label htmlFor={status} className="text-sm capitalize cursor-pointer font-medium">{status}</label>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-white/5">
                  <h4 className="text-[10px] font-bold uppercase opacity-50 mb-3 tracking-widest">{t.maxDist}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {DISTANCE_OPTIONS.map(opt => (
                      <Button key={opt.value} variant={maxDistance === opt.value ? 'secondary' : 'outline'} size="sm" className="h-8 text-[10px]" onClick={() => setMaxDistance(opt.value)}>{opt.label}</Button>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" className="w-full text-[11px] h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => {setSelectedStatuses([]); setMaxDistance(999);}}><X className="h-3 w-3 mr-2" /> {t.reset}</Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-secondary/10 border border-white/5 space-y-6 sticky top-10">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40 flex items-center gap-2"><Info className="h-4 w-4" /> {t.legendTitle}</h3>
            <div className="space-y-6">
              {STATUS_DEFINITIONS.map(d => (
                <div key={d.label} className="space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm"><span className={cn("h-2 w-2 rounded-full", d.color)} /> {d.label}</div>
                  <p className="text-xs opacity-60 leading-relaxed font-medium">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-3 text-sm pb-4 border-b border-white/5 overflow-x-auto no-scrollbar">
            <span className="opacity-40 whitespace-nowrap">{t.sortBy}</span>
            <Button variant={sortBy === 'recommended' ? 'default' : 'ghost'} size="sm" className="rounded-full gap-2 font-semibold h-9 px-4" onClick={() => setSortBy('recommended')}><Zap className="h-3.5 w-3.5" /> {t.recommended}</Button>
            <Button variant={sortBy === 'distance' ? 'secondary' : 'ghost'} size="sm" className="rounded-full gap-2 h-9 px-4" onClick={() => toggleSort('distance')}>{t.distance} {sortBy === 'distance' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}</Button>
            <Button variant={sortBy === 'station_name' ? 'secondary' : 'ghost'} size="sm" className="rounded-full gap-2 h-9 px-4" onClick={() => toggleSort('station_name')}>{t.name} {sortBy === 'station_name' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}</Button>
            <div className="ml-auto opacity-40 text-xs font-medium hidden md:block">{filteredAndSorted.length} {t.results}</div>
          </div>
          <div className="grid gap-4">
            {filteredAndSorted.length > 0 ? (
              filteredAndSorted.map(s => (
                <div key={s.id} className="relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {s.id === currentStationId && (<Badge className="absolute -top-2 -left-2 z-10 bg-primary text-[10px] h-5 px-2 font-bold shadow-lg shadow-primary/20">CURRENT</Badge>)}
                  <StationCard station={s} className={cn(s.id === currentStationId && "border-primary/50 bg-primary/5 opacity-90")} onClick={() => onSelect(s)} />
                </div>
              ))
            ) : (
              <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-30">
                <Search className="h-10 w-10 mx-auto mb-3" /><p className="font-medium text-sm">{t.noResults}</p>
                <Button variant="link" className="mt-2 text-xs" onClick={() => {setSearchTerm(''); setSelectedStatuses([]); setMaxDistance(999);}}>Clear all</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
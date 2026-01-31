import { useState, useMemo, useEffect, useContext } from 'react';
import { Notification } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SettingsContext } from './Dashboard'; 
import { Bell, AlertCircle, CheckCircle2, Info, Navigation, Trash2, X, MessageSquare, Smartphone, Layout, Search, Filter, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  notifications: Notification[];
  onReroute: (name: string) => void;
  onViewStation: (name: string) => void;
  onCountUpdate?: (count: number) => void;
}

export default function NotificationsView({ notifications: initialNotifs, onReroute, onViewStation, onCountUpdate }: Props) {
  const { settings } = useContext(SettingsContext);

  // 1. DEFINE TRANSLATIONS FIRST
  const allTranslations: any = {
    en: {
      title: "Recent Updates",
      subtitle: "Real-time alerts and messages from system stations.",
      search: "Search message content...",
      types: "All Types",
      channels: "All Channels",
      sort: "Sort: Newest",
      noResults: "No communications found matching filters.",
      reroute: "Reroute Now",
      view: "View Station"
    },
    id: {
      title: "Pembaruan Terkini",
      subtitle: "Peringatan dan pesan real-time dari stasiun sistem.",
      search: "Cari konten pesan...",
      types: "Semua Tipe",
      channels: "Semua Saluran",
      sort: "Urutkan: Terbaru",
      noResults: "Tidak ada komunikasi yang ditemukan.",
      reroute: "Ubah Rute",
      view: "Lihat Stasiun"
    }
  };

  const t = allTranslations[settings.language] || allTranslations.en;

  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [notifs, setNotifs] = useState<Notification[]>(initialNotifs);

  useEffect(() => {
    if (onCountUpdate) onCountUpdate(notifs.length);
  }, [notifs, onCountUpdate]);

  const getStationFromName = (text: string) => {
    const names = ["Pondok Indah", "Kemang Square", "PIK Boulevard", "Sudirman Central", "Thamrin Plaza", "Kelapa Gading"];
    return names.find(name => text.includes(name)) || "";
  };

  const isAlertNotif = (text: string) => {
    const textLower = text.toLowerCase();
    return textLower.includes('offline') || textLower.includes('high queue') || textLower.includes('low battery');
  };

  const getCategoryDetails = (n: Notification) => {
    const text = n.message_text.toLowerCase();
    const isAlert = isAlertNotif(text);
    const channelIcon = n.channel === 'whatsapp' ? <MessageSquare className="h-3 w-3" /> : n.channel === 'sms' ? <Smartphone className="h-3 w-3" /> : <Layout className="h-3 w-3" />;

    if (settings.darkMode) {
      if (isAlert) return { type: 'alert', channelIcon, icon: <AlertCircle className="h-5 w-5 text-red-500" />, border: 'border-l-red-500', bg: 'bg-red-500/5' };
      if (text.includes('cleared') || text.includes('normally')) return { type: 'success', channelIcon, icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, border: 'border-l-green-500', bg: 'bg-green-500/5' };
      return { type: 'message', channelIcon, icon: <Info className="h-5 w-5 text-blue-500" />, border: 'border-l-blue-500', bg: 'bg-blue-500/5' };
    } else {
      // Light mode colors
      if (isAlert) return { type: 'alert', channelIcon, icon: <AlertCircle className="h-5 w-5 text-red-600" />, border: 'border-l-red-600', bg: 'bg-red-50' };
      if (text.includes('cleared') || text.includes('normally')) return { type: 'success', channelIcon, icon: <CheckCircle2 className="h-5 w-5 text-green-600" />, border: 'border-l-green-600', bg: 'bg-green-50' };
      return { type: 'message', channelIcon, icon: <Info className="h-5 w-5 text-blue-600" />, border: 'border-l-blue-600', bg: 'bg-blue-50' };
    }
  };

  const filteredAndSorted = useMemo(() => {
    return [...notifs]
      .filter(n => {
        const details = getCategoryDetails(n);
        const matchesSearch = n.message_text.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesChannel = channelFilter === 'all' || n.channel === channelFilter;
        let matchesType = true;
        if (typeFilter === 'alert') matchesType = details.type === 'alert';
        if (typeFilter === 'message') matchesType = details.type !== 'alert';
        return matchesSearch && matchesChannel && matchesType;
      })
      .sort((a, b) => {
        const dateA = new Date(a.sent_at).getTime();
        const dateB = new Date(b.sent_at).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [searchTerm, channelFilter, typeFilter, sortOrder, notifs]);

  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto pt-8 px-6 space-y-8 pb-20">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <div className={`h-12 w-12 rounded-xl ${settings.darkMode ? "bg-primary/10 border-primary/20" : "bg-blue-100 border-blue-200"} flex items-center justify-center border shadow-lg shadow-primary/5`}>
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${settings.darkMode ? "text-white" : "text-gray-900"}`}>
              {t.title}
            </h1>
            <p className={`text-sm mt-1 ${settings.darkMode ? "text-muted-foreground" : "text-gray-600"}`}>
              {t.subtitle}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-4 border rounded-xl px-4 py-2 text-[11px] font-medium ${settings.darkMode ? "bg-secondary/10 border-white/5 text-muted-foreground" : "bg-gray-100 border-gray-300 text-gray-600"}`}>
            <div className={`flex items-center gap-1.5 pr-3 ${settings.darkMode ? "border-r border-white/10" : "border-r border-gray-300"}`}>
              <Info className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> SMS</div>
            <div className="flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> WhatsApp</div>
            <div className="flex items-center gap-1.5"><Layout className="h-3.5 w-3.5" /> Dashboard</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${settings.darkMode ? "text-white-400" : "text-white-400"}`} />
          <Input 
            placeholder={t.search} 
            className={`pl-10 h-11 ${settings.darkMode ? "bg-secondary/10 border-white/5 text-white" : "bg-black border-gray-300 text-white-400"}`} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <Select onValueChange={setTypeFilter} defaultValue="all">
          <SelectTrigger className={`w-[180px] h-11 ${settings.darkMode ? "bg-secondary/10 border-white/5" : "bg-black border-gray-300"}`}>
            <Filter className="h-4 w-4 mr-2 opacity-100" />
            <SelectValue placeholder={t.types} />
          </SelectTrigger>
          <SelectContent className={settings.darkMode ? "bg-[#0a0c10] border-white/10" : "bg-black border-gray-200"}>
            <SelectItem value="all">{t.types}</SelectItem>
            <SelectItem value="alert">Alerts Only</SelectItem>
            <SelectItem value="message">Messages Only</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setChannelFilter} defaultValue="all">
          <SelectTrigger className={`w-[180px] h-11 ${settings.darkMode ? "bg-secondary/10 border-white/5" : "bg-black border-gray-300"}`}>
            <Filter className="h-4 w-4 mr-2 opacity-100" />
            <SelectValue placeholder={t.channels} />
          </SelectTrigger>
          <SelectContent className={settings.darkMode ? "bg-[#0a0c10] border-white/10" : "bg-black border-gray-200"}>
            <SelectItem value="all">{t.channels}</SelectItem>
            <SelectItem value="dashboard_log">Dashboard</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setSortOrder} defaultValue="newest">
          <SelectTrigger className={`w-[180px] h-11 ${settings.darkMode ? "bg-secondary/10 border-white/5" : "bg-black border-gray-300"}`}>
            <ArrowUpDown className="h-4 w-4 mr-2 opacity-100" />
            <SelectValue placeholder={t.sort} />
          </SelectTrigger>
          <SelectContent className={settings.darkMode ? "bg-[#0a0c10] border-white/10" : "bg-black border-gray-200"}>
            <SelectItem value="newest">{t.sort}</SelectItem>
            <SelectItem value="oldest">Sort: Oldest</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="h-11 w-11 text-red-900" onClick={() => setNotifs([])}>
          <Trash2 className="h-5 w-5 opacity-100" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-320px)] pr-4">
        <div className="space-y-4 pb-10">
          {filteredAndSorted.map((n) => {
            const details = getCategoryDetails(n);
            const station = getStationFromName(n.message_text);
            return (
              <Card key={n.id} className={cn("group relative border-l-4 transition-all hover:opacity-90", details.border, details.bg)}>
                <Button variant="ghost" size="icon" className={`absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 ${settings.darkMode ? "" : "hover:bg-gray-200"}`} onClick={() => setNotifs(prev => prev.filter(item => item.id !== n.id))}>
                  <X className={`h-4 w-4 ${settings.darkMode ? "opacity-50" : "text-gray-600"}`} />
                </Button>
                <div className="p-5 flex gap-5">
                  <div className="mt-1">{details.icon}</div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center pr-6">
                      <Badge variant="outline" className={`text-[10px] uppercase font-mono tracking-widest h-5 flex items-center gap-1.5 ${settings.darkMode ? "opacity-60" : "bg-gray-100 text-gray-600"}`}>
                        {details.channelIcon}{n.channel.replace('_', ' ')}
                      </Badge>
                      <span className={`text-[11px] font-mono ${settings.darkMode ? "text-muted-foreground" : "text-gray-500"}`}>
                        {new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed pr-8 font-medium ${settings.darkMode ? "text-white" : "text-gray-800"}`}>
                      {n.message_text}
                    </p>
                    {station && details.type === 'alert' && (
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" className="h-8 text-[11px] gap-2 rounded-lg" onClick={() => onReroute(station)}>
                          <Navigation className="h-3 w-3" /> {t.reroute}
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-[11px] rounded-lg" onClick={() => onViewStation(station)}>
                          {t.view}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {filteredAndSorted.length === 0 && (
             <div className={`py-24 text-center border-2 border-dashed rounded-3xl ${settings.darkMode ? "border-white/5 opacity-20 text-white" : "border-gray-300 opacity-50 text-gray-700"}`}>
               <Bell className="h-12 w-12 mx-auto mb-4" />
               <p>{t.noResults}</p>
             </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
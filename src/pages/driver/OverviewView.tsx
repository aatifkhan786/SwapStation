import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Station, StationMetrics } from '@/lib/mock-data';
import { StatusPill } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SettingsContext } from './Dashboard'; 
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Battery, 
  Users, 
  Zap, 
  Navigation2,
  Map as MapIcon,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  station: Station;
  metrics: StationMetrics;
  onAutoReroute: () => void;
}

export default function OverviewView({ station, metrics, onAutoReroute }: Props) {
  const { settings } = useContext(SettingsContext);
  const navigate = useNavigate();

  // 1. TRANSLATIONS (Declared first to avoid hoisting errors)
  const t: any = {
    en: {
      batteryLabel: "Vehicle Battery Percentage",
      rerouteBtn: "Reroute Me",
      currentStation: "My Current Station",
      wait: "Wait",
      available: "Available",
      queue: "Queue",
      startNav: "Start Navigation",
      routePreview: "Route Preview",
      estDist: "Estimated Distance",
      estTime: "Estimated Time",
      adTitle: "Sponsored Ad",
      adBody: "Upgrade to Pro to remove this banner.",
      km: "km",
      mins: "mins"
    },
    id: {
      batteryLabel: "Persentase Baterai Kendaraan",
      rerouteBtn: "Ubah Rute",
      currentStation: "Stasiun Saya Saat Ini",
      wait: "Tunggu",
      available: "Tersedia",
      queue: "Antrean",
      startNav: "Mulai Navigasi",
      routePreview: "Pratinjau Rute",
      estDist: "Estimasi Jarak",
      estTime: "Estimasi Waktu",
      adTitle: "Iklan Sponsor",
      adBody: "Upgrade ke Pro untuk menghapus iklan ini.",
      km: "km",
      mins: "menit"
    }
  }[settings.language] || {
      batteryLabel: "Vehicle Battery Percentage",
      rerouteBtn: "Reroute Me",
      currentStation: "My Current Station",
      wait: "Wait",
      available: "Available",
      queue: "Queue",
      startNav: "Start Navigation",
      routePreview: "Route Preview",
      estDist: "Estimated Distance",
      estTime: "Estimated Time",
      adTitle: "Sponsored Ad",
      adBody: "Upgrade to Pro to remove this banner.",
      km: "km",
      mins: "mins"
  };

  const [batteryLevel, setBatteryLevel] = useState<string>("45");

  return (
    <div className="animate-in fade-in duration-700 max-w-3xl mx-auto pt-10 pb-20 px-4 space-y-6">
      
      {/* 0. PRO AD BANNER */}
      {!settings.isPremium && (
        <Card className={`shadow-2xl overflow-hidden ${settings.darkMode ? "bg-primary/5 border-dashed border-primary/20" : "bg-blue-50 border-dashed border-blue-200"}`}>
          <div className="p-4 relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                  <div className={`p-2 ${settings.darkMode ? "bg-primary/10" : "bg-blue-100"} rounded-full`}>
                    <Crown className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t.adTitle}</p>
                    <p className={`text-sm ${settings.darkMode ? "opacity-80" : "text-gray-700"}`}>{t.adBody}</p>
                  </div>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-[11px] border-primary/20" onClick={() => navigate('/driver/settings')}>Upgrade</Button>
            </div>
            <div className="absolute top-0 right-0 p-2 opacity-5"><Crown className="h-12 w-12 text-primary" /></div>
          </div>
        </Card>
      )}

      {/* 1. BATTERY STATUS BAR */}
      <Card className={`shadow-2xl overflow-hidden ${settings.darkMode ? "bg-secondary/5 border-white/5" : "bg-white border-gray-200"}`}>
        <CardContent className="p-5 flex flex-col md:flex-row items-center gap-5">
          <div className="flex items-center gap-4 flex-1 w-full">
            <div className={`p-3 rounded-xl ${settings.darkMode ? "bg-primary/10 border border-primary/20" : "bg-blue-100 border border-blue-200"}`}>
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <label className={`text-[10px] uppercase font-bold tracking-widest block mb-1.5 ${settings.darkMode ? "text-muted-foreground" : "text-gray-500"}`}>
                {t.batteryLabel}
              </label>
              <div className="flex items-center gap-3">
                <div className="relative">
                    <Input 
                      type="number" 
                      value={batteryLevel} 
                      onChange={(e) => setBatteryLevel(e.target.value)} 
                      className={`w-24 h-10 font-black text-xl text-center pr-2 ${settings.darkMode ? "bg-background border-white/10 text-white" : "bg-white border-gray-300 text-gray-900"}`} 
                      max="100" 
                      min="0" 
                    />
                    <span className={`absolute right-2 top-1/2 -translate-y-1/2 font-bold ${settings.darkMode ? "text-muted-foreground opacity-50" : "text-gray-400"}`}>
                      %
                    </span>
                </div>
                <div className={`flex-1 h-2 rounded-full overflow-hidden hidden sm:block ${settings.darkMode ? "bg-white/5" : "bg-gray-200"}`}>
                    <div className={cn("h-full transition-all duration-1000 ease-out", Number(batteryLevel) < 20 ? "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]")} style={{ width: `${batteryLevel}%` }} />
                </div>
              </div>
            </div>
          </div>
          <Button onClick={onAutoReroute} className="w-full md:w-auto h-12 px-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm uppercase tracking-wider shadow-xl shadow-primary/20 transition-transform active:scale-95">
            <Navigation2 className="h-4 w-4" />{t.rerouteBtn}
          </Button>
        </CardContent>
      </Card>

      {/* 2. MAIN CURRENT STATION CARD */}
      <Card className={`overflow-hidden shadow-2xl ${settings.darkMode ? "border-white/5 bg-secondary/5" : "border-gray-200 bg-gradient-to-b from-white to-gray-50"}`}>
        <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className={`text-[10px] font-bold uppercase tracking-[0.2em] ${settings.darkMode ? "text-muted-foreground" : "text-gray-500"}`}>
                {t.currentStation}
              </CardTitle>
              <StatusPill status={station.status} />
            </div>
        </CardHeader>
        <CardContent className="space-y-8 py-6">
          <div>
            <h2 className={`text-4xl md:text-5xl font-black tracking-tighter ${settings.darkMode ? "text-white" : "text-gray-900"}`}>
              {station.station_name}
            </h2>
            <div className={`flex items-center gap-2 mt-3 font-medium ${settings.darkMode ? "text-muted-foreground" : "text-gray-600"}`}>
              <MapPin className="h-4 w-4 text-primary" />
              <span>{station.city} • {station.distance} {t.km} away</span>
            </div>
          </div>
          <div className={`grid grid-cols-3 gap-4 border-y py-8 ${settings.darkMode ? "border-white/5" : "border-gray-200"}`}>
            <div className="text-center space-y-1">
              <span className={`text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 ${settings.darkMode ? "text-muted-foreground" : "text-gray-500"}`}>
                <Clock className="h-3 w-3" /> {t.wait}
              </span>
              <p className={`text-3xl font-black ${settings.darkMode ? "text-white" : "text-gray-900"}`}>
                ~{Math.round(metrics.queue_level * 2.5)}m
              </p>
            </div>
            <div className={`text-center space-y-1 border-x ${settings.darkMode ? "border-white/5" : "border-gray-200"}`}>
              <span className={`text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 ${settings.darkMode ? "text-muted-foreground" : "text-gray-500"}`}>
                <Battery className="h-3 w-3" /> {t.available}
              </span>
              <p className="text-3xl font-black text-green-400">{metrics.charged_inventory}</p>
            </div>
            <div className="text-center space-y-1">
              <span className={`text-[10px] uppercase font-bold flex items-center justify-center gap-1.5 ${settings.darkMode ? "text-muted-foreground" : "text-gray-500"}`}>
                <Users className="h-3 w-3" /> {t.queue}
              </span>
              <p className={`text-3xl font-black ${settings.darkMode ? "text-white" : "text-gray-900"}`}>
                {metrics.queue_level}
              </p>
            </div>
          </div>
          <Button className="w-full h-16 text-xl font-black shadow-2xl shadow-primary/30 group" size="lg">
            <Navigation className="h-6 w-6 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            {t.startNav}
          </Button>
        </CardContent>
      </Card>

      {/* 3. MAP ROUTE SECTION */}
      <div className="space-y-4 pt-4">
        <h3 className={`text-[11px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 px-2 ${settings.darkMode ? "opacity-50" : "text-gray-500"}`}>
          <MapIcon className="h-4 w-4" /> {t.routePreview}
        </h3>
        <Card className={`overflow-hidden h-[340px] relative shadow-2xl group cursor-crosshair ${settings.darkMode ? "border-white/5" : "border-gray-300"}`}>
          <div className={`absolute inset-0 ${settings.darkMode ? "bg-[#0a0c12]" : "bg-gradient-to-b from-gray-50 to-gray-100"}`} />
          <div className={`absolute inset-0 ${settings.darkMode ? "opacity-20" : "opacity-10"} bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]`} />
          <svg className="absolute inset-0 w-full h-full p-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M 10 90 C 30 40, 70 60, 90 10" fill="none" stroke="var(--primary)" strokeWidth="0.8" strokeDasharray="2 1" className="animate-dash" />
            <circle cx="10" cy="90" r="1.5" fill="#3b82f6" />
            <circle cx="10" cy="90" r="3" fill="#3b82f6" fillOpacity="0.2" className="animate-ping" />
            <circle cx="90" cy="10" r="2" fill="#10b981" />
          </svg>
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
              <div className={`p-4 rounded-2xl shadow-2xl space-y-2 min-w-[180px] backdrop-blur-xl ${settings.darkMode ? "bg-background/90 border border-white/10" : "bg-white/90 border border-gray-200"}`}>
                 <div className="flex justify-between gap-6 items-center">
                   <span className={`text-[10px] font-bold uppercase ${settings.darkMode ? "opacity-40" : "text-gray-500"}`}>
                     {t.estDist}
                   </span>
                   <span className={`font-black text-sm ${settings.darkMode ? "text-white" : "text-gray-900"}`}>
                     {station.distance} {t.km}
                   </span>
                 </div>
                 <div className="flex justify-between gap-6 items-center">
                   <span className={`text-[10px] font-bold uppercase ${settings.darkMode ? "opacity-40" : "text-gray-500"}`}>
                     {t.estTime}
                   </span>
                   <span className="font-black text-sm text-primary">~14 {t.mins}</span>
                 </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button size="icon" variant="secondary" className="rounded-xl h-10 w-10 shadow-lg">
                  <MapPin className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="secondary" className="rounded-xl h-10 w-10 shadow-lg">
                  <Navigation2 className="h-4 w-4" />
                </Button>
              </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className={`text-center space-y-2 ${settings.darkMode ? "bg-background/60 backdrop-blur-sm" : "bg-white/60 backdrop-blur-sm"}`}>
                <MapIcon className="h-8 w-8 mx-auto opacity-20" />
                <p className={`text-[10px] font-black uppercase tracking-[0.4em] px-6 py-3 rounded-full shadow-2xl ${settings.darkMode ? "bg-white text-black" : "bg-gray-900 text-white"}`}>
                  Live Map View
                </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
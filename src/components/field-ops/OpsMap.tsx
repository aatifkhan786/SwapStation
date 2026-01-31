import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Map as MapIcon, Activity, Zap, AlertTriangle, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import { mockStations, generateMockMetrics, StationStatus } from '@/lib/mock-data';

const { BaseLayer } = LayersControl;

/* ---------------- Advanced Status UI Logic (STAYED SAME) ---------------- */
const statusConfig = {
  healthy: { color: '#10b981', label: 'Optimal', icon: '✅' },
  attention: { color: '#3b82f6', label: 'Monitor', icon: '🔵' },
  risk: { color: '#f59e0b', label: 'At Risk', icon: '⚠️' },
  critical: { color: '#ef4444', label: 'Failure', icon: '🚨' },
};

/* ---------------- Custom Droplet Marker (STAYED SAME) ---------------- */
const getIcon = (status: StationStatus, isSelected: boolean) => {
  const config = statusConfig[status];
  const size = isSelected ? 42 : 34;

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <div style="
          width: 100%; height: 100%;
          background: ${config.color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          box-shadow: 0 0 15px ${config.color}66, 0 4px 10px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="width: 10px; height: 10px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
        </div>
        ${status === 'critical' ? '<div class="ping"></div>' : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

/* ---------------- 🔴 Truly Dynamic Map Controller ---------------- */
const MapController = ({ stations, selectedStationId }: { stations: any[], selectedStationId?: string | null }) => {
  const map = useMap();

  React.useEffect(() => {
    if (selectedStationId) {
      // अगर टिकट सिलेक्टेड है, तो वहां ज़ूम करो
      const active = stations.find(s => s.id === selectedStationId);
      if (active) map.flyTo([active.lat, active.lng], 16, { duration: 1.2 });
    } else if (stations.length > 0) {
      // 🌟 MAGIC: डेटा के सभी स्टेशन्स को स्क्रीन पर फिट कर दो
      const bounds = L.latLngBounds(stations.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50], animate: true });
    }
  }, [stations, selectedStationId, map]);

  return null;
};

export function OpsMap({ selectedStationId }: { selectedStationId?: string | null }) {
  // 🌟 डेटा से Unique शहरों की लिस्ट निकालें
  const uniqueCities = Array.from(new Set(mockStations.map(s => s.city)));
  
  // जकार्ता की जगह डेटा का पहला स्टेशन सेंटर बनेगा (सिर्फ शुरुआती लोड के लिए)
  const defaultCenter: [number, number] = mockStations.length > 0 
    ? [mockStations[0].lat, mockStations[0].lng] 
    : [-6.2088, 106.8456];

  const [mapCenter, setMapCenter] = React.useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = React.useState(12);

  const activeStation = mockStations.find((s) => s.id === selectedStationId);

  React.useEffect(() => {
    if (activeStation) {
      setMapCenter([activeStation.lat, activeStation.lng]);
      setMapZoom(16);
    }
  }, [activeStation]);

  return (
    <div className="relative w-full h-full rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-slate-100">
      
      {/* Dynamic Marker Pings (STAYED SAME) */}
      <style>{`
        .ping {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          border-radius: 50%; background: #ef4444;
          animation: map-ping 1.5s infinite; opacity: 0.8; z-index: -1;
        }
        @keyframes map-ping { 75%, 100% { transform: scale(2.8); opacity: 0; } }
        .leaflet-popup-content-wrapper { border-radius: 20px; padding: 0; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .leaflet-popup-tip { background: white; }
      `}</style>

      <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} attributionControl={false} className="w-full h-full">
        {/* Dynamic Controller instead of old one */}
        <MapController stations={mockStations} selectedStationId={selectedStationId} />

        <LayersControl position="topright">
          <BaseLayer checked name="Google Roadmap">
            <TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" />
          </BaseLayer>
          <BaseLayer name="Google Satellite">
            <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
          </BaseLayer>
          <BaseLayer name="Google Hybrid">
            <TileLayer url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}" />
          </BaseLayer>
        </LayersControl>

        {mockStations.map((station) => {
          const metrics = generateMockMetrics(station.id);
          const config = statusConfig[station.status];

          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={getIcon(station.status, station.id === selectedStationId)}
            >
              <Popup closeButton={false} minWidth={220}>
                <div className="p-0 overflow-hidden">
                  <div className={cn("p-3 text-white flex justify-between items-center", station.status === 'critical' ? 'bg-red-500' : 'bg-slate-900')}>
                    <span className="text-[10px] font-bold tracking-tighter uppercase">Station Terminal</span>
                    <Badge variant="outline" className="text-white border-white/30 text-[9px]">{config.label}</Badge>
                  </div>
                  
                  <div className="p-4 space-y-4 bg-white">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{station.station_name}</h3>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{station.city}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                      <div className="space-y-0.5">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Uptime</p>
                        <p className="text-sm font-black text-emerald-600 flex items-center gap-1">
                          <Activity size={12} /> {metrics.charger_uptime}%
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] uppercase font-bold text-slate-400">Queue</p>
                        <p className="text-sm font-black text-slate-900 flex items-center gap-1">
                          <Zap size={12} className="text-amber-500" /> {metrics.queue_level} Veh.
                        </p>
                      </div>
                    </div>

                    <Button size="sm" className="w-full bg-slate-900 hover:bg-black text-[10px] h-8 rounded-lg font-bold">
                      OPEN DIAGNOSTICS
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* --- Truly Dynamic UI Overlay (UI STAYED SAME) --- */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
        <Badge className="bg-white/95 backdrop-blur shadow-xl border-none text-slate-900 px-4 py-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase">
            Grid Monitor: {uniqueCities.join(' / ')}
          </span>
        </Badge>
        
        {/* 🌟 Dynamic Jump Buttons: Cities are now pulled from data */}
        <div className="flex flex-wrap gap-2 max-w-[220px]">
          {uniqueCities.map(city => (
            <Button 
              key={city}
              variant="secondary" size="sm" 
              className="h-7 px-3 text-[9px] font-bold bg-white/80 backdrop-blur shadow-sm hover:bg-white"
              onClick={() => { 
                const firstInCity = mockStations.find(s => s.city === city);
                if (firstInCity) {
                  setMapCenter([firstInCity.lat, firstInCity.lng]);
                  setMapZoom(12);
                }
              }}
            >
              {city.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-3">
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-xl bg-white text-slate-900 shadow-2xl border border-slate-200"
          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${mapCenter[0]},${mapCenter[1]}`, '_blank')}
        >
          <Navigation size={20} />
        </Button>
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-xl bg-slate-900 text-white shadow-2xl transition-transform active:scale-95"
          onClick={() => {
            // Reset map to fit all data
            const bounds = L.latLngBounds(mockStations.map(s => [s.lat, s.lng]));
            setMapCenter(defaultCenter); 
            setMapZoom(11);
          }}
        >
          <Crosshair size={20} />
        </Button>
      </div>
    </div>
  );
}
import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Map as MapIcon, Activity, Zap, AlertTriangle, Crosshair, LocateFixed, Car, ArrowRightCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import { mockStations, generateMockMetrics, StationStatus } from '@/lib/mock-data';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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

/* ---------------- Custom User Current Location Marker (DYNAMICALLY ROTATING) ---------------- */
// This function will generate the icon based on current heading
const getUserLiveLocationIcon = (heading: number | null) => {
  const rotationStyle = heading !== null && !isNaN(heading) ? `transform: rotate(${heading}deg);` : '';

  return L.divIcon({
    className: 'custom-user-location-marker',
    html: `
      <div style="
        position: relative;
        background: #3b82f6; /* Blue */
        width: 36px; height: 36px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 15px #3b82f666, 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="lucide lucide-arrow-up-circle text-white" style="${rotationStyle}">
            <circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18], // Center of the marker
  });
};


/* ---------------- 🔴 Dynamic Map Controller ---------------- */
const MapController = ({ stations, selectedStationId, userLiveLocation, enteredSourceLocation, isRoutingActive }: { stations: any[], selectedStationId?: string | null, userLiveLocation: [number, number] | null, enteredSourceLocation: [number, number] | null, isRoutingActive: boolean }) => {
  const map = useMap();

  React.useEffect(() => {
    let pointsToFit: L.LatLngTuple[] = [];

    // Prioritize fitting live location if routing is active, otherwise fit source
    const currentSource = isRoutingActive ? userLiveLocation : (userLiveLocation || enteredSourceLocation);

    if (currentSource) {
      pointsToFit.push(currentSource);
    }

    if (selectedStationId) {
      const active = stations.find(s => s.id === selectedStationId);
      if (active) pointsToFit.push([active.lat, active.lng]);
    }

    if (pointsToFit.length > 0) {
      const bounds = L.latLngBounds(pointsToFit);
      
      // If routing is active and user is moving, keep map centered on user
      // Or if there's only one point (user's location), center on it
      if (isRoutingActive && userLiveLocation) {
        map.flyTo(userLiveLocation, map.getZoom() || 15, { duration: 0.8 });
      } else if (pointsToFit.length === 1 && currentSource) {
         map.flyTo(currentSource, 15, { duration: 0.8 });
      }
       else {
        map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.2 });
      }
    } else if (stations.length > 0) {
      const bounds = L.latLngBounds(stations.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.2 });
    }
  }, [stations, selectedStationId, userLiveLocation, enteredSourceLocation, isRoutingActive, map]);

  return null;
};

export function OpsMap({ selectedStationId }: { selectedStationId?: string | null }) {
  const uniqueCities = Array.from(new Set(mockStations.map(s => s.city)));
  
  const defaultCenter: [number, number] = mockStations.length > 0 
    ? [mockStations[0].lat, mockStations[0].lng] 
    : [-6.2088, 106.8456];

  const [mapCenter, setMapCenter] = React.useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = React.useState(12);
  const [userLiveLocation, setUserLiveLocation] = React.useState<[number, number] | null>(null); // For watchPosition
  const [userLiveHeading, setUserLiveHeading] = React.useState<number | null>(null); // For live heading
  const [enteredSourceLocation, setEnteredSourceLocation] = React.useState<[number, number] | null>(null); // For manual address input
  const [sourceAddressInput, setSourceAddressInput] = React.useState<string>(''); // User input for address
  const [isRoutingActive, setIsRoutingActive] = React.useState(false); // New state to manage routing mode

  const activeStation = mockStations.find((s) => s.id === selectedStationId);

  // --- Geolocation Watcher ---
  React.useEffect(() => {
    let watchId: number | null = null;

    const successHandler = (position: GeolocationPosition) => {
      const { latitude, longitude, heading } = position.coords;
      setUserLiveLocation([latitude, longitude]);
      setUserLiveHeading(heading); // Capture heading

      if(isRoutingActive){ // If routing is active, update map center to follow user
        setMapCenter([latitude, longitude]);
        setMapZoom(mapZoom => Math.max(mapZoom, 15)); // Keep a reasonable zoom level
      }
       toast.info("Live location updated!", { duration: 1000, dismissible: false, id: 'live-loc-toast' });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      console.error("Geolocation watch error:", error);
      toast.error("Failed to watch location. Please allow location access or check GPS.", { id: 'live-loc-toast-error' });
      setUserLiveLocation(null);
      setUserLiveHeading(null);
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 1000 // Accept a cached position if it's no older than 1 second
      });
    } else {
      toast.error("Geolocation is not supported by your browser.", { id: 'live-loc-toast-browser-support' });
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        toast.info("Live location tracking stopped.");
      }
    };
  }, [isRoutingActive]); // Re-run effect if routing state changes

  // Update map center/zoom if an active station is selected
  React.useEffect(() => {
    if (activeStation && !isRoutingActive) { // Only set if not actively routing
      setMapCenter([activeStation.lat, activeStation.lng]);
      setMapZoom(16);
    }
  }, [activeStation, isRoutingActive]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    if (userLiveLocation) {
      setEnteredSourceLocation(userLiveLocation);
      setSourceAddressInput('Your Current Live Location');
      toast.success("Using your current live location as source!");
    } else {
      toast.info("Attempting to get your current location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setEnteredSourceLocation([latitude, longitude]);
          setSourceAddressInput('Your Current Live Location');
          toast.success("Current location detected and set as source!");
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Failed to get current location. Please allow location access.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  const handleSetSourceAddress = async () => {
    if (!sourceAddressInput.trim()) {
      setEnteredSourceLocation(null);
      return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(sourceAddressInput)}&addressdetails=1&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setEnteredSourceLocation([lat, lon]);
        if (!activeStation && !isRoutingActive) { 
            setMapCenter([lat, lon]);
            setMapZoom(15);
        }
        toast.success(`Source set to: ${sourceAddressInput}`);
      } else {
        setEnteredSourceLocation(null);
        toast.error("Could not find location for the entered address. Try a more specific address.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setEnteredSourceLocation(null);
      toast.error("Error finding address. Please try again.");
    }
  };

  const clearSourceLocation = () => {
    setEnteredSourceLocation(null);
    setSourceAddressInput('');
    setIsRoutingActive(false); // Stop routing when source is cleared
    toast.info("Source location cleared.");
  };

  // Determine which source location to use for display/routing: Live, then Entered
  const currentSourceForMap = userLiveLocation || enteredSourceLocation;

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
        {/* Dynamic Controller to fit bounds */}
        <MapController 
          stations={mockStations} 
          selectedStationId={selectedStationId} 
          userLiveLocation={userLiveLocation} 
          enteredSourceLocation={enteredSourceLocation}
          isRoutingActive={isRoutingActive}
        />

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

        {/* --- User's LIVE Location Marker (Rotating Car Icon) --- */}
        {userLiveLocation && (
          <Marker position={userLiveLocation} icon={getUserLiveLocationIcon(userLiveHeading)}>
            <Popup closeButton={false} minWidth={150}>
              <div className="p-2 text-center text-sm font-semibold text-slate-900">
                You Are Here!
                {userLiveHeading !== null && !isNaN(userLiveHeading) && (
                  <p className="text-xs text-slate-500 mt-1">Heading: {userLiveHeading.toFixed(0)}°</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* --- Entered Source Location Marker (if different from live and live not active) --- */}
        {enteredSourceLocation && !userLiveLocation && (
            <Marker position={enteredSourceLocation} icon={getUserLiveLocationIcon(null)}> {/* No heading for static entered location */}
              <Popup closeButton={false} minWidth={150}>
                <div className="p-2 text-center text-sm font-semibold text-slate-900">
                  Your Custom Start Point
                  {sourceAddressInput && <p className="text-xs text-slate-500 mt-1">{sourceAddressInput}</p>}
                </div>
              </Popup>
            </Marker>
        )}

        {/* --- Destination Markers (Stations) --- */}
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
        
        {/* --- Mock Route Polyline (Visualizes straight line between points) --- */}
        {currentSourceForMap && activeStation && (
          <Polyline 
            positions={[currentSourceForMap, [activeStation.lat, activeStation.lng]]} 
            color="#8b5cf6" 
            weight={4} 
            opacity={0.7} 
            dashArray="10, 10" // Dotted line for mock route
          />
        )}

      </MapContainer>

      {/* --- Dynamic UI Overlay (Left - City Filters & Source Input) --- */}
      <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-3">
        {/* Main Badge (STAYED SAME) */}
        <Badge className="bg-white/95 backdrop-blur shadow-xl border-none text-slate-900 px-4 py-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase">
            Grid Monitor: {uniqueCities.join(' / ')}
          </span>
        </Badge>
        
        {/* Dynamic City Jump Buttons (STAYED SAME) */}
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

        {/* --- Source Location Input & Buttons --- */}
        <div className="bg-white/95 backdrop-blur shadow-xl border border-slate-200 p-3 rounded-xl flex flex-col gap-2 max-w-[220px]">
          <h4 className="text-xs font-bold text-slate-700">Your Start Point</h4>
          {userLiveLocation && (
            <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-1">
              <LocateFixed size={14} /> Live: {userLiveLocation[0].toFixed(4)}, {userLiveLocation[1].toFixed(4)}
            </div>
          )}
          <Input 
            type="text"
            placeholder="Enter address or place..."
            className="h-8 text-xs bg-slate-50 border-slate-200 focus:border-emerald-500"
            value={sourceAddressInput}
            onChange={(e) => setSourceAddressInput(e.target.value)}
            onBlur={handleSetSourceAddress}
            onKeyPress={(e) => { 
                if (e.key === 'Enter') {
                    handleSetSourceAddress();
                }
            }}
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200"
            onClick={handleUseMyLocation}
          >
            <LocateFixed size={14} /> Use My Live Location
          </Button>
          {(enteredSourceLocation || userLiveLocation) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs text-red-500 hover:bg-red-50"
              onClick={clearSourceLocation}
            >
              Clear Source
            </Button>
          )}
        </div>
      </div>

      {/* --- Bottom Right Actions (Start Route & Reset Map View) --- */}
      <div className="absolute bottom-8 right-8 z-[1000] flex flex-col gap-3">
        {currentSourceForMap && activeStation && (
          <Button 
            size="lg" 
            className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-2xl transition-transform active:scale-95 flex items-center gap-2"
            onClick={() => {
              setIsRoutingActive(true); // Activate routing mode
              toast.info("Navigation started! Map will follow your live location.", {
                description: "This is a direct line to destination. Actual turn-by-turn route calculation requires a dedicated routing API.",
                duration: 8000,
              });
            }}
          >
            <Navigation size={20} /> Start Route
          </Button>
        )}
        
        {/* Reset Map View Button */}
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-xl bg-slate-900 text-white shadow-2xl transition-transform active:scale-95"
          onClick={() => {
            setMapCenter(defaultCenter); 
            setMapZoom(11);
            clearSourceLocation();
            setUserLiveLocation(null);
            setUserLiveHeading(null);
            setIsRoutingActive(false); // Exit routing mode
          }}
        >
          <Crosshair size={20} />
        </Button>
      </div>
    </div>
  );
}
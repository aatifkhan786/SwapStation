import { useState, useEffect, createContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/pages/admin/hooks/useAdminStore'; // Integrated store
import { 
  mockStations, 
  generateMockMetrics, 
  simulateMetricChange,
  Station,
 
} from '@/lib/mock-data';

// View Imports
import OverviewView from './OverviewView';
import NearbyView from './NearbyView';
import NotificationsView from './NotificationsView';
import SettingsView from './SettingsView';

// Components
import { Button } from '@/components/ui/button';
import { MessageSquare, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DriverAssistant } from './components/DriverAssistant'; 

export const SettingsContext = createContext<any>(null);

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // --- CONNECTED GLOBAL STATE ---
  // We pull the live notifications and the initialize function from the global store
  const initializeStore = useAdminStore((state) => state.initialize);
  const allNotifications = useAdminStore((state) => state.notifications);
  
  // Filter notifications specifically for the Driver role from the live store
  const driverNotifications = allNotifications.filter(n => n.target_role === 'driver');

  // --- LOCAL UI STATE ---
  const [currentStation, setCurrentStation] = useState<Station>(mockStations[0]);
  const [metrics, setMetrics] = useState(generateMockMetrics(mockStations[0].id));
  const [pendingSearch, setPendingSearch] = useState('');
  const [notifCount, setNotifCount] = useState(driverNotifications.length);

  const [settings, setSettings] = useState({
    darkMode: true,
    language: 'en',
    bgMusic: false,
    musicVolume: 40,
    notifSound: true,
    bgImage: 'none',
    chatBot: true,
    isPremium: false
  });

  // Initialize the store on mount to ensure data is hydrated
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Keep the notification count badge in sync with the store
  useEffect(() => {
    setNotifCount(driverNotifications.length);
  }, [driverNotifications.length]);

  useEffect(() => {
    setMetrics(generateMockMetrics(currentStation.id));
  }, [currentStation.id]);

  useEffect(() => {
    const interval = setInterval(() => setMetrics(prev => simulateMetricChange(prev)), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const bgStyles: any = {
    city: "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80')",
    abstract: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80')",
    minimal: "url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&q=80')",
    none: 'none'
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAutoReroute = () => {
    const recommended = mockStations
      .filter(s => s.id !== currentStation.id && s.status === 'healthy')
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))[0];
    if (recommended) setCurrentStation(recommended);
  };

  const handleReroute = (stationName: string) => {
    const target = mockStations.find(s => stationName.toLowerCase().includes(s.station_name.toLowerCase()));
    if (target) {
      setCurrentStation(target);
      navigate('/driver'); 
    }
  };

  const handleViewStation = (stationName: string) => {
    setPendingSearch(stationName);
    navigate('/driver/stations');
  };
  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      <div 
        className={cn(
          "min-h-screen w-full transition-all duration-700 bg-cover bg-center bg-fixed",
          settings.darkMode ? "text-white" : "text-slate-900"
        )}
        style={{ 
          backgroundImage: bgStyles[settings.bgImage],
          backgroundColor: settings.darkMode ? '#020609' : '#f8fafc' 
        }}
      >
        <div className={cn(
          "min-h-screen w-full",
          settings.bgImage !== 'none' && (settings.darkMode ? "bg-black/70 backdrop-blur-[2px]" : "bg-white/70 backdrop-blur-[2px]")
        )}>
          

          {!settings.isPremium && (
            <div className="bg-primary/20 border-b border-primary/20 py-2 text-center flex items-center justify-center gap-4 sticky top-0 z-40 backdrop-blur-md">
               <Crown className="h-4 w-4 text-primary" />
               <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                 Upgrade to PRO to remove ads and unlock advanced navigation
               </span>
               <Button variant="link" className="h-auto p-0 text-[11px] font-bold" onClick={() => navigate('/driver/settings')}>
                 Upgrade Now
               </Button>
            </div>
          )}

          <main className="container mx-auto">
            {location.pathname === '/driver' && (
              <OverviewView 
                station={currentStation} 
                metrics={metrics} 
                onAutoReroute={handleAutoReroute} 
              />
            )}
            
            {location.pathname === '/driver/stations' && (
              <NearbyView 
                stations={mockStations} 
                currentStationId={currentStation.id}
                onSelect={(s) => { setCurrentStation(s); navigate('/driver'); }}
                initialSearch={pendingSearch}
                onSearchClear={() => setPendingSearch('')}
              />
            )}
            
            {location.pathname === '/driver/notifications' && (
              <NotificationsView 
                notifications={driverNotifications} // Now receiving live data from store
                onReroute={handleReroute}
                onViewStation={handleViewStation}
                onCountUpdate={setNotifCount}
              />
            )}

            {location.pathname === '/driver/settings' && (
              <SettingsView />
            )}
          </main>

          {settings.bgMusic && (
             <div className="hidden">
               <audio autoPlay loop muted={!settings.bgMusic}>
                 <source src="/ambient-loop.mp3" type="audio/mpeg" />
               </audio>
             </div>
          )}
        </div>

        {settings.chatBot && <DriverAssistant />}
      </div>
    </SettingsContext.Provider>
  );
}
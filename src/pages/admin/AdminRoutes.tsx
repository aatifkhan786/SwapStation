import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminStore } from './hooks/useAdminStore';

import AdminDashboard from './Dashboard';
import CityView from './CityView';
import Alerts from './Alerts';
import Recommendations from './Recommendations';
import Tickets from './Tickets';
import Notifications from './Notifications';
import Settings from './Settings';
import History from './History';

export default function AdminRoutes() {
  const { initialize, updateMetrics } = useAdminStore();

  useEffect(() => {
    // 1. Load data
    initialize();

    // 2. Start Simulation Loop (Heartbeat)
    const interval = setInterval(() => {
      updateMetrics();
    }, 5000);

    return () => clearInterval(interval);
  }, [initialize, updateMetrics]);

  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="city" element={<CityView />} />
      <Route path="alerts" element={<Alerts />} />
      <Route path="recommendations" element={<Recommendations />} />
      <Route path="history" element={<History />} />
      <Route path="tickets" element={<Tickets />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
  );
}
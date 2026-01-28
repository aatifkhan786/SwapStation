// Mock data generators for Deeplinkers

export type StationStatus = 'healthy' | 'attention' | 'risk' | 'critical';
export type AlertPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type AlertStatus = 'new' | 'acknowledged' | 'resolved';
export type RiskType = 'congestion' | 'stockout' | 'charger_fault' | 'outage' | 'error_spike';
export type ActionType = 'reroute' | 'ticket' | 'rebalance' | 'escalate' | 'monitor';
export type DecisionStatus = 'pending' | 'approved' | 'rejected' | 'snoozed';
export type TicketStatus = 'new' | 'acknowledged' | 'in_progress' | 'resolved';
export type UserRole = 'driver' | 'field_ops' | 'admin';

export interface Station {
  id: string;
  station_name: string;
  lat: number;
  lng: number;
  city: string;
  status: StationStatus;
  distance?: number; // km from user
}

export interface StationMetrics {
  id: string;
  station_id: string;
  timestamp: string;
  swap_rate: number;
  queue_level: number;
  charger_uptime: number;
  charged_inventory: number;
  uncharged_inventory: number;
  error_count: number;
}

export interface Alert {
  id: string;
  station_id: string;
  station_name?: string;
  risk_type: RiskType;
  priority: AlertPriority;
  status: AlertStatus;
  description: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  alert_id?: string;
  station_id: string;
  station_name?: string;
  action_type: ActionType;
  owner_role: UserRole;
  why_text: string;
  impact_text: string;
  confidence_score: number;
  decision_status: DecisionStatus;
  created_at: string;
}

export interface Ticket {
  id: string;
  station_id: string;
  station_name?: string;
  issue_type: string;
  priority: AlertPriority;
  probable_root_cause: string;
  assigned_to?: string;
  assigned_to_name?: string;
  status: TicketStatus;
  resolution_notes?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Notification {
  id: string;
  recommendation_id?: string;
  target_role: UserRole;
  channel: 'sms' | 'whatsapp' | 'dashboard_log';
  message_text: string;
  is_read: boolean;
  sent_at: string;
}

// Jakarta stations
const jakartaStations: Omit<Station, 'distance'>[] = [
  { id: 'sta-1', station_name: 'Sudirman Central', lat: -6.2088, lng: 106.8456, city: 'Jakarta', status: 'healthy' },
  { id: 'sta-2', station_name: 'Thamrin Plaza', lat: -6.1944, lng: 106.8229, city: 'Jakarta', status: 'attention' },
  { id: 'sta-3', station_name: 'Kuningan Hub', lat: -6.2297, lng: 106.8295, city: 'Jakarta', status: 'healthy' },
  { id: 'sta-4', station_name: 'Senayan Park', lat: -6.2255, lng: 106.8019, city: 'Jakarta', status: 'critical' },
  { id: 'sta-5', station_name: 'Kelapa Gading', lat: -6.1574, lng: 106.9055, city: 'Jakarta', status: 'healthy' },
  { id: 'sta-6', station_name: 'PIK Boulevard', lat: -6.1089, lng: 106.7414, city: 'Jakarta', status: 'risk' },
  { id: 'sta-7', station_name: 'Pondok Indah', lat: -6.2666, lng: 106.7834, city: 'Jakarta', status: 'healthy' },
  { id: 'sta-8', station_name: 'Kemang Square', lat: -6.2614, lng: 106.8136, city: 'Jakarta', status: 'attention' },
];

// Surabaya stations
const surabayaStations: Omit<Station, 'distance'>[] = [
  { id: 'sta-9', station_name: 'Tunjungan Plaza', lat: -7.2575, lng: 112.7521, city: 'Surabaya', status: 'healthy' },
  { id: 'sta-10', station_name: 'Pakuwon Mall', lat: -7.2891, lng: 112.6767, city: 'Surabaya', status: 'healthy' },
  { id: 'sta-11', station_name: 'Galaxy Mall', lat: -7.2925, lng: 112.7798, city: 'Surabaya', status: 'attention' },
  { id: 'sta-12', station_name: 'Citraland', lat: -7.2862, lng: 112.6678, city: 'Surabaya', status: 'healthy' },
  { id: 'sta-13', station_name: 'Surabaya Central', lat: -7.2458, lng: 112.7378, city: 'Surabaya', status: 'risk' },
  { id: 'sta-14', station_name: 'Kenjeran Beach', lat: -7.2339, lng: 112.7856, city: 'Surabaya', status: 'healthy' },
  { id: 'sta-15', station_name: 'Wiyung Station', lat: -7.3181, lng: 112.6967, city: 'Surabaya', status: 'healthy' },
  { id: 'sta-16', station_name: 'Gubeng Transit', lat: -7.2654, lng: 112.7517, city: 'Surabaya', status: 'critical' },
];

export const mockStations: Station[] = [...jakartaStations, ...surabayaStations].map(s => ({
  ...s,
  distance: Math.round((Math.random() * 8 + 0.5) * 10) / 10
}));

export function generateMockMetrics(stationId: string): StationMetrics {
  return {
    id: `met-${stationId}-${Date.now()}`,
    station_id: stationId,
    timestamp: new Date().toISOString(),
    swap_rate: Math.round((Math.random() * 15 + 5) * 10) / 10,
    queue_level: Math.floor(Math.random() * 12),
    charger_uptime: Math.round((Math.random() * 20 + 80) * 10) / 10,
    charged_inventory: Math.floor(Math.random() * 30 + 10),
    uncharged_inventory: Math.floor(Math.random() * 15),
    error_count: Math.floor(Math.random() * 5),
  };
}

export const mockAlerts: Alert[] = [
  { id: 'alt-1', station_id: 'sta-4', station_name: 'Senayan Park', risk_type: 'outage', priority: 'P0', status: 'new', description: 'Complete power failure detected', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 'alt-2', station_id: 'sta-16', station_name: 'Gubeng Transit', risk_type: 'charger_fault', priority: 'P0', status: 'acknowledged', description: 'Multiple charger units failing', created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
  { id: 'alt-3', station_id: 'sta-6', station_name: 'PIK Boulevard', risk_type: 'congestion', priority: 'P1', status: 'new', description: 'Queue level exceeds threshold', created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
  { id: 'alt-4', station_id: 'sta-2', station_name: 'Thamrin Plaza', risk_type: 'stockout', priority: 'P1', status: 'new', description: 'Low charged battery inventory', created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { id: 'alt-5', station_id: 'sta-13', station_name: 'Surabaya Central', risk_type: 'error_spike', priority: 'P1', status: 'acknowledged', description: 'Error rate increased by 300%', created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
  { id: 'alt-6', station_id: 'sta-8', station_name: 'Kemang Square', risk_type: 'congestion', priority: 'P2', status: 'new', description: 'Moderate queue buildup', created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
  { id: 'alt-7', station_id: 'sta-11', station_name: 'Galaxy Mall', risk_type: 'charger_fault', priority: 'P2', status: 'new', description: 'Single charger unit offline', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'alt-8', station_id: 'sta-1', station_name: 'Sudirman Central', risk_type: 'congestion', priority: 'P3', status: 'resolved', description: 'Peak hour congestion detected', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: 'alt-9', station_id: 'sta-5', station_name: 'Kelapa Gading', risk_type: 'stockout', priority: 'P2', status: 'new', description: 'Inventory below optimal level', created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString() },
  { id: 'alt-10', station_id: 'sta-9', station_name: 'Tunjungan Plaza', risk_type: 'error_spike', priority: 'P3', status: 'new', description: 'Minor error increase detected', created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString() },
  { id: 'alt-11', station_id: 'sta-3', station_name: 'Kuningan Hub', risk_type: 'congestion', priority: 'P2', status: 'acknowledged', description: 'Queue forming during lunch rush', created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
  { id: 'alt-12', station_id: 'sta-7', station_name: 'Pondok Indah', risk_type: 'charger_fault', priority: 'P3', status: 'new', description: 'Charger showing intermittent errors', created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
];

export const mockRecommendations: Recommendation[] = [
  { id: 'rec-1', alert_id: 'alt-1', station_id: 'sta-4', station_name: 'Senayan Park', action_type: 'reroute', owner_role: 'driver', why_text: 'Station experiencing complete outage', impact_text: 'Redirect 45 drivers to nearby stations, reducing wait by ~15 min avg', confidence_score: 0.95, decision_status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
  { id: 'rec-2', alert_id: 'alt-1', station_id: 'sta-4', station_name: 'Senayan Park', action_type: 'ticket', owner_role: 'field_ops', why_text: 'Power failure requires immediate on-site inspection', impact_text: 'Restore station within 2-4 hours', confidence_score: 0.92, decision_status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
  { id: 'rec-3', alert_id: 'alt-2', station_id: 'sta-16', station_name: 'Gubeng Transit', action_type: 'escalate', owner_role: 'admin', why_text: '3 of 5 chargers failing simultaneously', impact_text: 'Prevent complete station failure', confidence_score: 0.88, decision_status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
  { id: 'rec-4', alert_id: 'alt-3', station_id: 'sta-6', station_name: 'PIK Boulevard', action_type: 'reroute', owner_role: 'driver', why_text: 'Queue level at 11 vehicles (threshold: 8)', impact_text: 'Reduce wait time by ~12 min for incoming drivers', confidence_score: 0.85, decision_status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 7).toISOString() },
  { id: 'rec-5', alert_id: 'alt-4', station_id: 'sta-2', station_name: 'Thamrin Plaza', action_type: 'rebalance', owner_role: 'admin', why_text: 'Charged inventory at 15% capacity', impact_text: 'Prevent stockout for next 200 swaps', confidence_score: 0.82, decision_status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString() },
  { id: 'rec-6', alert_id: 'alt-5', station_id: 'sta-13', station_name: 'Surabaya Central', action_type: 'ticket', owner_role: 'field_ops', why_text: 'Error spike indicates potential hardware issue', impact_text: 'Prevent escalation to outage', confidence_score: 0.78, decision_status: 'approved', created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString() },
  { id: 'rec-7', alert_id: 'alt-6', station_id: 'sta-8', station_name: 'Kemang Square', action_type: 'monitor', owner_role: 'admin', why_text: 'Queue building but not yet critical', impact_text: 'Early intervention if situation worsens', confidence_score: 0.72, decision_status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 24).toISOString() },
  { id: 'rec-8', alert_id: 'alt-7', station_id: 'sta-11', station_name: 'Galaxy Mall', action_type: 'ticket', owner_role: 'field_ops', why_text: 'Charger unit 3 showing error codes', impact_text: 'Restore full capacity within 1 hour', confidence_score: 0.75, decision_status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 28).toISOString() },
  { id: 'rec-9', alert_id: 'alt-9', station_id: 'sta-5', station_name: 'Kelapa Gading', action_type: 'rebalance', owner_role: 'admin', why_text: 'Inventory dropping faster than expected', impact_text: 'Maintain service level for evening rush', confidence_score: 0.80, decision_status: 'snoozed', created_at: new Date(Date.now() - 1000 * 60 * 33).toISOString() },
  { id: 'rec-10', alert_id: 'alt-10', station_id: 'sta-9', station_name: 'Tunjungan Plaza', action_type: 'monitor', owner_role: 'admin', why_text: 'Minor uptick in error rate', impact_text: 'Track for 30 min before escalating', confidence_score: 0.65, decision_status: 'pending', created_at: new Date(Date.now() - 1000 * 60 * 48).toISOString() },
];

export const mockTickets: Ticket[] = [
  { id: 'tkt-1', station_id: 'sta-4', station_name: 'Senayan Park', issue_type: 'Power Outage', priority: 'P0', probable_root_cause: 'Main breaker tripped due to overload', assigned_to: 'ops-1', assigned_to_name: 'Ahmad Wijaya', status: 'in_progress', created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 'tkt-2', station_id: 'sta-16', station_name: 'Gubeng Transit', issue_type: 'Charger Fault', priority: 'P0', probable_root_cause: 'Controller board failure on units 2, 3, 4', assigned_to: 'ops-2', assigned_to_name: 'Budi Santoso', status: 'acknowledged', created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: 'tkt-3', station_id: 'sta-13', station_name: 'Surabaya Central', issue_type: 'Error Spike', priority: 'P1', probable_root_cause: 'Software glitch in monitoring system', assigned_to: 'ops-2', assigned_to_name: 'Budi Santoso', status: 'new', created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'tkt-4', station_id: 'sta-11', station_name: 'Galaxy Mall', issue_type: 'Charger Fault', priority: 'P2', probable_root_cause: 'Connector wear on unit 3', assigned_to: 'ops-1', assigned_to_name: 'Ahmad Wijaya', status: 'new', created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
  { id: 'tkt-5', station_id: 'sta-7', station_name: 'Pondok Indah', issue_type: 'Charger Fault', priority: 'P3', probable_root_cause: 'Intermittent sensor readings', assigned_to: 'ops-1', assigned_to_name: 'Ahmad Wijaya', status: 'new', created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
  { id: 'tkt-6', station_id: 'sta-2', station_name: 'Thamrin Plaza', issue_type: 'Charger Fault', priority: 'P2', probable_root_cause: 'Cooling fan malfunction', assigned_to: 'ops-1', assigned_to_name: 'Ahmad Wijaya', status: 'resolved', resolution_notes: 'Replaced cooling fan assembly', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), resolved_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  { id: 'tkt-7', station_id: 'sta-6', station_name: 'PIK Boulevard', issue_type: 'Outage', priority: 'P1', probable_root_cause: 'UPS battery failure', assigned_to: 'ops-2', assigned_to_name: 'Budi Santoso', status: 'resolved', resolution_notes: 'Replaced UPS batteries', created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), resolved_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: 'tkt-8', station_id: 'sta-9', station_name: 'Tunjungan Plaza', issue_type: 'Error Spike', priority: 'P3', probable_root_cause: 'Network connectivity issues', assigned_to: 'ops-2', assigned_to_name: 'Budi Santoso', status: 'in_progress', created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString() },
];

export const mockNotifications: Notification[] = [
  { id: 'ntf-1', recommendation_id: 'rec-1', target_role: 'driver', channel: 'dashboard_log', message_text: '🚨 Senayan Park is currently offline. Please head to Pondok Indah (2.1 km) or Kemang Square (1.8 km)', is_read: false, sent_at: new Date(Date.now() - 1000 * 60 * 3).toISOString() },
  { id: 'ntf-2', recommendation_id: 'rec-4', target_role: 'driver', channel: 'dashboard_log', message_text: '⚠️ PIK Boulevard has high queue (11 vehicles). Consider Kelapa Gading (3.2 km) for faster service', is_read: false, sent_at: new Date(Date.now() - 1000 * 60 * 6).toISOString() },
  { id: 'ntf-3', recommendation_id: 'rec-2', target_role: 'field_ops', channel: 'dashboard_log', message_text: '🔧 New P0 ticket assigned: Power outage at Senayan Park', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 58).toISOString() },
  { id: 'ntf-4', recommendation_id: 'rec-6', target_role: 'field_ops', channel: 'dashboard_log', message_text: '🔧 New P1 ticket assigned: Error spike at Surabaya Central', is_read: false, sent_at: new Date(Date.now() - 1000 * 60 * 17).toISOString() },
  { id: 'ntf-5', target_role: 'admin', channel: 'dashboard_log', message_text: '✅ Recommendation approved: Reroute drivers from Senayan Park', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
  { id: 'ntf-6', target_role: 'driver', channel: 'sms', message_text: 'EV Swap Alert: Your nearest station Thamrin Plaza has low battery stock. Sudirman Central has full availability.', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 12).toISOString() },
  { id: 'ntf-7', target_role: 'driver', channel: 'dashboard_log', message_text: '✅ Queue cleared at Sudirman Central. Normal service resumed.', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 43).toISOString() },
  { id: 'ntf-8', target_role: 'field_ops', channel: 'dashboard_log', message_text: '✅ Ticket TKT-6 resolved: Charger fault at Thamrin Plaza fixed', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 59).toISOString() },
  { id: 'ntf-9', target_role: 'admin', channel: 'dashboard_log', message_text: '📊 Daily summary: 94.2% fleet uptime, 3 P0 incidents resolved', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: 'ntf-10', target_role: 'driver', channel: 'whatsapp', message_text: 'Good morning! Your preferred station Kuningan Hub is operating normally with 2 min avg wait time.', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
  { id: 'ntf-11', target_role: 'field_ops', channel: 'dashboard_log', message_text: '📋 Shift handover: 2 active tickets pending, 1 resolved today', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
  { id: 'ntf-12', target_role: 'admin', channel: 'dashboard_log', message_text: '⚠️ Alert: Gubeng Transit degraded - 3 chargers offline', is_read: false, sent_at: new Date(Date.now() - 1000 * 60 * 11).toISOString() },
  { id: 'ntf-13', target_role: 'driver', channel: 'dashboard_log', message_text: '🔋 Battery swap complete at Kelapa Gading. Thank you for using our service!', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
  { id: 'ntf-14', target_role: 'field_ops', channel: 'sms', message_text: 'URGENT: P0 ticket at Gubeng Transit requires immediate attention', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 44).toISOString() },
  { id: 'ntf-15', target_role: 'admin', channel: 'dashboard_log', message_text: '🔄 Inventory rebalance completed: 50 batteries moved to Thamrin Plaza', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: 'ntf-16', target_role: 'driver', channel: 'dashboard_log', message_text: '⚡ Peak hours starting. Sudirman Central and Kuningan Hub recommended for fastest service.', is_read: false, sent_at: new Date(Date.now() - 1000 * 60 * 8).toISOString() },
  { id: 'ntf-17', target_role: 'field_ops', channel: 'dashboard_log', message_text: '🎉 Great job! Ticket resolution time improved by 15% this week', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 360).toISOString() },
  { id: 'ntf-18', target_role: 'admin', channel: 'dashboard_log', message_text: '📈 System health: All Surabaya stations operating at optimal capacity', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 150).toISOString() },
  { id: 'ntf-19', target_role: 'driver', channel: 'dashboard_log', message_text: '🌙 Evening update: All Jakarta stations have good availability', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 420).toISOString() },
  { id: 'ntf-20', target_role: 'admin', channel: 'dashboard_log', message_text: '🔔 Recommendation snoozed: Rebalance for Kelapa Gading (will resurface in 1 hour)', is_read: true, sent_at: new Date(Date.now() - 1000 * 60 * 32).toISOString() },
];

// Demo users for hackathon
export const demoUsers = [
  { email: 'admin@demo.com', password: 'demo123', role: 'admin' as UserRole, name: 'Admin User' },
  { email: 'fieldops@demo.com', password: 'demo123', role: 'field_ops' as UserRole, name: 'Field Ops User' },
  { email: 'driver@demo.com', password: 'demo123', role: 'driver' as UserRole, name: 'Driver User' },
];

// Helper to calculate aggregate metrics
export function calculateKPIs(stations: Station[], alerts: Alert[], metrics: StationMetrics[]) {
  const totalStations = stations.length;
  const stationsAtRisk = stations.filter(s => s.status === 'risk' || s.status === 'critical').length;
  const avgQueueLevel = metrics.length > 0 
    ? Math.round(metrics.reduce((sum, m) => sum + m.queue_level, 0) / metrics.length * 10) / 10 
    : 0;
  const avgUptime = metrics.length > 0
    ? Math.round(metrics.reduce((sum, m) => sum + m.charger_uptime, 0) / metrics.length * 10) / 10
    : 100;
  const activeAlerts = alerts.filter(a => a.status !== 'resolved').length;
  const p0Alerts = alerts.filter(a => a.priority === 'P0' && a.status !== 'resolved').length;

  return {
    totalStations,
    stationsAtRisk,
    avgQueueLevel,
    avgUptime,
    activeAlerts,
    p0Alerts,
    jakartaCount: stations.filter(s => s.city === 'Jakarta').length,
    surabayaCount: stations.filter(s => s.city === 'Surabaya').length,
  };
}

// Simulate live data updates
export function simulateMetricChange(metric: StationMetrics): StationMetrics {
  return {
    ...metric,
    timestamp: new Date().toISOString(),
    swap_rate: Math.max(0, metric.swap_rate + (Math.random() - 0.5) * 2),
    queue_level: Math.max(0, Math.min(15, metric.queue_level + Math.floor(Math.random() * 3) - 1)),
    charger_uptime: Math.max(70, Math.min(100, metric.charger_uptime + (Math.random() - 0.5) * 2)),
    charged_inventory: Math.max(0, metric.charged_inventory + Math.floor(Math.random() * 5) - 2),
    uncharged_inventory: Math.max(0, metric.uncharged_inventory + Math.floor(Math.random() * 3) - 1),
    error_count: Math.max(0, metric.error_count + (Math.random() > 0.8 ? 1 : 0)),
  };
}

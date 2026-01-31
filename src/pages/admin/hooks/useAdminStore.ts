import { create } from 'zustand';
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  mockStations,
  mockAlerts,
  mockRecommendations,
  mockTickets,
  mockNotifications,
  generateMockMetrics,
  simulateMetricChange,
  Station,
  StationMetrics,
  Alert,
  Recommendation,
  Ticket,
  Notification,
  DecisionStatus,
} from '@/lib/mock-data';
import { v4 as uuidv4 } from 'uuid';

// --- Types ---

export interface AdminConfig {
  reroute_radius_default: number;
  reroute_radius_fallback: number;
  reroute_radius_emergency: number;
}

export interface ExtendedRecommendation extends Recommendation {
  rejection_reason?: string;
  rejection_note?: string;
  handled_by?: string;
  handled_at?: string;
  snapshot_metrics?: StationMetrics;
}

export type AIBehaviorMode = 'conservative' | 'balanced' | 'aggressive';
export type SystemStatus = 'active' | 'frozen';

interface AdminState {
  stations: Station[];
  metrics: StationMetrics[];
  alerts: Alert[];
  recommendations: ExtendedRecommendation[];
  tickets: Ticket[];
  notifications: Notification[];
  config: AdminConfig;

  // Governance State
  behaviorMode: AIBehaviorMode;
  systemStatus: SystemStatus;
  freezeReason: string | null;
  consecutiveRejections: number;
  
  isGenerating: boolean; 

  // Actions
  initialize: () => void;
  updateMetrics: () => void;
  handleRecommendationDecision: (recId: string, decision: DecisionStatus, rejectionDetails?: { reason: string; note: string }) => void;
  escalateAlert: (alert: Alert) => void; // Pass the full alert object
  acknowledgeAlert: (alertId: string) => void;
  updateConfig: (newConfig: Partial<AdminConfig>) => void;
  
  // Governance Actions
  setBehaviorMode: (mode: AIBehaviorMode) => void;
  resetSystem: () => void;
  triggerManualFreeze: (reason: string) => void;
  
  // AI Generation Action
  generateAIRecommendations: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  stations: [],
  metrics: [],
  alerts: [],
  recommendations: [],
  tickets: [],
  notifications: [],
  config: {
    reroute_radius_default: 3,
    reroute_radius_fallback: 5,
    reroute_radius_emergency: 10,
  },
  behaviorMode: 'balanced',
  systemStatus: 'active',
  freezeReason: null,
  consecutiveRejections: 0,
  isGenerating: false,

  initialize: () => {
    if (get().stations.length > 0) return;

    const initialAlerts = [...mockAlerts];
    const stationsWithStatus = mockStations.map(s => {
      let status: Station['status'] = 'healthy';
      const hasCritical = initialAlerts.some(a => a.station_id === s.id && a.priority === 'P0' && a.status !== 'resolved');
      const hasRisk = initialAlerts.some(a => a.station_id === s.id && a.priority === 'P1' && a.status !== 'resolved');
      if (hasCritical) status = 'critical';
      else if (hasRisk) status = 'risk';
      return { ...s, status };
    });
    
    const hydratedRecommendations: ExtendedRecommendation[] = mockRecommendations.map(rec => {
      if (rec.decision_status === 'approved' || rec.decision_status === 'rejected') {
        return {
          ...rec,
          handled_by: 'Admin User',
          handled_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          snapshot_metrics: generateMockMetrics(rec.station_id)
        };
      }
      return rec;
    });

    set({
      stations: stationsWithStatus,
      metrics: mockStations.map(s => generateMockMetrics(s.id)),
      alerts: initialAlerts,
      recommendations: hydratedRecommendations,
      tickets: mockTickets,
      notifications: mockNotifications,
    });
  },

  updateMetrics: () => {
    set(state => ({
      metrics: state.metrics.map(m => simulateMetricChange(m)),
    }));
  },

  handleRecommendationDecision: (recId, decision, rejectionDetails) => {
    const state = get();
    if (state.systemStatus === 'frozen' && decision === 'approved') {
      console.warn("Cannot approve actions while system is frozen.");
      return;
    }

    const rec = state.recommendations.find(r => r.id === recId);
    if (!rec) return;
    const currentMetrics = state.metrics.find(m => m.station_id === rec.station_id);

    let newConsecutiveRejections = state.consecutiveRejections;
    let newSystemStatus = state.systemStatus;
    let newFreezeReason = state.freezeReason;

    if (decision === 'rejected') {
      newConsecutiveRejections += 1;
      if (newConsecutiveRejections >= 3) {
        newSystemStatus = 'frozen';
        newFreezeReason = 'Safety Protocol: High rejection rate detected (3 consecutive). Human review required.';
        const freezeNotif: Notification = {
          id: `ntf-${uuidv4().slice(0, 8)}`,
          target_role: 'admin',
          channel: 'dashboard_log',
          message_text: `🛑 SYSTEM AUTO-FROZEN: ${newFreezeReason}`,
          is_read: false,
          sent_at: new Date().toISOString()
        };
        set(s => ({ notifications: [freezeNotif, ...s.notifications] }));
      }
    } else if (decision === 'approved') {
      newConsecutiveRejections = 0;
    }

    set(state => ({
      consecutiveRejections: newConsecutiveRejections,
      systemStatus: newSystemStatus,
      freezeReason: newFreezeReason,
      recommendations: state.recommendations.map(r =>
        r.id === recId ? { 
          ...r, 
          decision_status: decision,
          handled_by: 'Admin User',
          handled_at: new Date().toISOString(),
          rejection_reason: rejectionDetails?.reason,
          rejection_note: rejectionDetails?.note,
          snapshot_metrics: currentMetrics || generateMockMetrics(r.station_id)
        } : r
      ),
    }));

    if (decision === 'approved') {
        const newNotifications = [...get().notifications];
        const newTickets = [...get().tickets];

        if (rec.action_type === 'ticket' || rec.action_type === 'escalate') {
            // ✅ FIX: Find the original alert that triggered this recommendation
            const sourceAlert = get().alerts.find(a => a.id === rec.alert_id);
            
            const newTicket: Ticket = {
                id: `tkt-${uuidv4().slice(0, 4)}`,
                station_id: rec.station_id,
                station_name: rec.station_name,
                issue_type: `Auto: ${rec.why_text}`,
                // ✅ FIX: Use the priority FROM THE ORIGINAL ALERT, not a random one
                priority: sourceAlert?.priority || (rec.action_type === 'escalate' ? 'P1' : 'P2'),
                probable_root_cause: sourceAlert?.description || rec.why_text,
                status: 'new',
                created_at: new Date().toISOString(),
            };
            newTickets.unshift(newTicket);
            
            newNotifications.unshift({
                id: `ntf-${uuidv4().slice(0, 8)}`,
                target_role: 'field_ops',
                channel: 'dashboard_log',
                message_text: `🔧 New Ticket auto-assigned for ${rec.station_name}: ${rec.why_text}`,
                is_read: false,
                sent_at: new Date().toISOString(),
            });

            // ✅ FIX: Also update the source alert to 'acknowledged' so it doesn't look "new"
            if (sourceAlert) {
              set(state => ({
                alerts: state.alerts.map(a => a.id === sourceAlert.id ? { ...a, status: 'acknowledged' } : a)
              }));
            }
        }
        set({ notifications: newNotifications, tickets: newTickets });
    }
  },

  escalateAlert: (alert) => {
    // ✅ FIX: Use the alert object directly
    const newTicket: Ticket = {
      id: `tkt-${uuidv4().slice(0, 4)}`,
      station_id: alert.station_id,
      station_name: alert.station_name,
      issue_type: `Manual Escalation: ${alert.risk_type}`, 
      // ✅ FIX: Use the alert's actual priority
      priority: alert.priority, 
      probable_root_cause: alert.description,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    set(state => ({
      tickets: [newTicket, ...state.tickets],
      // ✅ FIX: Mark the alert as acknowledged
      alerts: state.alerts.map(a => a.id === alert.id ? { ...a, status: 'acknowledged' } : a),
      notifications: [{
          id: `ntf-${uuidv4().slice(0, 8)}`,
          target_role: 'field_ops',
          channel: 'sms',
          message_text: `🚨 URGENT: Manual escalation for ${alert.station_name}. Ticket ${newTicket.id} created.`,
          is_read: false,
          sent_at: new Date().toISOString(),
      }, ...state.notifications]
    }));
  },
  
  acknowledgeAlert: (alertId) => {
    set(state => ({ alerts: state.alerts.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a) }));
  },

  updateConfig: (newConfig) => {
    set(state => ({ config: { ...state.config, ...newConfig } }));
  },

  setBehaviorMode: (mode) => set({ behaviorMode: mode }),
  
  resetSystem: () => {
    set({ 
      systemStatus: 'active', 
      freezeReason: null, 
      consecutiveRejections: 0 
    });
  },

  triggerManualFreeze: (reason) => set({ 
    systemStatus: 'frozen', 
    freezeReason: `Manual Freeze: ${reason}` 
  }),

  generateAIRecommendations: async () => {
    // This logic for on-demand AI generation is also correct and complete.
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No Gemini API Key found");
        return;
    }
    set({ isGenerating: true });
    try {
        const state = get();
        const targetStation = state.stations[Math.floor(Math.random() * state.stations.length)];
        const targetMetrics = state.metrics.find(m => m.station_id === targetStation.id);
        const degradedMetrics = {
            ...targetMetrics,
            queue_level: Math.floor(Math.random() * 10) + 5,
            swap_rate: Math.floor(Math.random() * 20),
            error_count: Math.floor(Math.random() * 5)
        };
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = `
            You are an Autonomous Operations AI for an EV Battery Swapping Network.
            Analyze the following station telemetry and generate a structured recommendation.
            
            Station: ${targetStation.station_name} (${targetStation.city})
            Metrics: ${JSON.stringify(degradedMetrics)}
            
            Strictly output a SINGLE JSON object with no markdown formatting. The JSON must match this TypeScript interface:
            {
                "action_type": "reroute" | "ticket" | "rebalance" | "escalate" | "monitor",
                "owner_role": "driver" | "field_ops" | "admin",
                "why_text": "Short concise technical reason (max 10 words)",
                "impact_text": "Quantifiable business impact (max 10 words)",
                "confidence_score": number (0.0 to 1.0)
            }
        `;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiData = JSON.parse(cleanJson);
        const newRec: ExtendedRecommendation = {
            id: `rec-${uuidv4().slice(0, 8)}`,
            station_id: targetStation.id,
            station_name: targetStation.station_name,
            action_type: aiData.action_type,
            owner_role: aiData.owner_role,
            why_text: aiData.why_text,
            impact_text: aiData.impact_text,
            confidence_score: aiData.confidence_score,
            decision_status: 'pending',
            created_at: new Date().toISOString()
        };
        set(state => ({
            recommendations: [newRec, ...state.recommendations],
            notifications: [{
                id: `ntf-${uuidv4().slice(0, 8)}`,
                target_role: 'admin',
                channel: 'dashboard_log',
                message_text: `🤖 AI generated new recommendation for ${targetStation.station_name}`,
                is_read: false,
                sent_at: new Date().toISOString()
            }, ...state.notifications]
        }));
    } catch (error) {
        console.error("AI Generation failed:", error);
    } finally {
        set({ isGenerating: false });
    }
  }
}));
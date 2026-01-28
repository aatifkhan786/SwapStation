-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('driver', 'field_ops', 'admin');

-- Create enum for station status
CREATE TYPE public.station_status AS ENUM ('healthy', 'attention', 'risk', 'critical');

-- Create enum for alert priority
CREATE TYPE public.alert_priority AS ENUM ('P0', 'P1', 'P2', 'P3');

-- Create enum for alert status
CREATE TYPE public.alert_status AS ENUM ('new', 'acknowledged', 'resolved');

-- Create enum for risk type
CREATE TYPE public.risk_type AS ENUM ('congestion', 'stockout', 'charger_fault', 'outage', 'error_spike');

-- Create enum for action type
CREATE TYPE public.action_type AS ENUM ('reroute', 'ticket', 'rebalance', 'escalate', 'monitor');

-- Create enum for decision status
CREATE TYPE public.decision_status AS ENUM ('pending', 'approved', 'rejected', 'snoozed');

-- Create enum for ticket status
CREATE TYPE public.ticket_status AS ENUM ('new', 'acknowledged', 'in_progress', 'resolved');

-- Create enum for notification channel
CREATE TYPE public.notification_channel AS ENUM ('sms', 'whatsapp', 'dashboard_log');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  city TEXT,
  vehicle_info TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create stations table
CREATE TABLE public.stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_name TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  city TEXT NOT NULL,
  status station_status NOT NULL DEFAULT 'healthy',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create station_metrics table
CREATE TABLE public.station_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  swap_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  queue_level INTEGER NOT NULL DEFAULT 0,
  charger_uptime DECIMAL(5, 2) NOT NULL DEFAULT 100,
  charged_inventory INTEGER NOT NULL DEFAULT 0,
  uncharged_inventory INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE NOT NULL,
  risk_type risk_type NOT NULL,
  priority alert_priority NOT NULL,
  status alert_status NOT NULL DEFAULT 'new',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create recommendations table
CREATE TABLE public.recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES public.alerts(id) ON DELETE SET NULL,
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE NOT NULL,
  action_type action_type NOT NULL,
  owner_role app_role NOT NULL,
  why_text TEXT NOT NULL,
  impact_text TEXT NOT NULL,
  confidence_score DECIMAL(3, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  decision_status decision_status NOT NULL DEFAULT 'pending',
  decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES public.stations(id) ON DELETE CASCADE NOT NULL,
  issue_type TEXT NOT NULL,
  priority alert_priority NOT NULL DEFAULT 'P2',
  probable_root_cause TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status ticket_status NOT NULL DEFAULT 'new',
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID REFERENCES public.recommendations(id) ON DELETE SET NULL,
  target_role app_role NOT NULL,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  channel notification_channel NOT NULL DEFAULT 'dashboard_log',
  message_text TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- RLS Policies for user_roles (read-only for users)
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for stations (all authenticated users can read)
CREATE POLICY "Authenticated users can view stations"
  ON public.stations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage stations"
  ON public.stations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for station_metrics (all authenticated users can read)
CREATE POLICY "Authenticated users can view metrics"
  ON public.station_metrics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage metrics"
  ON public.station_metrics FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for alerts (all authenticated users can read)
CREATE POLICY "Authenticated users can view alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage alerts"
  ON public.alerts FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for recommendations
CREATE POLICY "Authenticated users can view recommendations"
  ON public.recommendations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage recommendations"
  ON public.recommendations FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tickets
CREATE POLICY "Authenticated users can view tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage all tickets"
  ON public.tickets FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Field ops can update assigned tickets"
  ON public.tickets FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'field_ops') 
    AND assigned_to = auth.uid()
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (
    target_user_id = auth.uid() 
    OR public.has_role(auth.uid(), 'admin')
    OR (target_role = public.get_user_role(auth.uid()))
  );

CREATE POLICY "Admins can manage notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own notification read status"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (target_user_id = auth.uid())
  WITH CHECK (target_user_id = auth.uid());

-- Trigger for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stations_updated_at
  BEFORE UPDATE ON public.stations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.stations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.station_metrics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recommendations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
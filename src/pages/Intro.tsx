import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Activity, 
  Brain, 
  Zap, 
  ShieldCheck, 
  Search, 
  Settings, 
  UserCheck, 
  Layers 
} from "lucide-react";

export default function Intro() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-black text-white font-sans">
      {/* --- BACKGROUND LAYER --- */}
      <div className="absolute inset-0 z-0">
        <img
          src="/intro-bg.png"
          alt="EV Operations Background"
          className="h-full w-full object-cover opacity-50" 
        />
        {/* Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* --- NAVIGATION / LOGO --- */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-1.5 rounded-lg">
            <Zap className="text-black" size={20} fill="currentColor" />
          </div>
          <span className="text-2xl font-bold tracking-tighter uppercase">Deeplinkers</span>
        </div>
        
        {/* Top Right Login Link */}
        <Link 
          to="/login"
          className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Login
        </Link>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 mx-auto max-w-7xl px-8 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT SIDE: CONTENT */}
        <div className="flex flex-col space-y-8">
          {/* Badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-4 py-1.5 text-xs font-medium tracking-wide text-emerald-400 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Agentic AI Copilot
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
            Next-Gen AI for <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent italic">
              EV Swap Operations
            </span>
          </h1>

          {/* Value Prop */}
          <p className="max-w-xl text-xl text-gray-400 leading-relaxed">
            <span className="text-white font-medium">Deeplinkers</span> helps EV operators prevent congestion, downtime, and service failures by detecting risks early and recommending explainable actions.
          </p>

          {/* CTAs - DIRECTING TO LOGIN */}
          <div className="flex flex-wrap items-center gap-5 pt-4">
            <Link
              to="/login"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-lg font-bold text-black transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              Launch Live Demo
              <ArrowRight className="transition group-hover:translate-x-1" size={20} />
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-lg font-medium text-white transition hover:bg-white/10"
            >
              Explore Admin Dashboard
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE: ABSTRACT SYSTEM VISUAL */}
        <div className="hidden lg:flex relative justify-center items-center">
          <div className="relative w-full max-w-md aspect-square">
            {/* Abstract Radar/Node Visual using CSS */}
            <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-10 rounded-full border border-emerald-500/10 animate-[spin_15s_linear_infinite_reverse]" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="bg-emerald-500/20 p-8 rounded-3xl backdrop-blur-3xl border border-emerald-500/30">
                  <Brain size={80} className="text-emerald-400" />
                </div>
                {/* Floating Signal Icons */}
                <div className="absolute -top-4 -right-4 bg-black border border-white/10 p-3 rounded-xl shadow-xl animate-bounce">
                  <Activity size={24} className="text-teal-400" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-black border border-white/10 p-3 rounded-xl shadow-xl">
                  <ShieldCheck size={24} className="text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- TRUST SIGNAL STRIP --- */}
      <div className="relative z-10 border-y border-white/5 bg-white/[0.02] backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-8 py-8 flex flex-wrap justify-between items-center gap-6">
          <TrustBadge icon={<UserCheck size={18} />} label="Human-in-the-Loop AI" />
          <TrustBadge icon={<Search size={18} />} label="Explainable Decisions" />
          <TrustBadge icon={<ShieldCheck size={18} />} label="Policy-Controlled Actions" />
          <TrustBadge icon={<Settings size={18} />} label="Realistic Ops Workflows" />
        </div>
      </div>

      {/* --- MONITORING CAPABILITIES SECTION --- */}
      <section className="relative z-10 mx-auto max-w-7xl px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FlowCard 
            icon={<Activity />} 
            title="Sense" 
            desc="Swap rates, demand surges, charger uptime, and uncharged inventory mix." 
          />
          <FlowCard 
            icon={<Brain />} 
            title="Think" 
            desc="Identify recurring fault patterns and stockout predictions via agentic logic." 
          />
          <FlowCard 
            icon={<Zap />} 
            title="Act" 
            desc="Reroute drivers, raise tickets, and trigger automated rebalancing." 
          />
          <FlowCard 
            icon={<Layers />} 
            title="Explain" 
            desc="Actionable insights with confidence scores and expected operational impact." 
          />
        </div>
      </section>

      {/* Bottom Fade */}
      <div className="pointer-events-none absolute bottom-0 h-64 w-full bg-gradient-to-t from-black to-transparent" />
      
      {/* Footer-like strip */}
      <footer className="relative z-10 text-center pb-12">
        <p className="text-sm text-gray-500 tracking-widest uppercase">
          Enterprise AI • Realistic Operations Workflow • Hackathon MVP
        </p>
      </footer>
    </div>
  );
}

/* ---------- Small Components ---------- */

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-400 transition hover:text-white cursor-default">
      <div className="text-emerald-500/70">{icon}</div>
      <span className="text-sm font-medium tracking-tight">{label}</span>
    </div>
  );
}

function FlowCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/5 bg-white/[0.03] p-8 transition-all hover:border-emerald-500/40 hover:bg-white/[0.06] hover:-translate-y-1">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold">{title}</h3>
      <p className="text-sm leading-relaxed text-gray-400 group-hover:text-gray-300">
        {desc}
      </p>
    </div>
  );
}
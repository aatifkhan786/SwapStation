import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { demoUsers, UserRole } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Zap, User, Wrench, Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const roleIcons: Record<UserRole, React.ElementType> = {
  admin: Shield,
  field_ops: Wrench,
  driver: User,
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<UserRole | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  };

  const handleDemoLogin = async (role: UserRole) => {
    setDemoLoading(role);
    const demoUser = demoUsers.find(u => u.role === role);
    
    if (!demoUser) return;

    let { error } = await signIn(demoUser.email, demoUser.password);
    
    if (error?.message?.includes('Invalid login credentials')) {
      const { error: signUpError } = await signUp(
        demoUser.email, 
        demoUser.password, 
        demoUser.name, 
        demoUser.role
      );
      
      if (signUpError) {
        toast({ title: 'Demo login failed', description: signUpError.message, variant: 'destructive' });
        setDemoLoading(null);
        return;
      }
      
      const { error: signInError } = await signIn(demoUser.email, demoUser.password);
      if (signInError) {
        toast({ title: 'Demo login failed', description: signInError.message, variant: 'destructive' });
        setDemoLoading(null);
        return;
      }
    } else if (error) {
      toast({ title: 'Demo login failed', description: error.message, variant: 'destructive' });
      setDemoLoading(null);
      return;
    }
    
    setDemoLoading(null);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image Layer */}
      <div
        className="absolute inset-0 scale-110 animate-bgPan"
        style={{
          backgroundImage: "url('/intro-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(1px)", // Increased blur slightly for better text contrast
          opacity: 0.92,
        }}
      />
      
      {/* 
         Removed the dark overlay layer to make it brighter.
         Added a very light white wash instead.
      */}
      <div className="absolute inset-0 bg-white/10" />

      {/* GLASS CARD */}
      <Card
        className={`
          relative z-10 w-full max-w-md rounded-[28px]
          backdrop-blur-[6px]
          bg-white/0.02          /* CHANGED: Made background much lighter (60% white) */
          border border-white/40
          shadow-[0_40px_100px_rgba(0,0,0,0.2)]
          ring-1 ring-white/40
          transition-all duration-1000
          ${
            mounted
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-12 scale-95"
          }
        `}
      >
        <div className="absolute inset-0 rounded-[28px] bg-gradient-to-b from-white/60 via-white/30 to-transparent pointer-events-none" />

        <CardHeader className="relative text-center space-y-3 pt-8">
          {/* Logo container changed to darker background for contrast */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 shadow-xl">
            <Zap className="h-9 w-9 text-white" />
          </div>
          {/* CHANGED: Text to Gray-900 (Black) */}
          <CardTitle className="text-3xl font-bold text-gray-900 drop-shadow-sm">
            Deeplinkers
          </CardTitle>
          {/* CHANGED: Description to Gray-700 */}
          <CardDescription className="text-sm font-medium text-gray-700">
            Agentic AI Copilot for EV Swap Station Operations
          </CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-6 px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              {/* CHANGED: Label to dark gray */}
              <Label className="text-gray-800 font-semibold" htmlFor="email">Email</Label>
              {/* CHANGED: Input styles for black text visibility */}
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-gray-900 focus:border-gray-900 font-medium shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-800 font-semibold" htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-white/50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-gray-900 focus:border-gray-900 font-medium shadow-sm"
              />
            </div>
            {/* Sign In Button - Kept distinct */}
            <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg bg-gray-900 hover:bg-black text-white" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="relative my-4">
            <Separator className="bg-gray-400" />
            {/* CHANGED: Separator text and background to blend with lighter card */}
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent backdrop-blur-sm px-2 text-xs font-medium text-gray-600">
              Demo Accounts
            </span>
          </div>

          <div className="space-y-2">
            {demoUsers.map((user) => {
              const Icon = roleIcons[user.role];
              return (
                <Button
                  key={user.role}
                  variant="outline"
                  // CHANGED: Demo buttons to have dark text and visible borders
                  className="w-full justify-start gap-3 bg-white/60 border-gray-300 hover:bg-black/90 text-gray-900 shadow-sm"
                  onClick={() => handleDemoLogin(user.role)}
                  disabled={demoLoading !== null}
                >
                  {demoLoading === user.role ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-900" />
                  ) : (
                    <Icon className="h-4 w-4 text-gray-700" />
                  )}
                  <span className="flex-1 text-left font-semibold">{user.email}</span>
                  <span className="text-xs font-medium opacity-75 capitalize text-gray-600">
                    {user.role.replace('_', ' ')}
                  </span>
                </Button>
              );
            })}
          </div>

          <p className="text-xs text-center text-gray-600 font-medium mt-4">
            All demo accounts use password: <code className="bg-white/50 px-1.5 py-0.5 rounded border border-gray-300 text-gray-900">demo123</code>
          </p>
        </CardContent>
      </Card>

      <style>{`
        @keyframes bgPan {
          0% { transform: scale(1.1) translateX(0) translateY(0); }
          50% { transform: scale(1.1) translateX(-20px) translateY(-10px); }
          100% { transform: scale(1.1) translateX(0) translateY(0); }
        }
        .animate-bgPan {
          animation: bgPan 40s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
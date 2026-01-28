import { useState } from 'react';
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

const roleColors: Record<UserRole, string> = {
  admin: 'bg-primary hover:bg-primary/90',
  field_ops: 'bg-status-healthy hover:bg-status-healthy/90',
  driver: 'bg-status-attention hover:bg-status-attention/90 text-black',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<UserRole | null>(null);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

    // Try to sign in first
    let { error } = await signIn(demoUser.email, demoUser.password);
    
    // If user doesn't exist, create the account
    if (error?.message?.includes('Invalid login credentials')) {
      const { error: signUpError } = await signUp(
        demoUser.email, 
        demoUser.password, 
        demoUser.name, 
        demoUser.role
      );
      
      if (signUpError) {
        toast({
          title: 'Demo login failed',
          description: signUpError.message,
          variant: 'destructive',
        });
        setDemoLoading(null);
        return;
      }
      
      // Sign in after signup
      const { error: signInError } = await signIn(demoUser.email, demoUser.password);
      if (signInError) {
        toast({
          title: 'Demo login failed',
          description: signInError.message,
          variant: 'destructive',
        });
        setDemoLoading(null);
        return;
      }
    } else if (error) {
      toast({
        title: 'Demo login failed',
        description: error.message,
        variant: 'destructive',
      });
      setDemoLoading(null);
      return;
    }
    
    setDemoLoading(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary mb-4">
            <Zap className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Deeplinkers</h1>
          <p className="text-muted-foreground">
            Agentic AI Copilot for EV Swap Station Operations
          </p>
        </div>

        {/* Login Card */}
        <Card className="card-gradient glow-border">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials or use a demo account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
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
                    className={`w-full justify-start gap-3 ${roleColors[user.role]} border-0`}
                    onClick={() => handleDemoLogin(user.role)}
                    disabled={demoLoading !== null}
                  >
                    {demoLoading === user.role ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                    <span className="flex-1 text-left">{user.email}</span>
                    <span className="text-xs opacity-75 capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </Button>
                );
              })}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              All demo accounts use password: <code className="bg-secondary px-1 rounded">demo123</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

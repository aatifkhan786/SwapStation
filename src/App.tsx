import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Intro from "@/pages/Intro"; // Make sure Intro.tsx is in src/pages/
import Login from "@/pages/auth/Login";
import DriverDashboard from "@/pages/driver/Dashboard";
import FieldOpsDashboard from "@/pages/field-ops/Dashboard";
import NotFound from "@/pages/NotFound";
import AdminRoutes from "@/pages/admin/AdminRoutes";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to their appropriate dashboard
    const redirectMap: Record<string, string> = {
      driver: '/driver',
      field_ops: '/field-ops',
      admin: '/admin',
    };
    return <Navigate to={redirectMap[userRole] || '/login'} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function RoleBasedRedirect() {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const redirectMap: Record<string, string> = {
    driver: '/driver',
    field_ops: '/field-ops',
    admin: '/admin',
  };

  return <Navigate to={redirectMap[userRole] || '/login'} replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* ROOT ROUTE: Intro Page is now the first thing seen */}
      <Route path="/" element={<Intro />} />

      {/* LOGIN ROUTE: If user is logged in, redirect to dashboard. If not, show Login. */}
      {/* Intro page links point here */}
      <Route path="/login" element={user ? <RoleBasedRedirect /> : <Login />} />
      
      {/* Driver routes */}
      <Route
        path="/driver"
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/driver/*"
        element={
          <ProtectedRoute allowedRoles={['driver']}>
            <DriverDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Field Ops routes */}
      <Route
        path="/field-ops"
        element={
          <ProtectedRoute allowedRoles={['field_ops']}>
            <FieldOpsDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/field-ops/*"
        element={
          <ProtectedRoute allowedRoles={['field_ops']}>
            <FieldOpsDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Admin routes */}
      <Route
         path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminRoutes />
          </ProtectedRoute>
        }
      />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
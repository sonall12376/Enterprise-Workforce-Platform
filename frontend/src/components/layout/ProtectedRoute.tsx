import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <span className="text-sm font-medium">Verifying access credentials...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full text-center space-y-6 bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="inline-flex items-center justify-center p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl mb-2">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-200">Access Denied</h1>
          <p className="text-slate-400 text-sm">
            Your account ({user.role}) does not have permissions to access this module.
          </p>
          <div className="pt-2">
            <Navigate to="/" replace />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

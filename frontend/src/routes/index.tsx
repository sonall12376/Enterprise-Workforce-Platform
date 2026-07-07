import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginPage from '../features/auth/pages/LoginPage';

// Basic landing placeholder
const HomePlaceholder = () => {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 font-sans p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full text-center space-y-6 bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-slate-800 z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 mb-2">
            <span className="text-white font-extrabold text-xl tracking-wider">WFM</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Enterprise WFM
          </h1>
          <p className="text-slate-400 text-sm">
            Welcome to the workforce management platform dashboard.
          </p>
        </div>

        {/* User Profile Card */}
        {user && (
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-left space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Logged In User
            </div>
            <div className="text-slate-200 font-bold text-lg">{user.name}</div>
            <div className="text-slate-400 text-sm">{user.email}</div>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Role: {user.role}
            </div>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={logout}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm rounded-xl transition-all active:scale-[0.98] cursor-pointer border border-slate-700"
          >
            Sign Out
          </button>
        </div>

        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap justify-center gap-2">
          <span className="px-2 py-1 text-xs font-semibold bg-indigo-950 text-indigo-400 rounded-md border border-indigo-900/50">Vite</span>
          <span className="px-2 py-1 text-xs font-semibold bg-blue-950 text-blue-400 rounded-md border border-blue-900/50">React 19</span>
          <span className="px-2 py-1 text-xs font-semibold bg-sky-950 text-sky-400 rounded-md border border-sky-900/50">Tailwind</span>
          <span className="px-2 py-1 text-xs font-semibold bg-violet-950 text-violet-400 rounded-md border border-violet-900/50">TypeScript</span>
        </div>
      </div>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePlaceholder />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;


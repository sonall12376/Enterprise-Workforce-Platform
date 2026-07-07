import React, { useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/helpers';
import { Bell, Clock, Calendar, DollarSign, Award, FileText, CheckCircle, ShieldAlert, LogOut, CheckCheck, RefreshCw } from 'lucide-react';

export const NotificationPage: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { notifications, fetchNotifications, markSingleRead, markAllRead, loading } = useNotifications();

  useEffect(() => {
    if (user) {
      // Fetch all notifications (both read and unread) for history view
      fetchNotifications(true);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full text-center space-y-4 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Unauthenticated</h2>
          <p className="text-slate-400 text-sm">
            Please log in first to view your Notifications Hub.
          </p>
          <a
            href="/"
            className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors"
          >
            Go to Landing
          </a>
        </div>
      </div>
    );
  }

  const getCategoryStyles = (type: string) => {
    switch (type) {
      case 'ATTENDANCE':
        return {
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'LEAVE':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <Calendar className="w-4 h-4" />,
        };
      case 'PAYROLL':
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <DollarSign className="w-4 h-4" />,
        };
      case 'PERFORMANCE':
        return {
          bg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
          icon: <Award className="w-4 h-4" />,
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
          icon: <FileText className="w-4 h-4" />,
        };
    }
  };

  const unreadAlerts = notifications.filter((n) => !n.isRead);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-500 fill-indigo-500" />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Notification Center
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all flex items-center gap-1.5 text-sm"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-850 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Alerts & Notifications log
              {unreadAlerts.length > 0 && (
                <span className="px-2.5 py-0.5 text-xs bg-rose-600 text-white rounded-full font-bold">
                  {unreadAlerts.length} Unread
                </span>
              )}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Browse through your past email and system notifications.
            </p>
          </div>

          {unreadAlerts.length > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-indigo-400 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              Clear All Unread
            </button>
          )}
        </div>

        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
            <span>Loading notifications...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-550 font-medium">
                No notifications logged for your account yet.
              </div>
            ) : (
              notifications.map((n) => {
                const styles = getCategoryStyles(n.type);

                return (
                  <div
                    key={n._id}
                    className={`bg-slate-900 border rounded-2xl p-5 shadow-xl relative transition-all flex gap-4 ${
                      n.isRead ? 'border-slate-800/80 opacity-75' : 'border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg border h-10 w-10 shrink-0 flex items-center justify-center ${styles.bg}`}>
                      {styles.icon}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-bold truncate ${n.isRead ? 'text-slate-300 font-semibold' : 'text-white'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed break-words">
                        {n.message}
                      </p>
                    </div>

                    {!n.isRead && (
                      <button
                        onClick={() => markSingleRead(n._id)}
                        className="p-1 text-slate-500 hover:text-emerald-450 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 rounded-lg shrink-0 self-start transition-all"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default NotificationPage;

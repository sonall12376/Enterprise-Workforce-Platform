import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../../context/NotificationContext';
import { formatDate } from '../../../utils/helpers';
import { Bell, Check, Clock, Calendar, DollarSign, Award, FileText, CheckCheck } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markSingleRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markSingleRead(id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800 rounded-xl transition-all"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-extrabold text-white shadow-lg shadow-rose-900/30">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Container */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-250">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/20">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Notifications
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] bg-indigo-650 text-white rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </h4>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>

          {/* Alerts List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-550 text-xs font-semibold">
                No unread notifications alerts.
              </div>
            ) : (
              notifications.map((n) => {
                const styles = getCategoryStyles(n.type);

                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n._id, n.isRead)}
                    className={`p-4 flex gap-3 text-left transition-colors cursor-pointer ${
                      n.isRead ? 'hover:bg-slate-800/20' : 'bg-indigo-500/[0.02] hover:bg-slate-800/40'
                    }`}
                  >
                    <div className={`p-2 rounded-lg border shrink-0 h-8 w-8 flex items-center justify-center ${styles.bg}`}>
                      {styles.icon}
                    </div>

                    <div className="space-y-1 overflow-hidden flex-1">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-bold leading-none ${n.isRead ? 'text-slate-300' : 'text-white'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markSingleRead(n._id);
                            }}
                            className="p-0.5 text-slate-500 hover:text-emerald-450 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-[9px] text-slate-600 font-medium">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default NotificationCenter;

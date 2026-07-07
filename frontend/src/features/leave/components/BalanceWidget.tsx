import React from 'react';
import { LeaveBalanceRecord } from '../types';
import { Calendar, AlertCircle, CheckSquare, Sparkles } from 'lucide-react';

interface BalanceWidgetProps {
  balances: LeaveBalanceRecord[];
  loading: boolean;
}

export const BalanceWidget: React.FC<BalanceWidgetProps> = ({ balances, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse h-32"></div>
        ))}
      </div>
    );
  }

  const getCardStyles = (type: string) => {
    switch (type) {
      case 'Casual':
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/20',
          text: 'text-indigo-400',
          indicator: 'bg-indigo-500',
          icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
        };
      case 'Sick':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20',
          text: 'text-amber-400',
          indicator: 'bg-amber-500',
          icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
        };
      case 'Earned':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          text: 'text-emerald-400',
          indicator: 'bg-emerald-500',
          icon: <CheckSquare className="w-5 h-5 text-emerald-400" />,
        };
      default:
        return {
          bg: 'bg-slate-500/10 border-slate-500/20',
          text: 'text-slate-400',
          indicator: 'bg-slate-500',
          icon: <Calendar className="w-5 h-5 text-slate-400" />,
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {balances.map((bal) => {
        const style = getCardStyles(bal.leaveType);
        const available = bal.allocated - bal.used - bal.pending;

        return (
          <div
            key={bal._id}
            className={`border rounded-2xl p-6 shadow-xl text-white relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${style.bg}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold tracking-wide uppercase text-slate-400">{bal.leaveType} Leave</span>
              {style.icon}
            </div>

            {/* Balances */}
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold font-mono ${style.text}`}>
                {available}
              </span>
              <span className="text-slate-400 text-sm">days available</span>
            </div>

            {/* Bottom Breakdowns */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-3 gap-2 text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              <div>
                <p>Allocated</p>
                <p className="text-slate-300 text-sm font-mono mt-0.5">{bal.allocated}</p>
              </div>
              <div>
                <p>Pending</p>
                <p className="text-slate-300 text-sm font-mono mt-0.5">{bal.pending}</p>
              </div>
              <div>
                <p>Used</p>
                <p className="text-slate-300 text-sm font-mono mt-0.5">{bal.used}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default BalanceWidget;

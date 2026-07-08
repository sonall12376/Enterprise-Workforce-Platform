import React, { useState, useEffect } from 'react';
import { clockIn, clockOut } from '../services/attendanceService';
import { Clock, LogIn, LogOut, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { Coordinates } from '../types';

interface ClockWidgetProps {
  onStatusChange: () => void;
  currentActiveLog: { clockIn: string; status: string } | null;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ onStatusChange, currentActiveLog }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>('00:00:00');

  // Live timer for active work session
  useEffect(() => {
    if (!currentActiveLog) {
      setDuration('00:00:00');
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(currentActiveLog.clockIn).getTime();
      const now = new Date().getTime();
      const diffMs = now - start;

      if (diffMs <= 0) {
        setDuration('00:00:00');
        return;
      }

      const totalSecs = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;

      const pad = (num: number) => String(num).padStart(2, '0');
      setDuration(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentActiveLog]);

  const getCoordinates = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          let msg = 'Failed to retrieve your location.';
          if (err.code === err.PERMISSION_DENIED) {
            msg = 'Location access denied. Please enable location permissions to clock-in.';
          }
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  };

  const handleClockIn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let coords: Coordinates | undefined;
      try {
        coords = await getCoordinates();
      } catch (locErr) {
        setError((locErr as Error).message);
        setLoading(false);
        return;
      }

      await clockIn(coords);
      setSuccess('Clocked in successfully!');
      onStatusChange();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to clock in.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await clockOut();
      setSuccess('Clocked out successfully!');
      onStatusChange();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to clock out.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const isClockedIn = !!currentActiveLog;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Active Status Display */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isClockedIn ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isClockedIn ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className="text-slate-400 text-sm font-semibold tracking-wider uppercase">
              {isClockedIn ? 'Work Session Active' : 'Off Duty'}
            </span>
          </div>

          {isClockedIn ? (
            <div>
              <h3 className="text-4xl font-mono font-bold tracking-tight text-emerald-400">
                {duration}
              </h3>
              <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Clocked in at {new Date(currentActiveLog.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${currentActiveLog.status === 'Late' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {currentActiveLog.status}
                </span>
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-3xl font-bold tracking-tight text-slate-100">
                Ready to Start?
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Log your daily attendance. Ensure GPS location permissions are enabled.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center gap-2 min-w-[200px]">
          {isClockedIn ? (
            <button
              onClick={handleClockOut}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-rose-900/30"
            >
              <LogOut className="w-5 h-5 animate-pulse" />
              {loading ? 'Processing...' : 'Clock Out'}
            </button>
          ) : (
            <button
              onClick={handleClockIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/30"
            >
              <LogIn className="w-5 h-5" />
              {loading ? 'Verifying location...' : 'Clock In'}
            </button>
          )}

          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-500" />
            Geofence boundaries checked
          </span>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-2 text-emerald-400 text-xs">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};

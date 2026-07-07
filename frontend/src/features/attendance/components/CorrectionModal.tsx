import React, { useState, useEffect } from 'react';
import { AttendanceRecord } from '../types';
import { submitCorrection } from '../services/attendanceService';
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDate } from '../../../utils/helpers';

interface CorrectionModalProps {
  record: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CorrectionModal: React.FC<CorrectionModalProps> = ({
  record,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Initialize form fields with original log values
  useEffect(() => {
    if (record) {
      const getFormattedTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      setClockInTime(getFormattedTime(record.clockIn));
      setClockOutTime(record.clockOut ? getFormattedTime(record.clockOut) : '18:00');
      setReason('');
      setError(null);
      setSuccess(false);
    }
  }, [record, isOpen]);

  if (!isOpen || !record) return null;

  const combineDateAndTime = (baseDateStr: string, timeStr: string): string => {
    const d = new Date(baseDateStr);
    const [hours, minutes] = timeStr.split(':');
    d.setHours(parseInt(hours, 10));
    d.setMinutes(parseInt(minutes, 10));
    d.setSeconds(0);
    d.setMilliseconds(0);
    return d.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const reqIn = combineDateAndTime(record.date, clockInTime);
    const reqOut = combineDateAndTime(record.date, clockOutTime);

    if (new Date(reqOut) <= new Date(reqIn)) {
      setError('Requested clock-out time must be after the clock-in time.');
      setLoading(false);
      return;
    }

    try {
      await submitCorrection({
        attendanceId: record._id,
        requestedClockIn: reqIn,
        requestedClockOut: reqOut,
        reason,
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to submit correction request.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Request Time Correction</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Target Date:</span> {formatDate(record.date)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Requested Clock-In
              </label>
              <input
                type="time"
                value={clockInTime}
                onChange={(e) => setClockInTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Requested Clock-Out
              </label>
              <input
                type="time"
                value={clockOutTime}
                onChange={(e) => setClockOutTime(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Reason / Justification
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              placeholder="e.g. Forgot to clock out, client meeting, power failure..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 resize-none"
            ></textarea>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-2 text-emerald-400 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Correction request submitted successfully!</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/60 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-900/20"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

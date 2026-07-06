import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { HelpDeskTicket } from '../types/helpDeskTypes';
import taskService from '../../projects/services/taskService';

interface TicketAssignModalProps {
  ticket: HelpDeskTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignedToId: string) => Promise<void>;
  isLoading: boolean;
}

export const TicketAssignModal: React.FC<TicketAssignModalProps> = ({ ticket, isOpen, onClose, onAssign, isLoading }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [fetchingEmployees, setFetchingEmployees] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const loadEmployees = async () => {
      if (!isOpen) return;
      setFetchingEmployees(true);
      setFetchError(null);
      try {
        // Reuse taskService's organizational members list
        const data = await taskService.getProjectMembers('603d2e1b12cf000000000002');
        setEmployees(data);
        if (data.length > 0) {
          setSelectedEmployeeId(data[0]._id);
        }
      } catch (err: any) {
        console.error('Failed to load agents for ticket assignment:', err);
        setFetchError('Failed to fetch eligible support agents');
      } finally {
        setFetchingEmployees(false);
      }
    };

    loadEmployees();
  }, [isOpen]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    await onAssign(selectedEmployeeId);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/80">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">Assign Support Agent</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all duration-150 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-sm text-slate-400 bg-slate-850/40 p-4 rounded-xl border border-slate-800/80 space-y-1">
            <p>
              <span className="text-slate-500">Subject:</span> <strong className="text-slate-200">{ticket.subject}</strong>
            </p>
            <p>
              <span className="text-slate-500">Category:</span>{' '}
              <span className="text-slate-300 font-medium">{ticket.category}</span>
            </p>
            <p>
              <span className="text-slate-500">Priority:</span>{' '}
              <span className="text-rose-400 font-medium">{ticket.priority}</span>
            </p>
          </div>

          {fetchError && <p className="text-xs text-rose-400 font-medium">{fetchError}</p>}

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300">Select Agent</label>
            {fetchingEmployees ? (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
                <Loader2 size={14} className="animate-spin text-violet-500" />
                Retrieving active staff roster...
              </div>
            ) : employees.length > 0 ? (
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
              >
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id} className="bg-slate-900 text-slate-200">
                    {emp.name} ({emp.role}) - {emp.employeeId}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-slate-500 italic">No agents available for ticket assignment</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-800/80 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 font-medium transition-all duration-150 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedEmployeeId || fetchingEmployees}
              className="px-5 py-2.5 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-950/30 hover:shadow-violet-950/50 font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              Assign Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

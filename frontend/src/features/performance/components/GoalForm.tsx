import React, { useState, useEffect } from 'react';
import { createGoal } from '../services/performanceService';
import api from '../../../services/api';
import { PlusCircle, Target, User, AlertCircle, CheckCircle } from 'lucide-react';

interface EmployeeOption {
  id: string;
  employeeId: string;
  name: string;
  email: string;
}

interface GoalFormProps {
  onSuccess: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSuccess }) => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setFetching(true);
      try {
        const res = await api.get('/employees');
        if (res.data && res.data.status === 'success' && res.data.data.employees) {
          setEmployees(
            res.data.data.employees.map((e: any) => ({
              id: e.id || e._id,
              employeeId: e.employeeId,
              name: e.name,
              email: e.email,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch employees list for goals creation:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) {
      setError('Please select an employee.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // API expects ISO string format for targetDate
      const targetISO = new Date(`${targetDate}T18:00:00.000Z`).toISOString();
      await createGoal({
        employeeId: selectedEmp,
        title,
        targetDate: targetISO,
      });

      setSuccess(true);
      setTitle('');
      setTargetDate('');
      setSelectedEmp('');
      onSuccess();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to assign goal.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center gap-2">
        <Target className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white">Assign Employee Goal</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Assign To Employee
          </label>
          <div className="relative">
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              required
              disabled={fetching}
              className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 appearance-none"
            >
              <option value="">{fetching ? 'Loading directory...' : '-- Choose Employee --'}</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.employeeId})
                </option>
              ))}
            </select>
            <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Goal description / Milestone
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={5}
              placeholder="e.g. Implement performance test scripts"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Target Deadline
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
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
            <span>Goal defined and assigned successfully!</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-950/20 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            {loading ? 'Assigning...' : 'Assign Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default GoalForm;

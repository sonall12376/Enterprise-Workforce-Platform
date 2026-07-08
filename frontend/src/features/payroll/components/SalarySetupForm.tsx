import React, { useState, useEffect } from 'react';
import { setupSalary } from '../services/payrollService';
import api from '../../../services/api';
import { DollarSign, User, AlertCircle, CheckCircle } from 'lucide-react';

interface EmployeeOption {
  id: string;
  employeeId: string;
  name: string;
  email: string;
}

export const SalarySetupForm: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [baseSalary, setBaseSalary] = useState<number>(0);
  const [allowances, setAllowances] = useState<number>(0);
  const [deductions, setDeductions] = useState<number>(0);
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
          // Map to correct properties
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
        console.error('Failed to fetch employees list for salary setup:', err);
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
      await setupSalary({
        employeeId: selectedEmp,
        baseSalary,
        allowances,
        deductions,
      });
      setSuccess(true);
      setBaseSalary(0);
      setAllowances(0);
      setDeductions(0);
      setSelectedEmp('');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to update salary settings.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white">Employee Salary Setup</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Select Employee
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Base Contractual Salary ($)
            </label>
            <input
              type="number"
              value={baseSalary || ''}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              required
              min={0}
              placeholder="e.g. 5000"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Monthly Allowances ($)
            </label>
            <input
              type="number"
              value={allowances || ''}
              onChange={(e) => setAllowances(Number(e.target.value))}
              min={0}
              placeholder="e.g. 300"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Base Deductions ($)
            </label>
            <input
              type="number"
              value={deductions || ''}
              onChange={(e) => setDeductions(Number(e.target.value))}
              min={0}
              placeholder="e.g. 150"
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
            <span>Salary configuration updated successfully!</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-950/20"
          >
            {loading ? 'Saving Settings...' : 'Update Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default SalarySetupForm;

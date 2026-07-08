import React, { useState, useEffect } from 'react';
import { calculatePayroll, processPayroll } from '../services/payrollService';
import api from '../../../services/api';
import { formatCurrency } from '../../../utils/helpers';
import { Calculator, Play, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface EmployeeOption {
  id: string;
  employeeId: string;
  name: string;
  email: string;
}

interface CalculationResult {
  payrollId?: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
}

export const PayrollCalculator: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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
        console.error('Failed to fetch employees list for calculation:', err);
      } finally {
        setFetching(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) {
      setError('Please select an employee.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setSuccessMsg(null);

    try {
      const res = await calculatePayroll({
        employeeId: selectedEmp,
        month,
        year,
      });

      if (res.status === 'success' && res.data) {
        setResult(res.data);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to calculate payroll.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedEmp || !month || !year) return;
    setApproving(true);
    setError(null);
    try {
      // Find the draft payroll ID to process
      const payslipsRes = await api.get('/payroll/payslips', {
        params: { employeeId: selectedEmp }
      });
      
      const draftPayroll = payslipsRes.data?.data?.find(
        (p: any) => p.month === month && p.year === year && p.status === 'Draft'
      );

      if (!draftPayroll) {
        throw new Error('Draft payroll record not found. Please calculate again.');
      }

      await processPayroll(draftPayroll._id, 'Approved');
      setSuccessMsg('Payroll calculations approved successfully!');
      setResult(null);
      setSelectedEmp('');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to approve payroll.';
      setError(errMsg);
    } finally {
      setApproving(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white">Payroll Engine Run</h3>
      </div>

      <div className="p-6 space-y-6">
        <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-3 items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Employee
            </label>
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              required
              disabled={fetching}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            >
              <option value="">{fetching ? 'Loading directory...' : '-- Choose Employee --'}</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {months.map((name, i) => (
                  <option key={i} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/20"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Running Engine...' : 'Calculate Payroll'}
          </button>
        </form>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-2 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Display Draft Results */}
        {result && (
          <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm">Calculated Run Summary</h4>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                  Status: <span className="text-amber-500">Draft Logged</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-slate-450">Contract Base Salary:</span>
              <span className="text-right text-white font-mono font-semibold">{formatCurrency(result.baseSalary)}</span>

              <span className="text-slate-450">Active Allowances:</span>
              <span className="text-right text-emerald-400 font-mono font-semibold">+{formatCurrency(result.allowances)}</span>

              <span className="text-slate-450">Total Deductions:</span>
              <span className="text-right text-rose-400 font-mono font-semibold">-{formatCurrency(result.deductions)}</span>

              <div className="col-span-2 border-t border-slate-800/80 my-1"></div>

              <span className="text-white font-bold text-base">Calculated Net Pay:</span>
              <span className="text-right text-indigo-400 font-mono font-bold text-base">{formatCurrency(result.netPay)}</span>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-950/20"
              >
                <ShieldCheck className="w-4 h-4" />
                {approving ? 'Approving...' : 'Approve Calculations'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PayrollCalculator;

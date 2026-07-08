import React from 'react';
import { PayrollRecord } from '../types';
import { formatCurrency } from '../../../utils/helpers';
import { FileText, Receipt, RefreshCw } from 'lucide-react';

interface PayslipsTableProps {
  payslips: PayrollRecord[];
  loading: boolean;
  onViewDetails: (payslip: PayrollRecord) => void;
}

export const PayslipsTable: React.FC<PayslipsTableProps> = ({
  payslips,
  loading,
  onViewDetails,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Paid
          </span>
        );
      case 'Approved':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Approved
          </span>
        );
      case 'PendingApproval':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Pending Approval
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Draft
          </span>
        );
    }
  };

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <span>Loading payslips...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-400" />
          Payslips Directory
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-slate-300">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 text-xs font-semibold tracking-wider border-b border-slate-800">
              <th className="p-4">Pay Period</th>
              <th className="p-4">Base Salary</th>
              <th className="p-4">Allowances</th>
              <th className="p-4">Deductions</th>
              <th className="p-4">Net Salary</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {payslips.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                  No payroll logs or payslips recorded yet.
                </td>
              </tr>
            ) : (
              payslips.map((pay) => (
                <tr key={pay._id} className="hover:bg-slate-800/25 transition-colors">
                  <td className="p-4 font-semibold text-white">
                    {months[pay.month - 1]} {pay.year}
                  </td>
                  <td className="p-4 font-mono">{formatCurrency(pay.baseSalary)}</td>
                  <td className="p-4 font-mono text-emerald-450">+{formatCurrency(pay.allowances)}</td>
                  <td className="p-4 font-mono text-rose-450">-{formatCurrency(pay.deductions)}</td>
                  <td className="p-4 font-mono font-bold text-indigo-400">{formatCurrency(pay.netPay)}</td>
                  <td className="p-4 text-center">{getStatusBadge(pay.status)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onViewDetails(pay)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-indigo-400 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-150 flex items-center gap-1 mx-auto"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default PayslipsTable;

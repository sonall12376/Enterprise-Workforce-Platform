import React from 'react';
import { PayrollRecord } from '../types';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import { X, Printer } from 'lucide-react';

interface PayslipDetailsModalProps {
  payslip: PayrollRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PayslipDetailsModal: React.FC<PayslipDetailsModalProps> = ({
  payslip,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const employeeName = typeof payslip.employeeId === 'object' && payslip.employeeId !== null
    ? (payslip.employeeId as any).name || 'Employee'
    : 'Employee';

  const employeeEmail = typeof payslip.employeeId === 'object' && payslip.employeeId !== null
    ? (payslip.employeeId as any).email || '—'
    : '—';

  const employeeIdCode = typeof payslip.employeeId === 'object' && payslip.employeeId !== null
    ? (payslip.employeeId as any).employeeId || '—'
    : payslip.employeeId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative print:bg-white print:border-none print:shadow-none print:w-full print:max-w-none">
        
        {/* Header - Hidden in Print */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 print:hidden">
          <h3 className="text-lg font-bold text-white">Payslip Details</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 bg-slate-850 hover:bg-slate-800 text-indigo-400 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-805 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Page Body */}
        <div className="p-8 space-y-6 text-slate-350 print:text-black print:p-4">
          
          {/* Top Brand Banner */}
          <div className="flex justify-between items-start border-b border-slate-800/80 pb-6 print:border-slate-300">
            <div>
              <h2 className="text-2xl font-extrabold text-white print:text-black tracking-tight">
                Enterprise Workforce
              </h2>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                Workforce Management System
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-block px-3 py-1.5 rounded-lg text-xs font-extrabold border ${
                payslip.status === 'Paid'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 print:bg-emerald-100 print:text-emerald-800'
                  : payslip.status === 'Approved'
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 print:bg-indigo-100 print:text-indigo-800'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20 print:bg-slate-100 print:text-slate-800'
              }`}>
                PAYSLIP {payslip.status.toUpperCase()}
              </div>
              <p className="text-xs text-slate-500 mt-2 font-mono">
                Period: {months[payslip.month - 1]} {payslip.year}
              </p>
            </div>
          </div>

          {/* Seeding profiles details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                Employee Information
              </p>
              <p className="text-sm font-bold text-slate-200 print:text-black">{employeeName}</p>
              <p className="text-slate-450 mt-0.5">ID: {employeeIdCode}</p>
              <p className="text-slate-450 mt-0.5">{employeeEmail}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                Payroll Details
              </p>
              <p className="text-slate-450">Calculation Run ID:</p>
              <p className="font-mono text-slate-300 print:text-black mt-0.5">{payslip._id}</p>
              <p className="text-slate-450 mt-0.5">Generated On: {formatDate(payslip.createdAt)}</p>
            </div>
          </div>

          {/* Main Itemized Table */}
          <div className="border border-slate-800 rounded-xl overflow-hidden print:border-slate-300">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 text-slate-450 font-bold border-b border-slate-800 print:bg-slate-100 print:text-black print:border-slate-300">
                  <th className="p-3">Salary Description</th>
                  <th className="p-3 text-right">Credit (+)</th>
                  <th className="p-3 text-right">Debit (-)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                <tr>
                  <td className="p-3 font-semibold text-slate-200 print:text-black">Base Monthly Salary Rate</td>
                  <td className="p-3 text-right font-mono">{formatCurrency(payslip.baseSalary)}</td>
                  <td className="p-3 text-right font-mono">—</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-200 print:text-black">Active Allowances (Housing/Travel)</td>
                  <td className="p-3 text-right font-mono text-emerald-450 print:text-emerald-800">
                    +{formatCurrency(payslip.allowances)}
                  </td>
                  <td className="p-3 text-right font-mono">—</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-200 print:text-black">
                    Calculated Deductions (Unpaid Leaves / Late check-ins / Base)
                  </td>
                  <td className="p-3 text-right font-mono">—</td>
                  <td className="p-3 text-right font-mono text-rose-455 print:text-rose-800">
                    -{formatCurrency(payslip.deductions)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Calculations Totals Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 grid grid-cols-2 gap-y-2 text-xs border-t border-slate-800 pt-3 print:border-slate-300">
              <span className="text-slate-500">Gross Credits:</span>
              <span className="text-right text-slate-300 print:text-black font-mono font-semibold">
                {formatCurrency(payslip.baseSalary + payslip.allowances)}
              </span>

              <span className="text-slate-500">Gross Deductions:</span>
              <span className="text-right text-slate-300 print:text-black font-mono font-semibold">
                {formatCurrency(payslip.deductions)}
              </span>

              <div className="col-span-2 border-b border-slate-850/60 my-1"></div>

              <span className="text-white print:text-black font-bold text-sm">Net Salary Paid:</span>
              <span className="text-right text-indigo-400 print:text-indigo-800 font-mono font-extrabold text-sm">
                {formatCurrency(payslip.netPay)}
              </span>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="text-[10px] text-slate-500 text-center border-t border-slate-800/80 pt-6 mt-6 print:text-slate-600 print:border-slate-300">
            This is a computer generated payslip statement invoice. No physical signature is required. For any inquiries, contact HR Operations Support Desk category &ldquo;Finance&rdquo;.
          </div>
        </div>

        {/* Print only warning if opened normally */}
        <div className="absolute -bottom-10 left-0 right-0 text-center text-[10px] text-slate-600 print:hidden">
          Tip: Press Ctrl+P to save as PDF.
        </div>
      </div>
    </div>
  );
};
export default PayslipDetailsModal;

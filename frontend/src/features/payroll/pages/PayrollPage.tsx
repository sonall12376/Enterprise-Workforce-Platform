import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { PayslipsTable } from '../components/PayslipsTable';
import { SalarySetupForm } from '../components/SalarySetupForm';
import { PayrollCalculator } from '../components/PayrollCalculator';
import { PayslipDetailsModal } from '../components/PayslipDetailsModal';
import { getPayslips } from '../services/payrollService';
import { PayrollRecord } from '../types';
import { Receipt, DollarSign, Calculator, LogOut, ShieldAlert, RefreshCw } from 'lucide-react';

export const PayrollPage: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-payslips' | 'salary-setup' | 'payroll-run'>('my-payslips');
  const [payslips, setPayslips] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const res = await getPayslips();
      if (res.status === 'success' && res.data) {
        setPayslips(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch payslips history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPayslips();
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full text-center space-y-4 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Unauthenticated</h2>
          <p className="text-slate-400 text-sm">
            Please log in first to access the Payroll Management hub.
          </p>
          <a
            href="/"
            className="inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors"
          >
            Go to Landing
          </a>
        </div>
      </div>
    );
  }

  const isAdmin = ['SuperAdmin', 'OrgAdmin'].includes(user.role);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-500" />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Payroll Hub
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all flex items-center gap-1.5 text-sm"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8 print:p-0">
        {/* Welcome Board */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h2 className="text-2xl font-bold text-white">Payroll & Finances</h2>
            <p className="text-slate-400 text-sm mt-1">
              Verify monthly payslips history, base salaries configurations, and process approval runs.
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Only shown if Admin) */}
        {isAdmin && (
          <div className="flex border-b border-slate-850 gap-2 print:hidden">
            <button
              onClick={() => setActiveTab('my-payslips')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'my-payslips'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Payslips Log
            </button>
            <button
              onClick={() => setActiveTab('salary-setup')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'salary-setup'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Salary Configuration
            </button>
            <button
              onClick={() => setActiveTab('payroll-run')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'payroll-run'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Run Payroll Engine
            </button>
          </div>
        )}

        {/* Tab Content */}
        <div className="print:block">
          {activeTab === 'my-payslips' || !isAdmin ? (
            <PayslipsTable
              payslips={payslips}
              loading={loading}
              onViewDetails={(pay) => {
                setSelectedPayslip(pay);
                setIsModalOpen(true);
              }}
            />
          ) : activeTab === 'salary-setup' ? (
            <SalarySetupForm />
          ) : (
            <PayrollCalculator />
          )}
        </div>
      </main>

      {/* Payslip Details Modal */}
      <PayslipDetailsModal
        payslip={selectedPayslip}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPayslip(null);
          // Refetch to see any status updates
          fetchPayslips();
        }}
      />
    </div>
  );
};
export default PayrollPage;

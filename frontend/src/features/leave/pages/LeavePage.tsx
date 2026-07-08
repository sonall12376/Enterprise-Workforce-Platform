import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { BalanceWidget } from '../components/BalanceWidget';
import { RequestsTable } from '../components/RequestsTable';
import { RequestModal } from '../components/RequestModal';
import { LeaveApprovals } from '../components/LeaveApprovals';
import { getLeaveRequests, getLeaveBalances } from '../services/leaveService';
import { LeaveRequestRecord, LeaveBalanceRecord } from '../types';
import { Calendar, ClipboardList, Send, Users, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

export const LeavePage: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-requests' | 'team-approvals'>('my-requests');
  const [balances, setBalances] = useState<LeaveBalanceRecord[]>([]);
  const [requests, setRequests] = useState<LeaveRequestRecord[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBalances = async () => {
    setBalancesLoading(true);
    try {
      const res = await getLeaveBalances();
      if (res.status === 'success' && res.data) {
        setBalances(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching leave balances:', err);
    } finally {
      setBalancesLoading(false);
    }
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await getLeaveRequests();
      if (res.status === 'success' && res.data) {
        setRequests(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching leave requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalances();
      fetchRequests();
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
            Please log in first to access the Leave Management module.
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

  const isManagerOrAdmin = ['Manager', 'OrgAdmin', 'SuperAdmin'].includes(user.role);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-500" />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Leave Management
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
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Board */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Leave Center</h2>
            <p className="text-slate-400 text-sm mt-1">
              Apply for vacations, monitor allowances, and review approvals.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 active:scale-[0.98] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/30"
          >
            <Send className="w-4 h-4" />
            Apply for Leave
          </button>
        </div>

        {/* BalanceWidget */}
        <BalanceWidget balances={balances} loading={balancesLoading} />

        {/* Navigation Tabs (Only shown if Manager/Admin) */}
        {isManagerOrAdmin && (
          <div className="flex border-b border-slate-855 gap-2">
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'my-requests'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              My Leave Requests
            </button>
            <button
              onClick={() => setActiveTab('team-approvals')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'team-approvals'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Team Approvals
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'my-requests' ? (
          <RequestsTable requests={requests} loading={requestsLoading} />
        ) : (
          <LeaveApprovals
            requests={requests}
            loading={requestsLoading}
            onActionComplete={() => {
              fetchRequests();
              fetchBalances();
            }}
          />
        )}
      </main>

      {/* Request Modal */}
      <RequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchRequests();
          fetchBalances();
        }}
      />
    </div>
  );
};
export default LeavePage;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { ClockWidget } from '../components/ClockWidget';
import { LogsTable } from '../components/LogsTable';
import { CorrectionModal } from '../components/CorrectionModal';
import { ApprovalsTab } from '../components/ApprovalsTab';
import { getLogs, getCorrections } from '../services/attendanceService';
import { AttendanceRecord, CorrectionRequest } from '../types';
import { Clock, Users, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-attendance' | 'team-approvals'>('my-attendance');
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [corrections, setCorrections] = useState<CorrectionRequest[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [correctionsLoading, setCorrectionsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await getLogs();
      if (res.status === 'success' && res.data) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching attendance logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchCorrections = async () => {
    if (!user || user.role === 'Employee') return;
    setCorrectionsLoading(true);
    try {
      const res = await getCorrections();
      if (res.status === 'success' && res.data) {
        setCorrections(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching corrections:', err);
    } finally {
      setCorrectionsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
      fetchCorrections();
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
            Please log in first to access the Attendance Management module.
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

  // Find most recent un-clocked-out log to pass to the ClockWidget
  const currentActiveLog = logs.find((l) => !l.clockOut) || null;

  const isManagerOrAdmin = ['Manager', 'OrgAdmin', 'SuperAdmin'].includes(user.role);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Attendance Management
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
            <h2 className="text-2xl font-bold text-white">Hello, {user.name}!</h2>
            <p className="text-slate-400 text-sm mt-1">
              Welcome back to your time tracking command center.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 px-4 py-2.5 rounded-xl text-xs text-slate-400 self-start sm:self-auto">
            <span className="font-semibold text-indigo-400">Org ID:</span>
            <span className="font-mono text-slate-300">{user.orgId}</span>
          </div>
        </div>

        {/* ClockWidget */}
        <ClockWidget onStatusChange={fetchLogs} currentActiveLog={currentActiveLog} />

        {/* Navigation Tabs (Only shown if Manager/Admin) */}
        {isManagerOrAdmin && (
          <div className="flex border-b border-slate-850 gap-2">
            <button
              onClick={() => setActiveTab('my-attendance')}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'my-attendance'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              My Attendance
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
        {activeTab === 'my-attendance' ? (
          <LogsTable
            logs={logs}
            loading={logsLoading}
            onCorrectionRequest={(record) => {
              setSelectedRecord(record);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <ApprovalsTab
            corrections={corrections}
            loading={correctionsLoading}
            onActionComplete={() => {
              fetchCorrections();
              fetchLogs();
            }}
          />
        )}
      </main>

      {/* Correction Modal */}
      <CorrectionModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        onSuccess={() => {
          fetchLogs();
          fetchCorrections();
        }}
      />
    </div>
  );
};
export default AttendancePage;

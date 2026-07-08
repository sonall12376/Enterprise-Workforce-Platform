import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { GoalTracker } from '../components/GoalTracker';
import { GoalForm } from '../components/GoalForm';
import { AppraisalForm } from '../components/AppraisalForm';
import { AppraisalsList } from '../components/AppraisalsList';
import { getGoals, getReviews } from '../services/performanceService';
import { GoalRecord, PerformanceReviewRecord } from '../types';
import { Target, Star, PlusCircle, FileSpreadsheet, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

export const PerformancePage: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'my-goals' | 'my-appraisals' | 'assign-goal' | 'submit-appraisal'>('my-goals');
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [reviews, setReviews] = useState<PerformanceReviewRecord[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchGoals = async () => {
    setGoalsLoading(true);
    try {
      const res = await getGoals();
      if (res.status === 'success' && res.data) {
        setGoals(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setGoalsLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await getReviews();
      if (res.status === 'success' && res.data) {
        setReviews(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch appraisals:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGoals();
      fetchReviews();
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
            Please log in first to access the Performance Dashboard.
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
            <Star className="w-6 h-6 text-indigo-500 fill-indigo-500" />
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Performance Hub
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
            <h2 className="text-2xl font-bold text-white">Appraisals & OKRs</h2>
            <p className="text-slate-400 text-sm mt-1">
              Track your goal metrics, complete appraisal evaluations, and acknowledge review feedback.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-850 gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('my-goals')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'my-goals'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            My Target Goals
          </button>
          <button
            onClick={() => setActiveTab('my-appraisals')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'my-appraisals'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Appraisals Log
          </button>

          {isManagerOrAdmin && (
            <>
              <button
                onClick={() => setActiveTab('assign-goal')}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'assign-goal'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Assign Target Goal
              </button>
              <button
                onClick={() => setActiveTab('submit-appraisal')}
                className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === 'submit-appraisal'
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Star className="w-4 h-4" />
                Submit Appraisal Evaluation
              </button>
            </>
          )}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'my-goals' ? (
            <GoalTracker
              goals={goals}
              loading={goalsLoading}
              onRefresh={fetchGoals}
            />
          ) : activeTab === 'my-appraisals' ? (
            <AppraisalsList
              reviews={reviews}
              loading={reviewsLoading}
              onActionComplete={fetchReviews}
              userId={user.id}
            />
          ) : activeTab === 'assign-goal' && isManagerOrAdmin ? (
            <GoalForm
              onSuccess={() => {
                fetchGoals();
                setActiveTab('my-goals');
              }}
            />
          ) : activeTab === 'submit-appraisal' && isManagerOrAdmin ? (
            <AppraisalForm
              onSuccess={() => {
                fetchReviews();
                setActiveTab('my-appraisals');
              }}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
};
export default PerformancePage;

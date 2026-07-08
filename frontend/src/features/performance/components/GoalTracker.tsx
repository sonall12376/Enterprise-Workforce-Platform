import React, { useState } from 'react';
import { GoalRecord } from '../types';
import { updateGoal } from '../services/performanceService';
import { formatDate } from '../../../utils/helpers';
import { Award, Target, Save, RefreshCw, AlertCircle } from 'lucide-react';

interface GoalTrackerProps {
  goals: GoalRecord[];
  loading: boolean;
  onRefresh: () => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  goals,
  loading,
  onRefresh,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [progressVal, setProgressVal] = useState<number>(0);
  const [statusVal, setStatusVal] = useState<'NotStarted' | 'InProgress' | 'Achieved' | 'Deferred'>('NotStarted');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startEdit = (goal: GoalRecord) => {
    setEditingId(goal._id);
    setProgressVal(goal.progress);
    setStatusVal(goal.status);
    setError(null);
  };

  const handleProgressChange = (newVal: number) => {
    setProgressVal(newVal);
    if (newVal === 100) {
      setStatusVal('Achieved');
    } else if (newVal > 0 && statusVal === 'NotStarted') {
      setStatusVal('InProgress');
    }
  };

  const handleStatusChange = (newStatus: 'NotStarted' | 'InProgress' | 'Achieved' | 'Deferred') => {
    setStatusVal(newStatus);
    if (newStatus === 'Achieved') {
      setProgressVal(100);
    }
  };

  const handleSave = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      await updateGoal(id, {
        progress: progressVal,
        status: statusVal,
      });
      setEditingId(null);
      onRefresh();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update goal progress.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Achieved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'InProgress':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Deferred':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <span>Loading goals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {goals.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-550 font-medium">
            No goals or milestones defined for you yet.
          </div>
        ) : (
          goals.map((goal) => {
            const isEditing = editingId === goal._id;

            return (
              <div
                key={goal._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all hover:border-slate-700/80"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-slate-500">
                        Target Date: {formatDate(goal.targetDate)}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white leading-snug">{goal.title}</h4>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-start">
                    {!isEditing ? (
                      <>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyles(goal.status)}`}>
                          {goal.status}
                        </span>
                        <button
                          onClick={() => startEdit(goal)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-indigo-400 hover:text-white text-xs font-bold rounded-lg transition-all"
                        >
                          Update Progress
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          value={statusVal}
                          onChange={(e) => handleStatusChange(e.target.value as any)}
                          className="px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs font-semibold focus:outline-none focus:border-indigo-500"
                        >
                          <option value="NotStarted">NotStarted</option>
                          <option value="InProgress">InProgress</option>
                          <option value="Achieved">Achieved</option>
                          <option value="Deferred">Deferred</option>
                        </select>
                        <button
                          onClick={() => handleSave(goal._id)}
                          disabled={saving}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-white text-xs font-bold rounded-lg border border-slate-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Milestone Progress</span>
                    <span className="font-mono text-white font-semibold">
                      {isEditing ? progressVal : goal.progress}%
                    </span>
                  </div>

                  {!isEditing ? (
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-violet-650 h-full rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progressVal}
                        onChange={(e) => handleProgressChange(Number(e.target.value))}
                        className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Finished Award Stamp */}
                {goal.status === 'Achieved' && !isEditing && (
                  <div className="absolute right-3 bottom-3 opacity-[0.05] pointer-events-none">
                    <Award className="w-20 h-20 text-emerald-400" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default GoalTracker;

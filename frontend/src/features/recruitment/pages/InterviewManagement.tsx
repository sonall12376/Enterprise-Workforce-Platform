import React, { useEffect, useState } from 'react';
import recruitmentService from '../services/recruitmentService';
import { Interview } from '../types/recruitmentTypes';
import { Calendar, Clock, User, CheckCircle, Video, Star, ChevronRight, AlertCircle } from 'lucide-react';

export const InterviewManagement: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Scheduled' | 'Completed' | 'Cancelled'>('All');

  // Feedback Submission Modal state
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    comments: '',
    recommendation: 'Hire' as 'Hire' | 'Hold' | 'Reject',
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const loadSchedules = async () => {
    setIsLoading(true);
    try {
      const data = await recruitmentService.getInterviews();
      setInterviews(data);
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview || !feedbackForm.comments) {
      alert('Comments are required.');
      return;
    }

    setFeedbackLoading(true);
    try {
      await recruitmentService.submitFeedback(selectedInterview._id, feedbackForm);
      setSelectedInterview(null);
      setFeedbackForm({ rating: 5, comments: '', recommendation: 'Hire' });
      await loadSchedules();
      alert('Evaluation feedback logged successfully.');
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const filtered = interviews.filter((item) => {
    if (filterStatus === 'All') return true;
    return item.status === filterStatus;
  });

  const activeInterviewsCount = interviews.filter((i) => i.status === 'Scheduled').length;
  const completedInterviewsCount = interviews.filter((i) => i.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-300">
            Interview Appraisals Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Conduct screening evaluations, log scorecard feedback, and select joining recommendations.
          </p>
        </div>
        {/* Filters */}
        <div className="flex gap-2">
          {['All', 'Scheduled', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white border-transparent'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/10">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{activeInterviewsCount}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Scheduled Rounds</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/10">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{completedInterviewsCount}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Evaluated Rounds</p>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-slate-400 text-sm font-semibold animate-pulse">Loading interview pipelines...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-800/40 rounded-2xl flex flex-col items-center justify-center gap-2">
          <AlertCircle size={24} className="text-slate-600" />
          <p className="text-slate-400 font-medium">No panels matching current criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl shadow-lg hover:border-indigo-500/30 hover:bg-slate-900/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-0.5 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 rounded-full text-[9px] uppercase font-bold tracking-wider font-mono">
                    {item.roundName}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                      item.status === 'Completed'
                        ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                        : 'bg-blue-950/40 border-blue-500/20 text-blue-400'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <User size={12} />
                  Candidate Profile
                </div>
                <h3 className="text-base font-bold text-slate-200 mt-1">{item.candidateId?.fullName || 'Candidate'}</h3>
                <p className="text-[11px] text-indigo-300 font-semibold">{item.candidateId?.email}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-500" />
                    {new Date(item.scheduledTime).toLocaleString()} ({item.durationMins} mins, {item.mode})
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-slate-500" />
                    Interviewer: <span className="font-semibold">{item.interviewerId?.name}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
                {item.meetingLink ? (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-indigo-400 rounded-lg text-[10px] font-bold transition-all"
                  >
                    <Video size={12} /> Join Call
                  </a>
                ) : (
                  <div />
                )}

                {item.status === 'Scheduled' && (
                  <button
                    onClick={() => setSelectedInterview(item)}
                    className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                  >
                    Log Scorecard
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Scorecard Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0e1322] border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 text-xs text-left">
            <h3 className="text-base font-bold text-slate-200 mb-2">Log Interview Evaluation</h3>
            <p className="text-slate-500 mb-4 leading-relaxed">
              Log appraisal scores and remarks for candidate <span className="text-indigo-400 font-bold">{selectedInterview.candidateId?.fullName}</span>.
            </p>
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex gap-1.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: i + 1 })}
                      className="hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star size={24} fill={i < feedbackForm.rating ? 'currentColor' : 'none'} className={i < feedbackForm.rating ? '' : 'text-slate-800'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5">Evaluation Remarks (strengths, remarks) *</label>
                <textarea
                  required
                  rows={4}
                  value={feedbackForm.comments}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                  placeholder="Provide detailed comments on technical fitment and remarks..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5">Appraisal Recommendation</label>
                <select
                  value={feedbackForm.recommendation}
                  onChange={(e: any) => setFeedbackForm({ ...feedbackForm, recommendation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer"
                >
                  <option value="Hire">Recommend Hire</option>
                  <option value="Hold">On Hold</option>
                  <option value="Reject">Reject Candidate</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedInterview(null)}
                  className="px-4 py-2 border border-slate-800 bg-slate-900/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="flex items-center gap-1 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  {feedbackLoading ? 'Submitting...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default InterviewManagement;

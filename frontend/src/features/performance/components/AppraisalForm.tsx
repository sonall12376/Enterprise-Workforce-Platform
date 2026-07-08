import React, { useState, useEffect } from 'react';
import { createReview } from '../services/performanceService';
import api from '../../../services/api';
import { FileSpreadsheet, Star, User, AlertCircle, CheckCircle } from 'lucide-react';

interface EmployeeOption {
  id: string;
  employeeId: string;
  name: string;
  email: string;
}

interface AppraisalFormProps {
  onSuccess: () => void;
}

export const AppraisalForm: React.FC<AppraisalFormProps> = ({ onSuccess }) => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmp, setSelectedEmp] = useState('');
  const [reviewPeriod, setReviewPeriod] = useState('');
  const [rating, setRating] = useState<number>(3.0);
  const [feedback, setFeedback] = useState('');
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
        console.error('Failed to fetch employees list for appraisals:', err);
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
      await createReview({
        employeeId: selectedEmp,
        reviewPeriod,
        rating,
        feedback,
      });

      setSuccess(true);
      setReviewPeriod('');
      setFeedback('');
      setSelectedEmp('');
      setRating(3.0);
      onSuccess();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || 'Failed to submit performance review.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const ratingOptions = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center gap-2">
        <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
        <h3 className="text-lg font-bold text-white">Create Employee Appraisal Review</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Employee Profile
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
                    {emp.name}
                  </option>
                ))}
              </select>
              <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Review Period
            </label>
            <input
              type="text"
              value={reviewPeriod}
              onChange={(e) => setReviewPeriod(e.target.value)}
              required
              placeholder="e.g. Q1-2026 or Annual 2026"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Overall Rating Score
            </label>
            <div className="relative">
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {ratingOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.toFixed(1)} / 5.0
                  </option>
                ))}
              </select>
              <Star className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Evaluation Feedback / Narrative Notes
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            minLength={10}
            rows={4}
            placeholder="Write evaluation review details..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-650 resize-none"
          ></textarea>
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
            <span>Performance appraisal review submitted successfully!</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-950/20"
          >
            {loading ? 'Submitting Evaluation...' : 'Submit Evaluation'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default AppraisalForm;

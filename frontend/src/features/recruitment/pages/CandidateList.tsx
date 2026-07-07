import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useRecruitment } from '../hooks/useRecruitment';
import { Search, Filter, Plus, Eye, Trash2 } from 'lucide-react';

export const CandidateList: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const {
    candidates,
    isLoading,
    error,
    addCandidate,
    removeCandidate,
    updateFilters,
  } = useRecruitment();

  // Modal State for New Candidate
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    experienceYears: 0,
    skills: '',
    source: 'Direct Application',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchTerm, status: statusFilter });
  };

  const handleStatusChange = (statusVal: string) => {
    setStatusFilter(statusVal);
    updateFilters({ search: searchTerm, status: statusVal });
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.fullName || !newCandidate.email) {
      setModalError('Full Name and Email are required.');
      return;
    }

    setModalLoading(true);
    setModalError(null);
    try {
      const skillsArray = newCandidate.skills
        ? newCandidate.skills.split(',').map((s) => s.trim())
        : [];
      await addCandidate({
        ...newCandidate,
        skills: skillsArray,
      });
      setIsModalOpen(false);
      setNewCandidate({
        fullName: '',
        email: '',
        phone: '',
        gender: 'Male',
        experienceYears: 0,
        skills: '',
        source: 'Direct Application',
      });
    } catch (err: any) {
      setModalError(err.message || 'Failed to register candidate');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this applicant profile?')) {
      try {
        await removeCandidate(id);
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const canWrite = ['SuperAdmin', 'OrgAdmin', 'Manager'].includes(user?.role || '');

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-300">
            Candidate Pipeline Pool
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse and manage applicants records, screening results, and recruitment workflows.
          </p>
        </div>
        {canWrite && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold shadow-lg shadow-indigo-950/40 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus size={18} />
            Register Applicant
          </button>
        )}
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearch} className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl flex flex-col md:flex-row gap-4 mb-8 backdrop-blur-md">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by candidate name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none text-sm cursor-pointer"
          >
            <option value="">All Pipeline Stages</option>
            <option value="Applied">Applied</option>
            <option value="Screening">Screening</option>
            <option value="Technical Interview">Technical Round</option>
            <option value="HR Interview">HR Round</option>
            <option value="Selected">Selected</option>
            <option value="Offer Sent">Offer Sent</option>
            <option value="Joined">Joined & Hired</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-slate-850 border border-slate-800 hover:bg-slate-800 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* Error alert */}
      {error && (
        <div className="mb-8 p-4 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Grid listing */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-slate-400 text-sm font-medium animate-pulse">Loading candidate list...</span>
        </div>
      ) : candidates.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
          <p className="text-slate-400 font-medium">No candidates registered</p>
          <p className="text-slate-500 text-xs mt-1">Try register a new candidate application.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((cand) => (
            <div
              key={cand._id}
              className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl shadow-lg hover:border-indigo-500/30 hover:bg-slate-900/40 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300" />
              <div>
                {/* Status */}
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                      cand.status === 'Joined'
                        ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                        : cand.status === 'Rejected'
                        ? 'bg-rose-950/40 border-rose-500/20 text-rose-400'
                        : cand.status === 'Selected' || cand.status === 'Offer Sent'
                        ? 'bg-teal-950/40 border-teal-500/20 text-teal-400'
                        : 'bg-indigo-950/40 border-indigo-500/20 text-indigo-400'
                    }`}
                  >
                    {cand.status}
                  </span>
                  <div className="text-[10px] text-slate-500">Exp: {cand.experienceYears} Years</div>
                </div>

                <h3 className="text-base font-bold text-slate-200">{cand.fullName}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{cand.email}</p>

                {/* Skills tags */}
                {cand.skills && cand.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {cand.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-slate-950 text-slate-400 rounded-lg text-[9px] border border-slate-850">
                        {skill}
                      </span>
                    ))}
                    {cand.skills.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-950 text-slate-500 rounded-lg text-[9px]">
                        +{cand.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Source: {cand.source}</span>
                <div className="flex gap-2">
                  <Link
                    to={`/candidates/${cand._id}`}
                    className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-indigo-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Eye size={14} /> Profile
                  </Link>
                  {canWrite && (
                    <button
                      onClick={() => handleDelete(cand._id)}
                      className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-rose-500 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Register applicant */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0e1322] border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-slate-200 mb-4">Register Applicant Profile</h3>
            {modalError && (
              <div className="mb-4 p-3 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                {modalError}
              </div>
            )}
            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs text-left">
              <div>
                <label className="block text-slate-400 mb-1.5">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCandidate.fullName}
                  onChange={(e) => setNewCandidate({ ...newCandidate, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    value={newCandidate.phone}
                    onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5">Experience (Years)</label>
                  <input
                    type="number"
                    min={0}
                    value={newCandidate.experienceYears}
                    onChange={(e) => setNewCandidate({ ...newCandidate, experienceYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Gender</label>
                  <select
                    value={newCandidate.gender}
                    onChange={(e: any) => setNewCandidate({ ...newCandidate, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5">Skills (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, TypeScript"
                  value={newCandidate.skills}
                  onChange={(e) => setNewCandidate({ ...newCandidate, skills: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5">Source Referral</label>
                <input
                  type="text"
                  value={newCandidate.source}
                  onChange={(e) => setNewCandidate({ ...newCandidate, source: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/85">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 bg-slate-900/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center gap-1 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  {modalLoading ? 'Submitting...' : 'Register Applicant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CandidateList;

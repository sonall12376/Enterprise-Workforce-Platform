import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import recruitmentService from '../services/recruitmentService';
import employeeService from '../../employee/services/employeeService';
import api from '../../../services/api';
import { Candidate, Interview, InterviewFeedback } from '../types/recruitmentTypes';
import { OrgMetadata } from '../../employee/types/employeeTypes';
import { ArrowLeft, FileText, UserPlus, Star, CheckCircle, Plus, Eye, Loader2, DollarSign } from 'lucide-react';

export const CandidateDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [metadata, setMetadata] = useState<OrgMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'profile' | 'interviews' | 'offer' | 'convert'>('profile');

  // Modals / Actions States
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    interviewerId: '',
    roundName: 'Technical Interview',
    scheduledTime: '',
    durationMins: 60,
    mode: 'Online' as 'Online' | 'In-Person',
    meetingLink: '',
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Offer Letter Form
  const [offerData, setOfferData] = useState({
    salary: 600000,
    joiningDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });
  const [offerLoading, setOfferLoading] = useState(false);

  // Conversion Form
  const [conversionData, setConversionData] = useState({
    phone: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '1995-01-01',
    joiningDate: new Date().toISOString().split('T')[0],
    deptId: '',
    designationId: '',
    locationId: '',
    shiftId: '',
    reportingManagerId: '',
    employmentType: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract' | 'Intern',
  });
  const [conversionLoading, setConversionLoading] = useState(false);

  // Resume Upload
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const candData = await recruitmentService.getCandidate(id);
      setCandidate(candData);

      const panelList = await recruitmentService.getInterviews(id);
      setInterviews(panelList);

      const meta = await employeeService.getMetadata();
      setMetadata(meta);

      // Prepopulate conversion details from candidate values
      setConversionData((prev) => ({
        ...prev,
        phone: candData.phone || '',
        gender: candData.gender || 'Male',
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch candidate details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile || !id) return;

    setIsResumeUploading(true);
    const mockUrl = `https://res.cloudinary.com/dummy/resumes/${Date.now()}-${resumeFile.name}`;

    try {
      // 1. Save document vault record
      const docRes = await api.post('/documents', {
        fileName: resumeFile.name,
        fileUrl: mockUrl,
        category: 'Resume',
        uploadedById: '603d2e1b12cf000000000002', // Admin uploader ID fallback
      });

      // 2. Link resume document reference to Candidate
      const updatedCand = await recruitmentService.updateCandidate(id, {
        resume: docRes.data.data._id,
      });

      setCandidate(updatedCand);
      setResumeFile(null);
      alert('Resume file uploaded successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Resume upload failed');
    } finally {
      setIsResumeUploading(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !scheduleData.interviewerId || !scheduleData.scheduledTime) {
      alert('Interviewer and Scheduled Date are required.');
      return;
    }

    setScheduleLoading(true);
    try {
      await recruitmentService.scheduleInterview({
        candidateId: id,
        ...scheduleData,
      });
      setIsScheduleOpen(false);
      // reload details
      await fetchDetails();
      alert('Interview round scheduled successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to schedule');
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleGenerateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setOfferLoading(true);
    try {
      await recruitmentService.generateOffer(id, offerData.salary, offerData.joiningDate);
      await fetchDetails();
      alert('Offer letter generated and sent successfully.');
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setOfferLoading(false);
    }
  };

  const handleConversionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setConversionLoading(true);
    try {
      const employee = await recruitmentService.convertToEmployee(id, conversionData);
      alert(`Candidate converted successfully! Employee ID: ${employee.employeeId}`);
      navigate(`/employees/${employee._id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Conversion failed');
    } finally {
      setConversionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <span className="text-slate-400 animate-pulse text-sm font-semibold">Loading applicant registry...</span>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-[#0b0f19] p-10 flex flex-col items-center justify-center">
        <p className="text-rose-400 font-bold">{error || 'Candidate profile not found'}</p>
        <Link to="/candidates" className="mt-4 text-xs text-indigo-400 hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  const canModifyRecruitment = ['SuperAdmin', 'OrgAdmin', 'Manager'].includes(user?.role || '');
  const canConvertCandidate = ['SuperAdmin', 'OrgAdmin'].includes(user?.role || '');

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        {/* Header back */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/candidates" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold">
            <ArrowLeft size={16} /> Back to Candidates
          </Link>
        </div>

        {/* Candidate Profile Details */}
        <div className="bg-slate-900/30 border border-slate-800/80 p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center gap-6 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="w-20 h-20 rounded-2xl bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl font-extrabold shadow-lg">
            {candidate.fullName[0]}
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-200">{candidate.fullName}</h2>
              <span
                className={`px-2.5 py-0.5 text-[9px] font-bold border rounded-full uppercase tracking-wider ${
                  candidate.status === 'Joined'
                    ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                    : candidate.status === 'Rejected'
                    ? 'bg-rose-950/40 border-rose-500/20 text-rose-400'
                    : 'bg-indigo-950/40 border-indigo-500/20 text-indigo-400'
                }`}
              >
                {candidate.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{candidate.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs text-slate-500 mt-3">
              <span>Experience: {candidate.experienceYears} Years</span>
              <span>•</span>
              <span>Source: {candidate.source}</span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800/80 mb-8">
          {[
            { id: 'profile', name: 'Applicant Profile' },
            { id: 'interviews', name: 'Interviews & Evaluations' },
            { id: 'offer', name: 'Salary Offer Terms', hidden: !['Selected', 'Offer Sent', 'Joined'].includes(candidate.status) },
            { id: 'convert', name: 'Employee Conversion', hidden: !['Selected', 'Offer Sent'].includes(candidate.status) || !canConvertCandidate },
          ].map(
            (tab) =>
              !tab.hidden && (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {tab.name}
                </button>
              )
          )}
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Details */}
            <div className="md:col-span-2 bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl space-y-6 backdrop-blur-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Info</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 mb-1">Phone Number</div>
                  <div className="font-semibold text-slate-300">{candidate.phone || 'Not Provided'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Gender</div>
                  <div className="font-semibold text-slate-300">{candidate.gender || 'Not Provided'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-500 mb-1.5">Skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 bg-slate-950 border border-slate-850 text-slate-300 rounded-lg text-[10px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resume Vault */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-4 border-t border-slate-800/80">Resume File Vault</h3>
              {candidate.resume ? (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText size={20} className="text-indigo-400" />
                    <div>
                      <div className="font-semibold text-slate-300">{candidate.resume.fileName}</div>
                      <div className="text-[10px] text-slate-500">Document Vault reference</div>
                    </div>
                  </div>
                  <a
                    href={candidate.resume.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 hover:border-slate-700 font-semibold rounded-lg"
                  >
                    <Eye size={12} /> Preview
                  </a>
                </div>
              ) : (
                <form onSubmit={handleResumeUpload} className="flex gap-4 text-xs items-center">
                  <input
                    type="file"
                    required
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-xs flex-1"
                  />
                  <button
                    type="submit"
                    disabled={isResumeUploading || !resumeFile}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg disabled:opacity-40"
                  >
                    {isResumeUploading ? 'Uploading...' : 'Upload CV'}
                  </button>
                </form>
              )}
            </div>

            {/* Candidate Timeline */}
            <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Lifecycle Timeline</h3>
              <div className="relative border-l border-slate-800 pl-4 space-y-5">
                {candidate.timeline
                  .slice()
                  .reverse()
                  .map((evt, idx) => (
                    <div key={idx} className="relative text-xs">
                      <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-indigo-500 border border-[#0b0f19]" />
                      <div className="text-[10px] text-slate-500">{new Date(evt.date).toLocaleDateString()}</div>
                      <div className="font-bold text-slate-300 mt-0.5">{evt.stage}</div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{evt.note}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* INTERVIEWS TAB */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scheduled Interviews</h3>
              {canModifyRecruitment && candidate.status !== 'Joined' && (
                <button
                  onClick={() => setIsScheduleOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  <Plus size={14} /> Schedule Interview
                </button>
              )}
            </div>

            {interviews.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-12 bg-slate-900/20 border border-slate-800/40 rounded-xl">
                No interview panels scheduled yet.
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((panel) => (
                  <div key={panel._id} className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <div className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">{panel.roundName}</div>
                        <div className="text-sm font-bold text-slate-200 mt-1">Interviewer: {panel.interviewerId?.name}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Scheduled: {new Date(panel.scheduledTime).toLocaleString()} ({panel.durationMins} mins, {panel.mode})
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                          panel.status === 'Completed'
                            ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                            : panel.status === 'Cancelled'
                            ? 'bg-rose-950/40 border-rose-500/20 text-rose-400'
                            : 'bg-blue-950/40 border-blue-500/20 text-blue-400'
                        }`}
                      >
                        {panel.status}
                      </span>
                    </div>

                    {/* Appraised Feedbacks List */}
                    <div className="mt-6 pt-4 border-t border-slate-800/80">
                      <h4 className="text-xs font-bold text-slate-400 mb-2">Interviewer Appraisals Feedback</h4>
                      <InterviewFeedbackLoader interviewId={panel._id} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OFFER TAB */}
        {activeTab === 'offer' && (
          <div className="max-w-md bg-slate-900/30 border border-slate-800/80 p-8 rounded-2xl backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Draft & Issue Salary Offer</h3>
            {candidate.offerDetails?.salary ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950 border border-emerald-500/20 text-slate-300 rounded-xl flex items-center gap-3">
                  <CheckCircle className="text-emerald-400" />
                  <div>
                    <div className="font-bold">Offer Sent & Logged</div>
                    <div className="text-[10px] text-slate-500">Generated {new Date(candidate.offerDetails.generatedAt!).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-500">Offered Salary:</span>{' '}
                    <span className="font-bold text-slate-300">INR {candidate.offerDetails.salary}/year</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Expected Joining Date:</span>{' '}
                    <span className="font-bold text-slate-300">{new Date(candidate.offerDetails.joiningDate!).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateOffer} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1.5">Offered Base Salary (per annum)</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      required
                      value={offerData.salary}
                      onChange={(e) => setOfferData({ ...offerData, salary: parseInt(e.target.value) || 0 })}
                      className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={offerData.joiningDate}
                    onChange={(e) => setOfferData({ ...offerData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none cursor-pointer"
                  />
                </div>
                <button
                  type="submit"
                  disabled={offerLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  {offerLoading ? 'Generating...' : 'Generate and Send Offer PDF'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* CONVERT TAB */}
        {activeTab === 'convert' && (
          <form onSubmit={handleConversionSubmit} className="bg-slate-900/30 border border-slate-800/80 p-8 rounded-2xl backdrop-blur-md space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Copy to active employee registry</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Verify the structural allocations and default profile properties. Clicking Onboard will finalize candidate status to Joined and create their Employee account.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-slate-400 mb-1.5">Department</label>
                <select
                  required
                  value={conversionData.deptId}
                  onChange={(e) => setConversionData({ ...conversionData, deptId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer"
                >
                  <option value="">Select Department</option>
                  {metadata?.depts?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5">Designation</label>
                <select
                  required
                  value={conversionData.designationId}
                  onChange={(e) => setConversionData({ ...conversionData, designationId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer"
                >
                  <option value="">Select Designation</option>
                  {metadata?.desgs?.map((desg) => (
                    <option key={desg._id} value={desg._id}>
                      {desg.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-slate-400 mb-1.5">Reporting Manager</label>
                <select
                  required
                  value={conversionData.reportingManagerId}
                  onChange={(e) => setConversionData({ ...conversionData, reportingManagerId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer"
                >
                  <option value="">Select Manager</option>
                  {metadata?.managers?.map((mgr) => (
                    <option key={mgr._id} value={mgr._id}>
                      {mgr.name} ({mgr.employeeId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5">Work Shift</label>
                <select
                  required
                  value={conversionData.shiftId}
                  onChange={(e) => setConversionData({ ...conversionData, shiftId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer"
                >
                  <option value="">Select Shift</option>
                  {metadata?.shifts?.map((shift) => (
                    <option key={shift._id} value={shift._id}>
                      {shift.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-slate-400 mb-1.5">Office Location</label>
                <select
                  required
                  value={conversionData.locationId}
                  onChange={(e) => setConversionData({ ...conversionData, locationId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer"
                >
                  <option value="">Select Location</option>
                  {metadata?.locs?.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5">Employment Type</label>
                <select
                  value={conversionData.employmentType}
                  onChange={(e: any) => setConversionData({ ...conversionData, employmentType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={conversionLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-950/40 cursor-pointer"
            >
              {conversionLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Account & Onboarding...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Convert & Onboard Employee
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Schedule Interview Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-[#0e1322] border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 text-xs text-left">
            <h3 className="text-base font-bold text-slate-200 mb-4">Schedule Interview Panel</h3>
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1.5">Round Name</label>
                <input
                  type="text"
                  required
                  value={scheduleData.roundName}
                  onChange={(e) => setScheduleData({ ...scheduleData, roundName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1.5">Assigned Interviewer</label>
                <select
                  required
                  value={scheduleData.interviewerId}
                  onChange={(e) => setScheduleData({ ...scheduleData, interviewerId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer"
                >
                  <option value="">Select Interviewer</option>
                  {metadata?.managers?.map((mgr) => (
                    <option key={mgr._id} value={mgr._id}>
                      {mgr.name} ({mgr.employeeId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5">Scheduled Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduleData.scheduledTime}
                    onChange={(e) => setScheduleData({ ...scheduleData, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Duration (minutes)</label>
                  <input
                    type="number"
                    min={15}
                    value={scheduleData.durationMins}
                    onChange={(e) => setScheduleData({ ...scheduleData, durationMins: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5">Round Mode</label>
                  <select
                    value={scheduleData.mode}
                    onChange={(e: any) => setScheduleData({ ...scheduleData, mode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-pointer"
                  >
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5">Meeting Link</label>
                  <input
                    type="text"
                    placeholder="e.g. Google Meet Link"
                    value={scheduleData.meetingLink}
                    onChange={(e) => setScheduleData({ ...scheduleData, meetingLink: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-2 border border-slate-800 bg-slate-900/50 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduleLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg disabled:opacity-40 cursor-pointer"
                >
                  {scheduleLoading ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component to fetch and render interview feedback list
const InterviewFeedbackLoader: React.FC<{ interviewId: string }> = ({ interviewId }) => {
  const [feedbacks, setFeedbacks] = useState<InterviewFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const res = await recruitmentService.getFeedback(interviewId);
        setFeedbacks(res);
      } catch (err) {
        console.error('Failed to load feedback logs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeedback();
  }, [interviewId]);

  if (loading) {
    return <div className="text-[10px] text-slate-500 animate-pulse">Loading feedback logs...</div>;
  }

  if (feedbacks.length === 0) {
    return <div className="text-[10px] text-slate-600">Pending evaluation feedback from interviewer.</div>;
  }

  return (
    <div className="space-y-3 mt-2">
      {feedbacks.map((f) => (
        <div key={f._id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-300">{f.interviewerId?.name}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[8px] font-bold border ${
                  f.recommendation === 'Hire'
                    ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                    : f.recommendation === 'Reject'
                    ? 'bg-rose-950/40 border-rose-500/20 text-rose-400'
                    : 'bg-amber-950/40 border-amber-500/20 text-amber-400'
                }`}
              >
                {f.recommendation}
              </span>
            </div>
            <div className="flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={10} fill={i < f.rating ? 'currentColor' : 'none'} className={i < f.rating ? '' : 'text-slate-800'} />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 italic font-medium">"{f.comments}"</p>
        </div>
      ))}
    </div>
  );
};
export default CandidateDetails;

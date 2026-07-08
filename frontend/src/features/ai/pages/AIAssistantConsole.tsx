import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import aiService from '../services/aiService';
import { ChatMessage, ResumeAnalysisResult, AttendanceInsightResult, PayrollExplanationResult, MeetingSummaryResult } from '../types/aiTypes';
import { Bot, Send, Search, FileText, Calendar, DollarSign, ListCollapse, Loader2, Sparkles } from 'lucide-react';

export const AIAssistantConsole: React.FC = () => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'resume' | 'hr'>('chat');

  // Fallback dev login
  useEffect(() => {
    if (!user) {
      login('dummy-token', {
        id: '603d2e1b12cf000000000005',
        name: 'Sarah Connor',
        email: 'sarah.connor@wfm.com',
        role: 'OrgAdmin',
        orgId: '603d2e1b12cf000000000001',
      });
    }
  }, [user, login]);

  // --- TAB 1: CHAT WIDGET & DOCUMENT SEARCH ---
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'assistant', text: 'Hi! I am your AI Operations Assistant. How can I help you today?', timestamp: new Date() },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [policyType, setPolicyType] = useState<'IT' | 'HR' | 'Finance'>('HR');
  const [policyQuery, setPolicyQuery] = useState('What is the annual leave policy?');
  const [policyResult, setPolicyResult] = useState<string | null>(null);
  const [policyLoading, setPolicyLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { sender: 'user', text: chatInput, timestamp: new Date() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const reply = await aiService.chat(userMsg.text);
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: reply, timestamp: new Date() }]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: 'Sorry, I encountered an error communicating with the AI service.', timestamp: new Date() },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSearchPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!policyQuery.trim()) return;
    setPolicyLoading(true);
    setPolicyResult(null);
    try {
      const res = await aiService.searchPolicy(policyType, policyQuery);
      setPolicyResult(res.explanation);
    } catch (err: any) {
      setPolicyResult('Failed to retrieve policy explanation.');
    } finally {
      setPolicyLoading(false);
    }
  };

  // --- TAB 2: RESUME ANALYZER ---
  const [resumeText, setResumeText] = useState(
    'Name: Sarah Connor\nTitle: Senior DevOps Engineer\nEmail: sarah.connor@wfm.com\n\nExperience:\n- 5 years at Cyberdyne Systems designing redundant automation clusters.\n- Configured Kubernetes orchestrations, Prometheus/Grafana monitors, AWS VPC routers, and Terraform state logs.\n- Expert in Linux kernels, shell scripts, and bcrypt integrations.\n\nSkills: Kubernetes, Docker, DevOps, AWS, Linux, Terraform, Prometheus, CI/CD'
  );
  const [resumeResult, setResumeResult] = useState<ResumeAnalysisResult | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeText(
      `[Uploaded File: ${file.name}]\n\nProcessing PDF content extraction...\n\nName: Sarah Connor\nTitle: Senior DevOps Engineer\nEmail: sarah.connor@wfm.com\n\nExperience:\n- 5 years at Cyberdyne Systems designing redundant automation clusters.\n- Configured Kubernetes orchestrations, Prometheus/Grafana monitors, AWS VPC routers, and Terraform state logs.\n- Expert in Linux kernels, shell scripts, and bcrypt integrations.\n\nSkills: Kubernetes, Docker, DevOps, AWS, Linux, Terraform, Prometheus, CI/CD`
    );
  };

  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    setResumeLoading(true);
    setResumeResult(null);
    try {
      const res = await aiService.analyzeResume(resumeText);
      setResumeResult(res);
    } catch (err: any) {
      alert('Failed to analyze resume.');
    } finally {
      setResumeLoading(false);
    }
  };

  // --- TAB 3: HR OPERATIONS ASSISTANT ---
  const [employeeId, setEmployeeId] = useState('603d2e1b12cf000000000005');
  const [billingMonth, setBillingMonth] = useState('October 2026');

  const [attendanceInsight, setAttendanceInsight] = useState<AttendanceInsightResult | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const [payrollExplanation, setPayrollExplanation] = useState<PayrollExplanationResult | null>(null);
  const [payrollLoading, setPayrollLoading] = useState(false);

  const [meetingText, setMeetingText] = useState(
    'Sarah: We need to complete the Kubernetes deployment by Friday.\nKyle: I will configure the YAML service pods.\nEllen: I will run regression audits on the authentication APIs.'
  );
  const [meetingSummary, setMeetingSummary] = useState<MeetingSummaryResult | null>(null);
  const [meetingLoading, setMeetingLoading] = useState(false);

  useEffect(() => {
    if (user?.id && user.id !== 'dummy-token') {
      setEmployeeId(user.id);
    }
  }, [user]);

  const handleGetAttendance = async () => {
    if (!employeeId.trim()) return;
    setAttendanceLoading(true);
    try {
      const res = await aiService.getAttendanceInsights(employeeId);
      setAttendanceInsight(res);
    } catch (err) {
      alert('Failed to compile attendance insights.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleGetPayroll = async () => {
    if (!employeeId.trim() || !billingMonth.trim()) return;
    setPayrollLoading(true);
    try {
      const res = await aiService.explainPayroll(employeeId, billingMonth);
      setPayrollExplanation(res);
    } catch (err) {
      alert('Failed to calculate payroll breakdown.');
    } finally {
      setPayrollLoading(false);
    }
  };

  const handleSummarizeMeeting = async () => {
    if (!meetingText.trim()) return;
    setMeetingLoading(true);
    try {
      const res = await aiService.summarizeMeeting(meetingText);
      setMeetingSummary(res);
    } catch (err) {
      alert('Failed to summarize meeting.');
    } finally {
      setMeetingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Bot className="text-violet-500" size={28} />
            AI Operations Console
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Leverage corporate policy search vectors, analyze candidate resume suitability, and query platform data.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 mb-8">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'border-violet-500 text-violet-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Chat & Policy Search
        </button>
        <button
          onClick={() => setActiveTab('resume')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'resume'
              ? 'border-violet-500 text-violet-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Resume Analyzer
        </button>
        <button
          onClick={() => setActiveTab('hr')}
          className={`px-5 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'hr'
              ? 'border-violet-500 text-violet-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          HR Operations & Insights
        </button>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat widget */}
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col h-[550px] shadow-xl">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                <Sparkles className="text-violet-400 w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-slate-200">Interactive Assistant</h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        msg.sender === 'user' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-violet-400 border border-slate-700/80'
                      }`}
                    >
                      {msg.sender === 'user' ? 'U' : <Bot size={14} />}
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-violet-600 text-white rounded-tr-none'
                          : 'bg-slate-800/60 text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3 items-center text-xs text-slate-500 italic">
                    <Loader2 className="animate-spin text-violet-500" size={16} />
                    Assistant is thinking...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about employees, tasks, tickets..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-850 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xs"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="p-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white shadow-lg cursor-pointer disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>

            {/* Document/Policy Search */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl h-[550px] flex flex-col">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Search size={18} className="text-violet-400" />
                <h3 className="font-bold text-slate-200">Policy Vector Search</h3>
              </div>

              <form onSubmit={handleSearchPolicy} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Policy Base</label>
                  <select
                    value={policyType}
                    onChange={(e) => setPolicyType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs cursor-pointer focus:outline-none"
                  >
                    <option value="HR">HR Policies & Appraisal</option>
                    <option value="IT">IT Security & Assets Rules</option>
                    <option value="Finance">Finance & Expense Claims</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Search Inquiry</label>
                  <input
                    type="text"
                    placeholder="e.g. Leave accrual policies..."
                    value={policyQuery}
                    onChange={(e) => setPolicyQuery(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-855 border border-slate-700 text-slate-100 text-xs focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={policyLoading}
                  className="w-full py-2.5 px-4 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-xs cursor-pointer shadow-md"
                >
                  {policyLoading ? 'Searching...' : 'Search Policy'}
                </button>
              </form>

              <div className="flex-1 border-t border-slate-800/80 pt-4 overflow-y-auto">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Results</h4>
                {policyResult ? (
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{policyResult}</p>
                ) : (
                  <p className="text-slate-600 text-xs italic">Submit inquiries to pull document details.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText size={18} className="text-violet-400" />
                <h3 className="font-bold text-slate-200">Candidate Resume Details</h3>
              </div>

              <form onSubmit={handleAnalyzeResume} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Upload PDF Resume File</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="w-full text-slate-300 text-xs bg-slate-850 p-2.5 rounded-xl border border-slate-700 focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-600 file:text-white hover:file:bg-violet-500 file:cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Copy Resume Text Content</label>
                    <textarea
                      placeholder="Paste CV elements, experience milestones, skills sets..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      rows={9}
                      className="w-full p-4 rounded-xl bg-slate-850 border border-slate-700 text-slate-200 text-xs focus:outline-none resize-none font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resumeLoading}
                  className="px-5 py-3 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold shadow-lg text-xs cursor-pointer"
                >
                  {resumeLoading ? 'Analyzing Resume...' : 'Analyze Resume'}
                </button>
              </form>
            </div>

            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6">
                  <Sparkles size={18} className="text-violet-400" />
                  <h3 className="font-bold text-slate-200">AI Recommendation Result</h3>
                </div>

                {resumeResult ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" strokeWidth="4" />
                          <circle
                            cx="18"
                            cy="18"
                            r="15.915"
                            fill="none"
                            stroke="#8b5cf6"
                            strokeWidth="4"
                            strokeDasharray={`${resumeResult.matchScore} ${100 - resumeResult.matchScore}`}
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-extrabold text-slate-200">{resumeResult.matchScore}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-200 font-bold text-sm">Match score ratio</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Gemini analyzer matrix</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reason</h4>
                        <p className="text-slate-300 text-xs leading-relaxed">{resumeResult.reason}</p>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Detected Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeResult.detectedSkills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 font-semibold"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-600 text-xs italic">
                    Submit candidate resume details to extract qualification profiles.
                  </div>
                )}
              </div>

              {resumeResult && (
                <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Technical Recommendation:</span>
                  <span
                    className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                      resumeResult.recommendation.includes('Proceed')
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {resumeResult.recommendation}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'hr' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Attendance insights */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Calendar size={18} className="text-violet-400" />
                  <h3 className="font-bold text-slate-200">Attendance Punctuality Compiler</h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employee Reference ID</label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. 603d2e1b12cf000000000005"
                      className="w-full px-4 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleGetAttendance}
                    disabled={attendanceLoading}
                    className="py-2.5 px-4 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-xs cursor-pointer"
                  >
                    {attendanceLoading ? 'Compiling...' : 'Get Insights'}
                  </button>
                </div>

                {attendanceInsight && (
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Punctuality Rate</p>
                      <p className="text-lg font-bold text-slate-200 mt-1">{attendanceInsight.punctualityRate}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Days Present</p>
                      <p className="text-lg font-bold text-slate-200 mt-1">{attendanceInsight.daysPresent}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Late arrivals</p>
                      <p className="text-lg font-bold text-slate-200 mt-1">{attendanceInsight.lateArrivals}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Status Alert</p>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1 ${
                          attendanceInsight.status === 'Excellent'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {attendanceInsight.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payroll breakdown */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <DollarSign size={18} className="text-violet-400" />
                  <h3 className="font-bold text-slate-200">Payroll Calculation Explainer</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Billing Month</label>
                    <input
                      type="text"
                      value={billingMonth}
                      onChange={(e) => setBillingMonth(e.target.value)}
                      placeholder="e.g. October 2026"
                      className="w-full px-4 py-2 rounded-xl bg-slate-850 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleGetPayroll}
                      disabled={payrollLoading}
                      className="w-full py-2.5 px-4 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-xs cursor-pointer"
                    >
                      {payrollLoading ? 'Calculating...' : 'Explain Payroll'}
                    </button>
                  </div>
                </div>

                {payrollExplanation && (
                  <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-4 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Base Salary</p>
                        <p className="text-slate-200 font-semibold mt-1">{payrollExplanation.breakdown.baseSalary}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Allowances</p>
                        <p className="text-slate-200 font-semibold mt-1">{payrollExplanation.breakdown.monthlyAllowances}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Deductions</p>
                        <p className="text-rose-400 font-semibold mt-1">{payrollExplanation.breakdown.taxDeductions}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Net earnings</p>
                        <p className="text-emerald-400 font-bold text-sm mt-1">{payrollExplanation.breakdown.netSalary}</p>
                      </div>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed border-t border-slate-800/80 pt-3 text-justify">
                      {payrollExplanation.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Meeting Summarizer */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <ListCollapse size={18} className="text-violet-400" />
                  <h3 className="font-bold text-slate-200">Meeting Notes Summarizer</h3>
                </div>

                <div className="space-y-1.5 flex-1 flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Paste meeting transcripts</label>
                  <textarea
                    placeholder="Enter discussions, tasks, alignments..."
                    value={meetingText}
                    onChange={(e) => setMeetingText(e.target.value)}
                    rows={8}
                    className="w-full flex-1 p-3 rounded-xl bg-slate-850 border border-slate-700 text-slate-200 text-xs focus:outline-none resize-none font-sans"
                  />
                </div>

                <button
                  onClick={handleSummarizeMeeting}
                  disabled={meetingLoading}
                  className="w-full py-2.5 px-4 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-xs cursor-pointer shadow-md"
                >
                  {meetingLoading ? 'Summarizing...' : 'Summarize Notes'}
                </button>
              </div>

              {meetingSummary && (
                <div className="border-t border-slate-800/80 pt-4 space-y-4 text-xs flex-shrink-0">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Summary</h4>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{meetingSummary.meetingSummary}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Actions Checklist</h4>
                    <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                      {meetingSummary.actionItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistantConsole;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import helpDeskService from '../services/helpDeskService';
import { HelpDeskTicket } from '../types/helpDeskTypes';
import { ArrowLeft, Loader2, Calendar, ShieldAlert, Check, HelpCircle, AlertCircle, Wrench, CheckCircle } from 'lucide-react';

export const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<HelpDeskTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transitionLoading, setTransitionLoading] = useState(false);

  const fetchTicketDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await helpDeskService.getTicket(id);
      setTicket(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-4 text-slate-100">
        <Loader2 className="animate-spin text-violet-500" size={40} />
        <p className="text-slate-400 text-sm">Loading support ticket details...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="max-w-md w-full p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
          <ShieldAlert size={48} className="mx-auto text-rose-500" />
          <h2 className="text-xl font-bold text-slate-100">Error Loading Ticket</h2>
          <p className="text-slate-400 text-sm">{error || 'Ticket not found'}</p>
          <button
            onClick={() => navigate('/helpdesk')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-medium cursor-pointer"
          >
            Return to Support Center
          </button>
        </div>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: 'Open' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed') => {
    setTransitionLoading(true);
    setError(null);
    try {
      const updated = await helpDeskService.updateTicketStatus(ticket._id, newStatus);
      setTicket(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Status transition failed');
    } finally {
      setTransitionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <HelpCircle className="text-blue-400" size={20} />;
      case 'Assigned':
        return <AlertCircle className="text-indigo-400" size={20} />;
      case 'InProgress':
        return <Wrench className="text-amber-400" size={20} />;
      case 'Resolved':
        return <CheckCircle className="text-emerald-400" size={20} />;
      case 'Closed':
        return <Check className="text-slate-400" size={20} />;
      default:
        return <HelpCircle size={20} />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const steps = ['Open', 'Assigned', 'InProgress', 'Resolved', 'Closed'];
  const currentStepIndex = steps.indexOf(ticket.status);

  const currentRole = user?.role || 'OrgAdmin';
  const isAdminOrManager = ['SuperAdmin', 'OrgAdmin', 'Manager'].includes(currentRole);
  const isRaiser = ticket.raisedById._id === user?.id;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/helpdesk')}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-8 transition-colors duration-150 cursor-pointer text-sm font-semibold"
      >
        <ArrowLeft size={16} />
        Back to Support Center
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket Details (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="font-mono text-xs px-2.5 py-1 bg-slate-800 text-slate-400 border border-slate-700/80 rounded">
                TICKET ID: {ticket._id}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Calendar size={14} />
                Raised {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">{ticket.subject}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                  Category: {ticket.category}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                  Priority: {ticket.priority}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Description</h3>
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Workflow progress line */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-md">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Workflow Status Tracker</h3>

            <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
              {/* Connection line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 hidden md:block z-0" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-violet-600 -translate-y-1/2 hidden md:block z-0 transition-all duration-300"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2.5 relative z-10 w-full md:w-auto">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isCurrent
                          ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-950/60 scale-110'
                          : isActive
                          ? 'bg-slate-900 border-violet-600 text-violet-400'
                          : 'bg-slate-900 border-slate-800 text-slate-600'
                      }`}
                    >
                      {isActive && idx < currentStepIndex ? <Check size={18} /> : getStatusIcon(step)}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                        {step === 'InProgress' ? 'In Progress' : step}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info panel & Action triggers (Right column) */}
        <div className="space-y-6">
          {/* Raised By / Assigned To details */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-6">
            {/* Raiser info */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Raised By</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-xs">
                  {getInitials(ticket.raisedById.name)}
                </div>
                <div>
                  <p className="text-slate-200 font-semibold">{ticket.raisedById.name}</p>
                  <p className="text-xs text-slate-400">{ticket.raisedById.email}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Role: {ticket.raisedById.role} | ID: {ticket.raisedById.employeeId}
                  </p>
                </div>
              </div>
            </div>

            {/* Agent info */}
            <div className="border-t border-slate-800/80 pt-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Assigned Agent</h3>
              {ticket.assignedToId ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {getInitials(ticket.assignedToId.name)}
                  </div>
                  <div>
                    <p className="text-slate-200 font-semibold">{ticket.assignedToId.name}</p>
                    <p className="text-xs text-slate-400">{ticket.assignedToId.email}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Role: {ticket.assignedToId.role} | ID: {ticket.assignedToId.employeeId}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-600 text-xs italic">Awaiting agent assignment...</p>
              )}
            </div>
          </div>

          {/* Workflow actions triggers */}
          {ticket.status !== 'Closed' && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Workflow State Transition Controls</h3>

              {/* Agent workflow controls */}
              {isAdminOrManager && (
                <div className="flex flex-col gap-2">
                  {ticket.status === 'Assigned' && (
                    <button
                      onClick={() => handleStatusChange('InProgress')}
                      disabled={transitionLoading}
                      className="w-full py-2.5 px-4 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md font-semibold transition cursor-pointer text-sm"
                    >
                      Start Work (Move to In Progress)
                    </button>
                  )}

                  {ticket.status === 'InProgress' && (
                    <button
                      onClick={() => handleStatusChange('Resolved')}
                      disabled={transitionLoading}
                      className="w-full py-2.5 px-4 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md font-semibold transition cursor-pointer text-sm"
                    >
                      Resolve Ticket
                    </button>
                  )}

                  {ticket.status === 'Resolved' && (
                    <button
                      onClick={() => handleStatusChange('Closed')}
                      disabled={transitionLoading}
                      className="w-full py-2.5 px-4 rounded-xl text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold transition cursor-pointer text-sm"
                    >
                      Close Ticket (Archive)
                    </button>
                  )}
                </div>
              )}

              {/* Raiser Close button */}
              {(isRaiser || isAdminOrManager) && (
                <button
                  onClick={() => handleStatusChange('Closed')}
                  disabled={transitionLoading}
                  className="w-full py-2.5 px-4 rounded-xl text-rose-400 bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 font-semibold transition cursor-pointer text-sm"
                >
                  Close Ticket
                </button>
              )}
            </div>
          )}

          {/* Re-open ticket option for Admins */}
          {ticket.status === 'Closed' && isAdminOrManager && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Administration override</h3>
              <button
                onClick={() => handleStatusChange('InProgress')}
                disabled={transitionLoading}
                className="w-full py-2.5 px-4 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md font-semibold transition cursor-pointer text-sm"
              >
                Reopen Ticket (Move to In Progress)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;

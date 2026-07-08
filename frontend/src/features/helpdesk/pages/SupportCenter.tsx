import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import { TicketForm } from '../components/TicketForm';
import { TicketAssignModal } from '../components/TicketAssignModal';
import { Plus, Search, Filter, ShieldAlert, BookOpen, Clock, CheckCircle2, AlertOctagon, Edit, Trash2, UserPlus, Eye, Loader2 } from 'lucide-react';

export const SupportCenter: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { tickets, isLoading, error, addTicket, editTicket, removeTicket, allocateTicket, changeTicketStatus } = useTickets();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [ticketToAssign, setTicketToAssign] = useState<any>(null);
  const [assignLoading, setAssignLoading] = useState(false);

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

  const handleRoleChange = (role: string) => {
    login('dummy-token', {
      id: '603d2e1b12cf000000000005',
      name: 'Sarah Connor',
      email: 'sarah.connor@wfm.com',
      role: role,
      orgId: '603d2e1b12cf000000000001',
    });
  };

  const handleCreateOpen = () => {
    setSelectedTicket(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (ticket: any) => {
    setSelectedTicket(ticket);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (selectedTicket) {
        await editTicket(selectedTicket._id, data);
      } else {
        await addTicket(data);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await removeTicket(id);
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const handleAssignOpen = (ticket: any) => {
    setTicketToAssign(ticket);
    setIsAssignOpen(true);
  };

  const handleAssignSubmit = async (assignedToId: string) => {
    if (!ticketToAssign) return;
    setAssignLoading(true);
    try {
      await allocateTicket(ticketToAssign._id, assignedToId);
      setIsAssignOpen(false);
    } catch (err: any) {
      alert(err.message || 'Assignment failed');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleQuickClose = async (id: string) => {
    if (window.confirm('Are you sure you want to close this ticket?')) {
      try {
        await changeTicketStatus(id, 'Closed');
      } catch (err: any) {
        alert(err.message || 'Status transition failed');
      }
    }
  };

  const currentRole = user?.role || 'OrgAdmin';
  const isAdminOrManager = ['SuperAdmin', 'OrgAdmin', 'Manager'].includes(currentRole);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Assigned':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'InProgress':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Closed':
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return 'text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20';
      case 'High':
        return 'text-orange-400 font-semibold bg-orange-500/10 border border-orange-500/20';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border border-amber-500/20';
      case 'Low':
        return 'text-slate-400 bg-slate-800 border border-slate-700/60';
      default:
        return 'text-slate-400 bg-slate-800 border border-slate-700/60';
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

  // Metrics summary
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'InProgress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">
      {/* Dev Sandbox Role Switcher */}
      <div className="mb-8 p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">🔧 Dev Sandbox: Role Switcher</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'].map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                currentRole === role
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-lg shadow-violet-950/40'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">Support Center</h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Create, track, and assign IT/HR ticketing services to resolve issues across departments.
          </p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold shadow-lg shadow-violet-950/40 hover:shadow-violet-950/60 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-sm"
        >
          <Plus size={18} />
          Open Support Ticket
        </button>
      </div>

      {/* Metrics Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Tickets</p>
            <p className="text-2xl font-bold text-slate-200 mt-1">{totalCount}</p>
          </div>
          <BookOpen className="text-slate-700" size={32} />
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between border-l border-l-blue-500">
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Open</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{openCount}</p>
          </div>
          <AlertOctagon className="text-blue-500/20" size={32} />
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between border-l border-l-amber-500">
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{inProgressCount}</p>
          </div>
          <Clock className="text-amber-500/20" size={32} />
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl flex items-center justify-between border-l border-l-emerald-500">
          <div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{resolvedCount}</p>
          </div>
          <CheckCircle2 className="text-emerald-500/20" size={32} />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col xl:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search tickets by subject or description details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 min-w-[480px]">
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer appearance-none text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="InProgress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer appearance-none text-sm"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer appearance-none text-sm"
            >
              <option value="All">All Categories</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Facilities">Facilities</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Info */}
      {(error || formError) && (
        <div className="mb-8 p-4 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3">
          <ShieldAlert size={20} />
          <p className="text-sm font-medium">{error || formError}</p>
        </div>
      )}

      {/* Tickets logs table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-violet-500" size={40} />
          <p className="text-slate-400 text-sm font-medium">Fetching support ticket logs...</p>
        </div>
      ) : filteredTickets.length > 0 ? (
        <div className="overflow-hidden border border-slate-800/80 bg-slate-900/30 backdrop-blur-md rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Ticket Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Raised By</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {filteredTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-800/20 transition-colors duration-150">
                    {/* Details */}
                    <td className="px-6 py-4 max-w-[280px]">
                      <p className="text-slate-100 font-semibold truncate">{t.subject}</p>
                      <p className="text-slate-400 text-xs truncate mt-0.5">{t.description}</p>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 border border-slate-700/60 font-semibold">
                        {t.category}
                      </span>
                    </td>

                    {/* Priority badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityStyle(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>

                    {/* Raised By */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-[10px]">
                          {getInitials(t.raisedById.name)}
                        </div>
                        <div>
                          <p className="text-slate-200 text-xs font-semibold">{t.raisedById.name}</p>
                          <p className="text-[9px] text-slate-500">{t.raisedById.role}</p>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Agent */}
                    <td className="px-6 py-4">
                      {t.assignedToId ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                            {getInitials(t.assignedToId.name)}
                          </div>
                          <div>
                            <p className="text-slate-200 text-xs font-semibold">{t.assignedToId.name}</p>
                            <p className="text-[9px] text-slate-500">{t.assignedToId.role}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs italic">Unassigned</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(t.status)}`}>
                        {t.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        {/* View detail button */}
                        <button
                          onClick={() => navigate(`/helpdesk/tickets/${t._id}`)}
                          className="p-1.5 bg-slate-800/40 hover:bg-violet-600/20 text-slate-400 hover:text-violet-300 rounded-lg border border-slate-700/20 hover:border-violet-500/20 transition-all cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>

                        {/* Assign button */}
                        {isAdminOrManager && t.status !== 'Closed' && (
                          <button
                            onClick={() => handleAssignOpen(t)}
                            className="p-1.5 bg-slate-800/40 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 rounded-lg border border-slate-700/20 hover:border-emerald-500/20 transition-all cursor-pointer"
                            title="Assign Agent"
                          >
                            <UserPlus size={14} />
                          </button>
                        )}

                        {/* Quick close button */}
                        {t.status !== 'Closed' && (
                          <button
                            onClick={() => handleQuickClose(t._id)}
                            className="p-1.5 bg-slate-800/40 hover:bg-slate-600/20 text-slate-400 hover:text-slate-300 rounded-lg border border-slate-700/20 hover:border-slate-500/20 transition-all cursor-pointer"
                            title="Close Ticket"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}

                        {/* Edit ticket */}
                        {(isAdminOrManager || (t.status === 'Open' && t.raisedById._id === user?.id)) && (
                          <button
                            onClick={() => handleEditOpen(t)}
                            className="p-1.5 bg-slate-800/40 hover:bg-violet-600/20 text-slate-400 hover:text-violet-300 rounded-lg border border-slate-700/20 hover:border-violet-500/20 transition-all cursor-pointer"
                            title="Edit Ticket"
                          >
                            <Edit size={14} />
                          </button>
                        )}

                        {/* Delete ticket */}
                        {isAdminOrManager && (
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="p-1.5 bg-slate-800/40 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700/20 hover:border-rose-500/20 transition-all cursor-pointer"
                            title="Delete Ticket"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-850 rounded-2xl">
          <p className="text-slate-400 font-medium">No tickets raised yet</p>
          <p className="text-slate-500 text-xs mt-1">Submit support tickets to catalog technical issues or HR inquiries.</p>
        </div>
      )}

      {/* Ticket Form Modal */}
      <TicketForm
        isOpen={isFormOpen}
        ticket={selectedTicket}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
      />

      {/* Assignment Modal */}
      <TicketAssignModal
        isOpen={isAssignOpen}
        ticket={ticketToAssign}
        onClose={() => setIsAssignOpen(false)}
        onAssign={handleAssignSubmit}
        isLoading={assignLoading}
      />
    </div>
  );
};

export default SupportCenter;

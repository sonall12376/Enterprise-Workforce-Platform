import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useEmployees } from '../hooks/useEmployees';
import { Search, SlidersHorizontal, Plus, ChevronLeft, ChevronRight, Briefcase, MapPin, Eye, Edit2, Download } from 'lucide-react';
import employeeService from '../services/employeeService';

export const EmployeeList: React.FC = () => {
  const { user } = useAuth();
  const [searchVal, setSearchVal] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const {
    employees,
    metadata,
    isLoading,
    error,
    filters,
    pagination,
    updateFilters,
  } = useEmployees({ page: 1, limit: 10 });

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await employeeService.exportEmployees();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'workforce_directory.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      alert(err.message || 'Failed to export employee directory');
    } finally {
      setExporting(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      ...filters,
      search: searchVal,
      page: 1,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    const updatedFilters = { ...filters, [key]: value, page: 1 };
    if (key === 'deptId') setSelectedDept(value);
    if (key === 'status') setSelectedStatus(value);
    updateFilters(updatedFilters);
  };

  const handlePageChange = (newPage: number) => {
    updateFilters({ ...filters, page: newPage });
  };

  const clearFilters = () => {
    setSearchVal('');
    setSelectedDept('');
    setSelectedStatus('');
    updateFilters({ page: 1, limit: 10 });
  };

  const currentRole = user?.role || 'Employee';
  const canModify = ['SuperAdmin', 'OrgAdmin'].includes(currentRole);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-300">
            Workforce Directory
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Search, filter, and access employee profiles in your organization ({pagination.total} total).
          </p>
        </div>
        {canModify && (
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 font-semibold shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              <Download size={18} />
              {exporting ? 'Exporting...' : 'Export Directory'}
            </button>
            <Link
              to="/employees/new"
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold shadow-lg shadow-indigo-950/40 transition-all duration-200"
            >
              <Plus size={18} />
              Add Employee
            </Link>
          </div>
        )}
      </div>

      {/* Filter panel */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 backdrop-blur-md">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search name, ID, or email..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>

        {/* Dept */}
        <div className="relative">
          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select
            value={selectedDept}
            onChange={(e) => handleFilterChange('deptId', e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none text-sm cursor-pointer"
          >
            <option value="">All Departments</option>
            {metadata?.depts?.map((dept) => (
              <option key={dept._id} value={dept._id} className="bg-slate-950">
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select
            value={selectedStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none text-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Suspended">Suspended</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            Search
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-sm transition-all cursor-pointer"
            title="Reset Filters"
          >
            ↺
          </button>
        </div>
      </form>

      {/* Error alert */}
      {error && (
        <div className="mb-8 p-4 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* Directory Grid Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="text-slate-400 text-sm font-medium animate-pulse">Loading directory entries...</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
          <p className="text-slate-400 font-medium">No workforce records found</p>
          <p className="text-slate-500 text-xs mt-1">Try relaxing filters or onboarding a new employee.</p>
        </div>
      ) : (
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="p-5">Employee ID</th>
                  <th className="p-5">Name</th>
                  <th className="p-5">Dept / Designation</th>
                  <th className="p-5">Shift & Location</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-800/50">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-900/10 transition-colors group">
                    <td className="p-5 font-mono font-bold text-indigo-400">{emp.employeeId}</td>
                    <td className="p-5">
                      <div className="font-semibold text-slate-200">{emp.name}</div>
                      <div className="text-xs text-slate-500">{emp.email}</div>
                    </td>
                    <td className="p-5">
                      <div className="text-slate-300 font-medium">{emp.deptId?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{emp.designationId?.title || 'N/A'}</div>
                    </td>
                    <td className="p-5">
                      <div className="text-slate-300 font-medium">{emp.shiftId?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={12} />
                        {emp.locationId?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                          emp.status === 'Active'
                            ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400'
                            : emp.status === 'Onboarding'
                            ? 'bg-amber-950/40 border-amber-500/20 text-amber-400'
                            : 'bg-rose-950/40 border-rose-500/20 text-rose-400'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2.5">
                        <Link
                          to={`/employees/${emp._id}`}
                          className="p-2 bg-slate-950 hover:bg-slate-900 text-indigo-400 rounded-lg border border-slate-800 hover:border-slate-700 transition-all"
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </Link>
                        {canModify && (
                          <Link
                            to={`/employees/edit/${emp._id}`}
                            className="p-2 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded-lg border border-slate-800 hover:border-slate-700 transition-all hover:text-slate-200"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-5 border-t border-slate-800/80 bg-slate-900/20 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="px-3.5 py-1.5 rounded-xl border border-slate-850 bg-slate-950 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                disabled={pagination.page === pagination.pages}
                className="px-3.5 py-1.5 rounded-xl border border-slate-850 bg-slate-950 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-all cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default EmployeeList;

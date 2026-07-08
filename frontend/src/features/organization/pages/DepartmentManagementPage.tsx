import React, { useState, useEffect } from 'react';
import organizationService, { Dept } from '../../../services/organizationService';
import employeeService from '../../employee/services/employeeService';
import { Employee } from '../../employee/types/employeeTypes';
import {
  Shield,
  Plus,
  Trash2,
  Edit,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  User,
  Users,
} from 'lucide-react';

export const DepartmentManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [managerId, setManagerId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const deptList = await organizationService.getDepts();
      setDepartments(deptList);

      const empRes = await employeeService.getEmployees({ limit: 200 });
      if (empRes && Array.isArray(empRes.employees)) {
        setEmployees(empRes.employees);
      } else if (Array.isArray(empRes)) {
        setEmployees(empRes);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load department records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        name,
        code: code.toUpperCase(),
        managerId: managerId || null,
      };

      if (editingId) {
        await organizationService.updateDept(editingId, payload);
        setSuccess('Department updated successfully.');
      } else {
        await organizationService.createDept(payload);
        setSuccess('New department created successfully.');
      }

      setName('');
      setCode('');
      setManagerId('');
      setEditingId(null);
      
      const deptList = await organizationService.getDepts();
      setDepartments(deptList);
    } catch (err: any) {
      setError(err.message || 'Failed to save department details.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dept: Dept) => {
    setEditingId(dept._id);
    setName(dept.name);
    setCode(dept.code);
    setManagerId(dept.managerId?._id || '');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this department? This action cannot be undone.')) return;
    setError(null);
    setSuccess(null);
    try {
      await organizationService.deleteDept(id);
      setSuccess('Department deleted successfully.');
      setDepartments(departments.filter((d) => d._id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete department.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <p className="text-slate-400 text-sm font-medium">Fetching departments registry...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-300">
          Department Management
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Define corporate divisions, set code mappings, and designate executive supervisors.
        </p>
      </div>

      {/* Message alerts */}
      {error && (
        <div className="p-4 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-3">
          <ShieldAlert size={18} />
          <p className="font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-3">
          <CheckCircle2 size={18} />
          <p className="font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-1">
          <form onSubmit={handleSave} className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl space-y-6 backdrop-blur-md shadow-xl">
            <h3 className="text-md font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Shield size={18} className="text-indigo-400" />
              {editingId ? 'Edit Department' : 'Create Department'}
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-semibold uppercase">Department Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Human Resources"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-semibold uppercase">Department Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. HRD"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs font-semibold uppercase">Department Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id} className="bg-slate-950">
                      {emp.name} ({emp.employeeId})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                <span>{editingId ? 'Update Division' : 'Add Division'}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setName('');
                    setCode('');
                    setManagerId('');
                  }}
                  className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Directory/Grid panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-md font-bold text-slate-400 flex items-center gap-2">
            <Users size={18} /> Active Divisions Directory
          </h3>
          
          {departments.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
              <p className="text-slate-500 text-xs">No departments configured yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map((dept) => (
                <div key={dept._id} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg hover:border-indigo-500/20 transition-all duration-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="font-extrabold text-slate-200 text-base">{dept.name}</div>
                      <span className="px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 font-mono text-[10px] font-bold">
                        {dept.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <User size={14} className="text-slate-500" />
                      {dept.managerId ? (
                        <div>
                          <div className="font-semibold text-slate-300">{dept.managerId.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{dept.managerId.employeeId}</div>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">No Manager Assigned</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-850/80 mt-4">
                    <button
                      onClick={() => handleEdit(dept)}
                      className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                      title="Edit Department"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(dept._id)}
                      className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-700 text-rose-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagementPage;

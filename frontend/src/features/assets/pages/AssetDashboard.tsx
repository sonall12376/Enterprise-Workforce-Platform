import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useAssets } from '../hooks/useAssets';
import { AssetForm } from '../components/AssetForm';
import { AssetAssignModal } from '../components/AssetAssignModal';
import { Plus, Search, Filter, ShieldAlert, Cpu, Laptop, HardDrive, Key, UserCheck, Trash2, Edit, RotateCcw, Loader2, Ban } from 'lucide-react';

export const AssetDashboard: React.FC = () => {
  const { user, login } = useAuth();
  const { assets, isLoading, error, addAsset, editAsset, removeAsset, allocateAsset, releaseAsset } = useAssets();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assetToAssign, setAssetToAssign] = useState<any>(null);
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


  const handleCreateOpen = () => {
    setSelectedAsset(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (asset: any) => {
    setSelectedAsset(asset);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    setFormLoading(true);
    setFormError(null);
    try {
      if (selectedAsset) {
        await editAsset(selectedAsset._id, data);
      } else {
        await addAsset(data);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await removeAsset(id);
      } catch (err: any) {
        alert(err.message || 'Delete failed');
      }
    }
  };

  const handleAssignOpen = (asset: any) => {
    setAssetToAssign(asset);
    setIsAssignOpen(true);
  };

  const handleAssignSubmit = async (employeeId: string) => {
    if (!assetToAssign) return;
    setAssignLoading(true);
    try {
      await allocateAsset(assetToAssign._id, employeeId);
      setIsAssignOpen(false);
    } catch (err: any) {
      alert(err.message || 'Allocation failed');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleReturn = async (id: string) => {
    if (window.confirm('Are you sure you want to return this asset?')) {
      try {
        await releaseAsset(id);
      } catch (err: any) {
        alert(err.message || 'Return failed');
      }
    }
  };

  const currentRole = user?.role || 'OrgAdmin';
  const isAdmin = ['SuperAdmin', 'OrgAdmin'].includes(currentRole);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || asset.status === statusFilter;
    const matchesType = typeFilter === 'All' || asset.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Assigned':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Maintenance':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Retired':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Hardware':
        return <Laptop size={14} className="text-violet-400" />;
      case 'Software':
        return <Key size={14} className="text-sky-400" />;
      case 'Furniture':
        return <HardDrive size={14} className="text-amber-400" />;
      default:
        return <Cpu size={14} className="text-slate-400" />;
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

  // Summary Metrics
  const totalCount = assets.length;
  const availableCount = assets.filter((a) => a.status === 'Available').length;
  const assignedCount = assets.filter((a) => a.status === 'Assigned').length;
  const maintenanceCount = assets.filter((a) => a.status === 'Maintenance').length;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">


      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">Asset Registry</h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Manage organization assets inventory logs, device assignment tracking, and return status lifecycles.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCreateOpen}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-semibold shadow-lg shadow-violet-950/40 hover:shadow-violet-950/60 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-sm"
          >
            <Plus size={18} />
            Register Asset
          </button>
        )}
      </div>

      {/* Metrics board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Assets</p>
          <p className="text-2xl font-bold text-slate-200 mt-1">{totalCount}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl border-l border-l-emerald-500">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Available</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{availableCount}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl border-l border-l-blue-500">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Assigned</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{assignedCount}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl border-l border-l-amber-500">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">In Maintenance</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{maintenanceCount}</p>
        </div>
      </div>

      {/* Filters row (Only visible if Admin or Manager) */}
      {currentRole !== 'Employee' && (
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search assets by name or serial barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 min-w-[320px]">
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer appearance-none text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer appearance-none text-sm"
              >
                <option value="All">All Types</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Furniture">Furniture</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error info */}
      {(error || formError) && (
        <div className="mb-8 p-4 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3">
          <ShieldAlert size={20} />
          <p className="text-sm font-medium">{error || formError}</p>
        </div>
      )}

      {/* Asset logs table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-violet-500" size={40} />
          <p className="text-slate-400 text-sm font-medium">Fetching registry inventory logs...</p>
        </div>
      ) : filteredAssets.length > 0 ? (
        <div className="overflow-hidden border border-slate-800/80 bg-slate-900/30 backdrop-blur-md rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Asset Details</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Serial ID</th>
                  <th className="px-6 py-4">Assigned To</th>
                  <th className="px-6 py-4">Status</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {filteredAssets.map((asset) => (
                  <tr key={asset._id} className="hover:bg-slate-800/20 transition-colors duration-150">
                    {/* Details */}
                    <td className="px-6 py-4">
                      <p className="text-slate-100 font-semibold">{asset.name}</p>
                    </td>

                    {/* Type badge */}
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-slate-300">
                        {getTypeIcon(asset.type)}
                        {asset.type}
                      </span>
                    </td>

                    {/* Barcode Serial ID */}
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs px-2 py-1 bg-slate-800/80 rounded border border-slate-700/60 text-violet-300">
                        {asset.serialNumber}
                      </span>
                    </td>

                    {/* Assigned Employee */}
                    <td className="px-6 py-4">
                      {asset.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-[10px]">
                            {getInitials(asset.assignedTo.name)}
                          </div>
                          <div>
                            <p className="text-slate-200 text-xs font-semibold">{asset.assignedTo.name}</p>
                            <p className="text-[9px] text-slate-500">ID: {asset.assignedTo.employeeId}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-xs italic">Unassigned</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex gap-2">
                          {/* Assign button */}
                          {asset.status === 'Available' ? (
                            <button
                              onClick={() => handleAssignOpen(asset)}
                              className="p-1.5 bg-slate-800/40 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 rounded-lg border border-slate-700/20 hover:border-emerald-500/20 transition-all cursor-pointer"
                              title="Assign Asset"
                            >
                              <UserCheck size={14} />
                            </button>
                          ) : asset.status === 'Assigned' ? (
                            <button
                              onClick={() => handleReturn(asset._id)}
                              className="p-1.5 bg-slate-800/40 hover:bg-amber-600/20 text-slate-400 hover:text-amber-400 rounded-lg border border-slate-700/20 hover:border-amber-500/20 transition-all cursor-pointer"
                              title="Return Asset"
                            >
                              <RotateCcw size={14} />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="p-1.5 bg-slate-900 text-slate-700 rounded-lg border border-slate-880 cursor-not-allowed opacity-40"
                            >
                              <Ban size={14} />
                            </button>
                          )}

                          {/* Edit / Delete */}
                          <button
                            onClick={() => handleEditOpen(asset)}
                            className="p-1.5 bg-slate-800/40 hover:bg-violet-600/20 text-slate-400 hover:text-violet-300 rounded-lg border border-slate-700/20 hover:border-violet-500/20 transition-all cursor-pointer"
                            title="Edit Details"
                          >
                            <Edit size={14} />
                          </button>

                          <button
                            onClick={() => handleDelete(asset._id)}
                            className="p-1.5 bg-slate-800/40 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700/20 hover:border-rose-500/20 transition-all cursor-pointer"
                            title="Delete Asset"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/20 border border-slate-850 rounded-2xl">
          <p className="text-slate-400 font-medium">No assets cataloged yet</p>
          <p className="text-slate-500 text-xs mt-1">Register assets to allocate inventory to organization employees.</p>
        </div>
      )}

      {/* Asset Form Modal */}
      <AssetForm
        isOpen={isFormOpen}
        asset={selectedAsset}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={formLoading}
      />

      {/* Allocation Modal */}
      <AssetAssignModal
        isOpen={isAssignOpen}
        asset={assetToAssign}
        onClose={() => setIsAssignOpen(false)}
        onAssign={handleAssignSubmit}
        isLoading={assignLoading}
      />
    </div>
  );
};

export default AssetDashboard;

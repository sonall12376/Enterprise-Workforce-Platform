import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import employeeService from '../services/employeeService';
import api from '../../../services/api';
import { Employee } from '../types/employeeTypes';
import { Briefcase, Calendar, MapPin, Trash2, Eye, UploadCloud, Loader2, ArrowLeft, Edit2 } from 'lucide-react';

export const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'timeline'>('profile');

  // Document Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [docCategory, setDocCategory] = useState<'Policy' | 'Contract' | 'IDProof' | 'Resume' | 'Offer Letter' | 'Profile Photo'>('IDProof');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await employeeService.getEmployee(id);
      setEmployee(data);

      const docsResponse = await api.get(`/documents/employee/${id}`);
      setDocuments(docsResponse.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDocDelete = async (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document from the vault?')) {
      try {
        await api.delete(`/documents/${docId}`);
        setDocuments((prev) => prev.filter((d) => d._id !== docId));
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete document');
      }
    }
  };

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile || !id) return;

    setIsUploading(true);
    setDocError(null);

    // Simulate Cloudinary file upload
    const mockUrl = `https://res.cloudinary.com/dummy/vault/${Date.now()}-${docFile.name}`;
    const payload = {
      fileName: docFile.name,
      fileUrl: mockUrl,
      category: docCategory,
      uploadedById: id,
    };

    try {
      const res = await api.post('/documents', payload);
      setDocuments((prev) => [res.data.data, ...prev]);
      setDocFile(null);
      alert('Document uploaded to vault successfully.');
    } catch (err: any) {
      setDocError(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <span className="text-slate-400 animate-pulse text-sm font-semibold">Fetching corporate profile...</span>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-[#0b0f19] p-10 flex flex-col items-center justify-center">
        <p className="text-rose-400 font-bold">{error || 'Employee profile not found'}</p>
        <Link to="/employees" className="mt-4 text-xs text-indigo-400 hover:underline">
          Back to Directory
        </Link>
      </div>
    );
  }

  const canModify = ['SuperAdmin', 'OrgAdmin'].includes(user?.role || '');

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        {/* Header Back & Edit */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/employees" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold">
            <ArrowLeft size={16} /> Back to Directory
          </Link>
          {canModify && (
            <Link
              to={`/employees/edit/${employee._id}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              <Edit2 size={14} /> Edit Profile
            </Link>
          )}
        </div>

        {/* Profile Card Summary */}
        <div className="bg-slate-900/30 border border-slate-800/80 p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center gap-6 shadow-xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="w-24 h-24 rounded-2xl bg-indigo-950 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-3xl font-extrabold shadow-lg">
            {employee.firstName[0]}
            {employee.lastName[0]}
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-200">{employee.name}</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold border border-indigo-500/20 bg-indigo-950/40 text-indigo-400 rounded-full font-mono">
                {employee.employeeId}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">{employee.designationId?.title || 'No Designation Assigned'}</p>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs text-slate-500 mt-3">
              <span className="flex items-center gap-1">
                <Briefcase size={14} />
                {employee.deptId?.name || 'No Department'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {employee.locationId?.name || 'No Location'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} /> Joined {new Date(employee.joiningDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs switcher */}
        <div className="flex border-b border-slate-800/80 mb-8">
          {[
            { id: 'profile', name: 'Profile Details' },
            { id: 'documents', name: 'Document Vault' },
            { id: 'timeline', name: 'Career History' },
          ].map((tab) => (
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
          ))}
        </div>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Info */}
            <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl space-y-5 backdrop-blur-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Personal & Contact Info</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 mb-1">Email Address</div>
                  <div className="font-semibold text-slate-300">{employee.email}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Phone Number</div>
                  <div className="font-semibold text-slate-300">{employee.phone}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Date of Birth</div>
                  <div className="font-semibold text-slate-300">{new Date(employee.dob).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Gender</div>
                  <div className="font-semibold text-slate-300">{employee.gender}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Employment Type</div>
                  <div className="font-semibold text-slate-300">{employee.employmentType}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Assigned Shift</div>
                  <div className="font-semibold text-slate-300">
                    {employee.shiftId ? `${employee.shiftId.name} (${employee.shiftId.startTime} - ${employee.shiftId.endTime})` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Manager & Emergency Contacts */}
            <div className="space-y-6">
              {/* Manager */}
              <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Line Management</h3>
                {employee.reportingManagerId ? (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm">
                      {employee.reportingManagerId.name[0]}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-300">{employee.reportingManagerId.name}</div>
                      <div className="text-[10px] text-slate-500">{employee.reportingManagerId.email}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No reporting manager assigned.</p>
                )}
              </div>

              {/* Emergency Contact */}
              <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Emergency Contact</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500">Name:</span> <span className="font-bold text-slate-300">{employee.emergencyContact.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Relationship:</span>{' '}
                    <span className="font-bold text-slate-300">{employee.emergencyContact.relationship}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>{' '}
                    <span className="font-mono font-bold text-indigo-400">{employee.emergencyContact.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Upload form */}
            <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl h-fit backdrop-blur-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Attach Documents</h3>
              {docError && <p className="text-[11px] text-rose-400 mb-3">{docError}</p>}
              <form onSubmit={handleDocUpload} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1.5">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e: any) => setDocCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300"
                  >
                    <option value="IDProof">ID Proof (Aadhaar / Passport)</option>
                    <option value="Contract">Work Contract</option>
                    <option value="Resume">Resume / CV</option>
                    <option value="Offer Letter">Offer Letter</option>
                    <option value="Profile Photo">Profile Photograph</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 mb-1.5">File Upload</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-xs"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isUploading || !docFile}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg disabled:opacity-30 cursor-pointer"
                >
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  Upload to Vault
                </button>
              </form>
            </div>

            {/* List */}
            <div className="md:col-span-2 bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Vault Contents ({documents.length})</h3>
              {documents.length === 0 ? (
                <div className="text-center text-xs text-slate-500 py-12">No files attached to profile.</div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs hover:border-indigo-500/30 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="font-semibold text-slate-300 truncate">{doc.fileName}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.2 bg-indigo-950 text-indigo-400 rounded-full text-[9px] uppercase font-bold">
                            {doc.category}
                          </span>
                          <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800"
                          title="Open Link"
                        >
                          <Eye size={14} />
                        </a>
                        <button
                          onClick={() => handleDocDelete(doc._id)}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-rose-500 hover:text-rose-400 rounded-lg border border-slate-800 cursor-pointer"
                          title="Delete File"
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
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Career Timeline Logs</h3>
            {employee.timeline.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-12">No event records generated.</div>
            ) : (
              <div className="relative border-l border-slate-800 pl-4 space-y-6">
                {employee.timeline
                  .slice()
                  .reverse()
                  .map((evt, idx) => (
                    <div key={idx} className="relative group">
                      <span className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-indigo-500 border border-[#0b0f19] group-hover:scale-125 transition-all duration-200" />
                      <div className="text-[10px] text-slate-500 mb-1">
                        {new Date(evt.date).toLocaleString()} • Actioned by <span className="text-indigo-400">{evt.performedBy}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200">{evt.action}</h4>
                      <p className="text-[11px] text-slate-400 mt-1">{evt.description}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default EmployeeDetails;

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useEmployees } from '../hooks/useEmployees';
import employeeService from '../services/employeeService';
import { User, Briefcase, PhoneCall, ChevronLeft, ChevronRight, Save, Loader2, ArrowLeft } from 'lucide-react';

export const EmployeeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { metadata, addEmployee, editEmployee } = useEmployees();

  const [activeStep, setActiveStep] = useState(1);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dob: '',
    joiningDate: new Date().toISOString().split('T')[0],
    deptId: '',
    designationId: '',
    locationId: '',
    shiftId: '',
    reportingManagerId: '',
    employmentType: 'Full-time' as 'Full-time' | 'Part-time' | 'Contract' | 'Intern',
    status: 'Active' as 'Active' | 'Onboarding' | 'Suspended' | 'Terminated',
    role: 'Employee' as 'SuperAdmin' | 'OrgAdmin' | 'Manager' | 'Employee',
    password: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
    },
  });

  // Load employee details if editing
  useEffect(() => {
    if (id) {
      const loadEmployee = async () => {
        try {
          const emp = await employeeService.getEmployee(id);
          setFormData({
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            email: emp.email || '',
            phone: emp.phone || '',
            gender: emp.gender || 'Male',
            dob: emp.dob ? new Date(emp.dob).toISOString().split('T')[0] : '',
            joiningDate: emp.joiningDate ? new Date(emp.joiningDate).toISOString().split('T')[0] : '',
            deptId: emp.deptId?._id || '',
            designationId: emp.designationId?._id || '',
            locationId: emp.locationId?._id || '',
            shiftId: emp.shiftId?._id || '',
            reportingManagerId: emp.reportingManagerId?._id || '',
            employmentType: emp.employmentType || 'Full-time',
            status: emp.status || 'Active',
            role: emp.role || 'Employee',
            password: '',
            address: {
              street: emp.address?.street || '',
              city: emp.address?.city || '',
              state: emp.address?.state || '',
              zipCode: emp.address?.zipCode || '',
              country: emp.address?.country || 'India',
            },
            emergencyContact: {
              name: emp.emergencyContact?.name || '',
              relationship: emp.emergencyContact?.relationship || '',
              phone: emp.emergencyContact?.phone || '',
            },
          });
        } catch (err: any) {
          setFormError('Failed to load employee details');
        }
      };
      loadEmployee();
    }
  }, [id]);

  const handleInputChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleAddressChange = (field: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: val },
    }));
  };

  const handleContactChange = (field: string, val: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [field]: val },
    }));
  };

  const validateStep = () => {
    setFormError(null);
    if (activeStep === 1) {
      if (!formData.firstName || !formData.lastName) return 'First and last name are required';
      if (!formData.email || !formData.phone) return 'Email and phone contact are required';
      if (!formData.dob) return 'Date of Birth is required';
    } else if (activeStep === 2) {
      if (!id && !formData.password) return 'Password is required for new accounts';
    } else if (activeStep === 3) {
      if (!formData.emergencyContact.name || !formData.emergencyContact.relationship || !formData.emergencyContact.phone) {
        return 'All Emergency Contact fields are required';
      }
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      setFormError(error);
      return;
    }
    setActiveStep((prev) => Math.min(3, prev + 1));
  };

  const handlePrev = () => {
    setFormError(null);
    setActiveStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateStep();
    if (error) {
      setFormError(error);
      return;
    }

    setFormLoading(true);
    setFormError(null);

    // Clean payload variables
    const payload: any = { ...formData };
    if (!payload.deptId) delete payload.deptId;
    if (!payload.designationId) delete payload.designationId;
    if (!payload.locationId) delete payload.locationId;
    if (!payload.shiftId) delete payload.shiftId;
    if (!payload.reportingManagerId) delete payload.reportingManagerId;
    if (id) delete payload.password; // do not update password via this profile form

    try {
      if (id) {
        await editEmployee(id, payload);
      } else {
        await addEmployee(payload);
      }
      navigate('/employees');
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit form.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        {/* Back Link */}
        <Link to="/employees" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-semibold mb-6">
          <ArrowLeft size={16} /> Back to Directory
        </Link>

        {/* Title */}
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-300 bg-clip-text text-transparent mb-10">
          {id ? 'Modify Employee Profile' : 'Onboard New Employee'}
        </h1>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-10 bg-slate-900/20 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md">
          {[
            { step: 1, name: 'Personal Details', icon: <User size={16} /> },
            { step: 2, name: 'Corporate Roll', icon: <Briefcase size={16} /> },
            { step: 3, name: 'Emergency Contacts', icon: <PhoneCall size={16} /> },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-2.5">
              <span
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-all ${
                  activeStep === item.step
                    ? 'bg-indigo-600 text-white border-transparent'
                    : activeStep > item.step
                    ? 'bg-indigo-950/40 border-indigo-500/20 text-indigo-400'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                {item.step}
              </span>
              <span className={`text-xs font-semibold hidden md:inline ${activeStep === item.step ? 'text-slate-200' : 'text-slate-500'}`}>
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="mb-6 p-4 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-medium">
            {formError}
          </div>
        )}

        {/* Form panel */}
        <form onSubmit={handleSubmit} className="bg-slate-900/30 border border-slate-800/80 p-8 rounded-2xl shadow-xl backdrop-blur-md space-y-6">
          {/* STEP 1 */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Step 1: Personal Identification</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 pt-4 border-t border-slate-800/80">Residential Address</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-2">City</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">State</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Zip Code</label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Country</label>
                    <input
                      type="text"
                      value={formData.address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Step 2: Corporate Allocations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Department</label>
                  <select
                    value={formData.deptId}
                    onChange={(e) => handleInputChange('deptId', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
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
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Designation</label>
                  <select
                    value={formData.designationId}
                    onChange={(e) => handleInputChange('designationId', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Reporting Manager</label>
                  <select
                    value={formData.reportingManagerId}
                    onChange={(e) => handleInputChange('reportingManagerId', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
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
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Work Shift</label>
                  <select
                    value={formData.shiftId}
                    onChange={(e) => handleInputChange('shiftId', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                  >
                    <option value="">Select Work Shift</option>
                    {metadata?.shifts?.map((shift) => (
                      <option key={shift._id} value={shift._id}>
                        {shift.name} ({shift.startTime} - {shift.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Office Location</label>
                  <select
                    value={formData.locationId}
                    onChange={(e) => handleInputChange('locationId', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
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
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={(e) => handleInputChange('employmentType', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Joining Date</label>
                  <input
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Work Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 pt-4 border-t border-slate-800/80">Portal Credentials</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Platform Access Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                    <option value="OrgAdmin">Organization Admin</option>
                  </select>
                </div>
                {!id && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Initial Password *</label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Step 3: Emergency Contacts</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Emergency Contact Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyContact.name}
                    onChange={(e) => handleContactChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Relationship *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Spouse, Father, Friend"
                      value={formData.emergencyContact.relationship}
                      onChange={(e) => handleContactChange('relationship', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2">Contact Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContact.phone}
                      onChange={(e) => handleContactChange('phone', e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-8 border-t border-slate-800/80">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-900 font-semibold text-slate-400 hover:text-white transition-all text-xs cursor-pointer"
              >
                <ChevronLeft size={16} />
                Previous Step
              </button>
            ) : (
              <div />
            )}

            {activeStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 font-semibold transition-all text-xs cursor-pointer"
              >
                Next Step
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={formLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold transition-all text-xs shadow-lg shadow-indigo-950/40 cursor-pointer"
              >
                {formLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {id ? 'Save Profile' : 'Complete Onboarding'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
export default EmployeeForm;

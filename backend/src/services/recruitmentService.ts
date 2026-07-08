import Candidate, { ICandidate } from '../models/Candidate';
import Interview, { IInterview } from '../models/Interview';
import InterviewFeedback, { IInterviewFeedback } from '../models/InterviewFeedback';
import OfferLetter, { IOfferLetter } from '../models/OfferLetter';
import Employee, { IEmployee } from '../models/Employee';
import mongoose from 'mongoose';

export const recruitmentService = {
  // Candidates
  createCandidate: async (data: any, orgId: string): Promise<ICandidate> => {
    const existing = await Candidate.findOne({ email: data.email, orgId });
    if (existing) {
      throw new Error('Candidate with this email already exists.');
    }

    const candidate = new Candidate({
      ...data,
      orgId,
      status: 'Applied',
      timeline: [
        {
          stage: 'Applied',
          note: 'Candidate registered in applicant pool',
          date: new Date(),
          updatedBy: 'System',
        },
      ],
    });

    return await candidate.save();
  },

  getAllCandidates: async (orgId: string, search?: string, status?: string): Promise<ICandidate[]> => {
    const query: any = { orgId };
    if (status) {
      query.status = status;
    }
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
    }
    return await Candidate.find(query).sort({ createdAt: -1 });
  },

  getCandidateById: async (id: string, orgId: string): Promise<ICandidate | null> => {
    return await Candidate.findOne({ _id: id, orgId }).populate('resume');
  },

  updateCandidate: async (id: string, data: any, orgId: string, performer: string): Promise<ICandidate | null> => {
    const candidate = await Candidate.findOne({ _id: id, orgId });
    if (!candidate) return null;

    const oldStatus = candidate.status;
    Object.assign(candidate, data);

    if (data.status && data.status !== oldStatus) {
      candidate.timeline.push({
        stage: data.status,
        note: `Status updated from ${oldStatus} to ${data.status}`,
        date: new Date(),
        updatedBy: performer,
      });
    }

    return await candidate.save();
  },

  deleteCandidate: async (id: string, orgId: string): Promise<boolean> => {
    const res = await Candidate.findOneAndDelete({ _id: id, orgId });
    return !!res;
  },

  // Interviews
  scheduleInterview: async (data: any, orgId: string, performer: string): Promise<IInterview> => {
    const candidate = await Candidate.findOne({ _id: data.candidateId, orgId });
    if (!candidate) {
      throw new Error('Candidate not found.');
    }

    const interview = new Interview({
      candidateId: data.candidateId,
      interviewerId: data.interviewerId,
      roundName: data.roundName,
      scheduledTime: data.scheduledTime,
      durationMins: data.durationMins || 60,
      mode: data.mode || 'Online',
      meetingLink: data.meetingLink || '',
      status: 'Scheduled',
    });

    await interview.save();

    // Update candidate status to corresponding stage
    let nextStage: any = 'Screening';
    if (data.roundName.toLowerCase().includes('technical')) {
      nextStage = 'Technical Interview';
    } else if (data.roundName.toLowerCase().includes('hr')) {
      nextStage = 'HR Interview';
    }

    if (candidate.status !== nextStage) {
      candidate.status = nextStage;
      candidate.timeline.push({
        stage: nextStage,
        note: `Interview scheduled for ${new Date(data.scheduledTime).toLocaleString()}`,
        date: new Date(),
        updatedBy: performer,
      });
      await candidate.save();
    }

    return interview;
  },

  getInterviews: async (orgId: string, candidateId?: string): Promise<IInterview[]> => {
    const query: any = {};
    if (candidateId) {
      query.candidateId = candidateId;
    }
    // We populate candidateId and filter candidate by orgId
    return await Interview.find(query)
      .populate({
        path: 'candidateId',
        match: { orgId },
        select: 'fullName email status',
      })
      .populate({
        path: 'interviewerId',
        select: 'name email role employeeId',
      })
      .sort({ scheduledTime: 1 });
  },

  submitFeedback: async (interviewId: string, feedbackData: any, orgId: string, performer: string): Promise<IInterviewFeedback> => {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new Error('Interview record not found.');
    }

    // Set interview status to completed
    interview.status = 'Completed';
    await interview.save();

    const feedback = new InterviewFeedback({
      interviewId,
      interviewerId: interview.interviewerId,
      rating: feedbackData.rating,
      comments: feedbackData.comments,
      recommendation: feedbackData.recommendation,
    });

    await feedback.save();

    // Auto-update candidate status
    const candidate = await Candidate.findOne({ _id: interview.candidateId, orgId });
    if (candidate) {
      let newStatus = candidate.status;
      let note = `Interview feedback submitted: ${feedbackData.recommendation}`;

      if (feedbackData.recommendation === 'Reject') {
        newStatus = 'Rejected';
      } else if (feedbackData.recommendation === 'Hire') {
        if (interview.roundName.toLowerCase().includes('hr')) {
          newStatus = 'Selected';
          note = 'Cleared HR round. Recommended for hire!';
        } else {
          newStatus = 'Screening'; // keep screening or advance
        }
      }

      candidate.status = newStatus;
      candidate.timeline.push({
        stage: newStatus,
        note,
        date: new Date(),
        updatedBy: performer,
      });
      await candidate.save();
    }

    return feedback;
  },

  getInterviewFeedbackList: async (interviewId: string): Promise<IInterviewFeedback[]> => {
    return await InterviewFeedback.find({ interviewId }).populate({
      path: 'interviewerId',
      select: 'name role',
    });
  },

  // Offer Letter
  generateOffer: async (candidateId: string, data: any, orgId: string, performer: string): Promise<IOfferLetter> => {
    const candidate = await Candidate.findOne({ _id: candidateId, orgId });
    if (!candidate) {
      throw new Error('Candidate not found.');
    }

    const offer = new OfferLetter({
      candidateId,
      approvedById: data.approvedById || '603d2e1b12cf000000000002', // fallback approver ID
      offeredSalary: data.offeredSalary,
      joiningDate: data.joiningDate,
      status: 'Approved', // Auto-approved for development/demo ease
      cloudinaryPdfUrl: `https://res.cloudinary.com/dummy/offer-letter-${candidateId}.pdf`,
    });

    await offer.save();

    // Transition candidate status to Offer Sent
    candidate.status = 'Offer Sent';
    candidate.offerDetails = {
      salary: data.offeredSalary,
      joiningDate: data.joiningDate,
      generatedAt: new Date(),
      offerLetterDoc: offer._id,
    };
    candidate.timeline.push({
      stage: 'Offer Sent',
      note: `Generated salary offer: INR ${data.offeredSalary}/year`,
      date: new Date(),
      updatedBy: performer,
    });
    await candidate.save();

    return offer;
  },

  // Conversion to Employee
  convertToEmployee: async (candidateId: string, data: any, orgId: string, performer: string): Promise<IEmployee> => {
    const candidate = await Candidate.findOne({ _id: candidateId, orgId });
    if (!candidate) {
      throw new Error('Candidate not found.');
    }

    if (candidate.status === 'Joined') {
      throw new Error('Candidate is already converted to an employee profile.');
    }

    // Check email uniqueness
    const emailExists = await Employee.findOne({ email: candidate.email });
    if (emailExists) {
      throw new Error('Employee with this email already exists.');
    }

    // Auto-generate employee ID
    const count = await Employee.countDocuments({ orgId });
    const nextNum = String(count + 1).padStart(4, '0');
    const employeeId = `EMP${nextNum}`;

    const names = candidate.fullName.split(' ');
    const firstName = names[0] || 'Converted';
    const lastName = names.slice(1).join(' ') || 'Employee';

    // Create Employee record
    const employee = new Employee({
      orgId,
      employeeId,
      name: candidate.fullName,
      firstName,
      lastName,
      email: candidate.email,
      phone: data.phone || candidate.phone || '9999988888',
      gender: data.gender || candidate.gender || 'Male',
      dob: data.dob ? new Date(data.dob) : new Date('1995-01-01'),
      joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
      deptId: data.deptId || null,
      designationId: data.designationId || null,
      locationId: data.locationId || null,
      shiftId: data.shiftId || null,
      reportingManagerId: data.reportingManagerId || null,
      employmentType: data.employmentType || 'Full-time',
      status: 'Active',
      address: data.address || { street: '', city: '', state: '', zipCode: '', country: 'India' },
      emergencyContact: data.emergencyContact || {
        name: 'Not Provided',
        relationship: 'Other',
        phone: '9999988888',
      },
      passwordHash: '$2a$10$7zBvB02w.5.8L3Y6L3uJ2.r8E/uNqA64q1k8.tGj8.7j9.8j9.8j9', // default
      role: 'Employee',
      timeline: [
        {
          action: 'Profile Initialized from Candidate',
          description: `Employee record created automatically from Candidate conversion. Candidate ID: ${candidateId}`,
          date: new Date(),
          performedBy: performer,
        },
      ],
    });

    await employee.save();

    // Update candidate
    candidate.status = 'Joined';
    candidate.timeline.push({
      stage: 'Joined',
      note: `Successfully onboarded as Employee ID: ${employeeId}`,
      date: new Date(),
      updatedBy: performer,
    });
    await candidate.save();

    return employee;
  },
};

export default recruitmentService;

export interface CandidateTimeline {
  stage: 'Applied' | 'Screening' | 'Technical Interview' | 'HR Interview' | 'Selected' | 'Offer Sent' | 'Joined' | 'Rejected';
  note?: string;
  date: string;
  updatedBy: string;
}

export interface Candidate {
  _id: string;
  orgId: string;
  fullName: string;
  email: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  status: 'Applied' | 'Screening' | 'Technical Interview' | 'HR Interview' | 'Selected' | 'Offer Sent' | 'Joined' | 'Rejected';
  experienceYears?: number;
  skills: string[];
  resume?: {
    _id: string;
    fileName: string;
    fileUrl: string;
    category: string;
  } | null;
  source: string;
  offerDetails?: {
    salary?: number;
    joiningDate?: string;
    generatedAt?: string;
    offerLetterDoc?: string | null;
  };
  timeline: CandidateTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  _id: string;
  candidateId: {
    _id: string;
    fullName: string;
    email: string;
    status: string;
  };
  interviewerId: {
    _id: string;
    name: string;
    email: string;
    role: string;
    employeeId: string;
  };
  roundName: string;
  scheduledTime: string;
  durationMins: number;
  mode: 'Online' | 'In-Person';
  meetingLink?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  createdAt: string;
  updatedAt: string;
}

export interface InterviewFeedback {
  _id: string;
  interviewId: string;
  interviewerId: {
    _id: string;
    name: string;
    role: string;
  };
  rating: number;
  comments: string;
  recommendation: 'Hire' | 'Hold' | 'Reject';
  createdAt: string;
}

export interface CandidateCreateInput {
  fullName: string;
  email: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  experienceYears?: number;
  skills?: string[];
  source?: string;
}

export interface CandidateUpdateInput extends Partial<CandidateCreateInput> {
  status?: Candidate['status'];
  resume?: string | null;
}

export interface ScheduleInterviewInput {
  candidateId: string;
  interviewerId: string;
  roundName: string;
  scheduledTime: string;
  durationMins?: number;
  mode?: 'Online' | 'In-Person';
  meetingLink?: string;
}

export interface SubmitFeedbackInput {
  rating: number;
  comments: string;
  recommendation: 'Hire' | 'Hold' | 'Reject';
}

export interface GenerateOfferInput {
  offeredSalary: number;
  joiningDate: string;
  approvedById?: string;
}

import api from '../../../services/api';
import {
  Candidate,
  CandidateCreateInput,
  CandidateUpdateInput,
  Interview,
  InterviewFeedback,
  ScheduleInterviewInput,
  SubmitFeedbackInput,
} from '../types/recruitmentTypes';

export const recruitmentService = {
  // Candidates
  getCandidates: async (filters?: { search?: string; status?: string }): Promise<Candidate[]> => {
    const response = await api.get('/recruitment/candidates', { params: filters });
    return response.data.data;
  },

  getCandidate: async (id: string): Promise<Candidate> => {
    const response = await api.get(`/recruitment/candidates/${id}`);
    return response.data.data;
  },

  createCandidate: async (data: CandidateCreateInput): Promise<Candidate> => {
    const response = await api.post('/recruitment/candidates', data);
    return response.data.data;
  },

  updateCandidate: async (id: string, data: CandidateUpdateInput): Promise<Candidate> => {
    const response = await api.put(`/recruitment/candidates/${id}`, data);
    return response.data.data;
  },

  deleteCandidate: async (id: string): Promise<void> => {
    await api.delete(`/recruitment/candidates/${id}`);
  },

  // Interviews
  scheduleInterview: async (data: ScheduleInterviewInput): Promise<Interview> => {
    const response = await api.post('/recruitment/interviews', data);
    return response.data.data;
  },

  getInterviews: async (candidateId?: string): Promise<Interview[]> => {
    const response = await api.get('/recruitment/interviews', { params: { candidateId } });
    return response.data.data;
  },

  submitFeedback: async (interviewId: string, data: SubmitFeedbackInput): Promise<InterviewFeedback> => {
    const response = await api.put(`/recruitment/interviews/${interviewId}/feedback`, data);
    return response.data.data;
  },

  getFeedback: async (interviewId: string): Promise<InterviewFeedback[]> => {
    const response = await api.get(`/recruitment/interviews/${interviewId}/feedback`);
    return response.data.data;
  },

  // Offers
  generateOffer: async (candidateId: string, salary: number, joiningDate: string) => {
    const payload = { candidateId, offeredSalary: salary, joiningDate };
    const response = await api.post('/recruitment/offers', payload);
    return response.data.data;
  },

  // Conversion
  convertToEmployee: async (candidateId: string, employeeData: any) => {
    const response = await api.post(`/recruitment/candidates/${candidateId}/convert`, employeeData);
    return response.data.data;
  },
};

export default recruitmentService;

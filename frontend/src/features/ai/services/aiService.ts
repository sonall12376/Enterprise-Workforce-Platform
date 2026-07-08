import api from '../../../services/api';
import {
  ResumeAnalysisResult,
  PolicyExplanationResult,
  AttendanceInsightResult,
  PayrollExplanationResult,
  MeetingSummaryResult,
} from '../types/aiTypes';

export const aiService = {
  chat: async (query: string): Promise<string> => {
    const response = await api.post('/ai/chat', { query });
    return response.data.data.reply;
  },

  analyzeResume: async (resumeText: string): Promise<ResumeAnalysisResult> => {
    const response = await api.post('/ai/analyze-resume', { resumeText });
    return response.data.data;
  },

  searchPolicy: async (policyType: 'IT' | 'HR' | 'Finance', query: string): Promise<PolicyExplanationResult> => {
    const response = await api.post('/ai/policy-assistant', { policyType, query });
    return response.data.data;
  },

  getAttendanceInsights: async (employeeId: string): Promise<AttendanceInsightResult> => {
    const response = await api.post('/ai/attendance-insights', { employeeId });
    return response.data.data;
  },

  explainPayroll: async (employeeId: string, month: string): Promise<PayrollExplanationResult> => {
    const response = await api.post('/ai/payroll-explanation', { employeeId, month });
    return response.data.data;
  },

  summarizeMeeting: async (meetingText: string): Promise<MeetingSummaryResult> => {
    const response = await api.post('/ai/summarize-meeting', { meetingText });
    return response.data.data;
  },
};

export default aiService;

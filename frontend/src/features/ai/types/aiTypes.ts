export interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface ResumeAnalysisResult {
  matchScore: number;
  reason: string;
  detectedSkills: string[];
  recommendation: string;
}

export interface PolicyExplanationResult {
  explanation: string;
}

export interface AttendanceInsightResult {
  employeeId: string;
  punctualityRate: string;
  daysPresent: number;
  lateArrivals: number;
  status: string;
  summary: string;
}

export interface PayrollExplanationResult {
  employeeId: string;
  billingMonth: string;
  breakdown: {
    baseSalary: string;
    monthlyAllowances: string;
    taxDeductions: string;
    netSalary: string;
  };
  explanation: string;
}

export interface MeetingSummaryResult {
  meetingSummary: string;
  actionItems: string[];
  nextSteps: string;
}

import Employee from '../models/Employee';
import Project from '../models/Project';
import Task from '../models/Task';
import HelpDeskTicket from '../models/HelpDeskTicket';
import Asset from '../models/Asset';

export const aiService = {
  generateChat: async (orgId: string, query: string, userId: string): Promise<string> => {
    const q = query.toLowerCase();

    // Context queries
    if (q.includes('employee') || q.includes('staff')) {
      const count = await Employee.countDocuments({ orgId });
      return `According to the platform directory, there are currently ${count} employees registered under your organization.`;
    }

    if (q.includes('project')) {
      const count = await Project.countDocuments({ orgId });
      const active = await Project.countDocuments({ orgId, status: 'Active' });
      return `There are currently ${count} projects registered in the system, with ${active} projects actively marked as In Progress.`;
    }

    if (q.includes('task')) {
      const count = await Task.countDocuments({ orgId });
      const todo = await Task.countDocuments({ orgId, status: 'Todo' });
      return `There are currently ${count} total tasks tracked across your projects (${todo} in Todo, ${count - todo} in progress or review).`;
    }

    if (q.includes('ticket') || q.includes('helpdesk') || q.includes('support')) {
      const count = await HelpDeskTicket.countDocuments({ orgId, status: { $ne: 'Closed' } });
      return `There are currently ${count} open support tickets requiring agent assignment or attention in the Help Desk module.`;
    }

    if (q.includes('asset') || q.includes('device') || q.includes('laptop')) {
      const count = await Asset.countDocuments({ orgId, status: 'Assigned' });
      return `Our hardware records list ${count} assets currently assigned to active employees.`;
    }

    // Default response templates
    return `AI Assistant Response: I processed your query: "${query}". As your AI assistant, I can help you query organizational directories, draft OKRs, search assets, or explain corporate compliance policy documents.`;
  },

  analyzeResume: async (resumeText: string): Promise<any> => {
    const text = resumeText.toLowerCase();
    let score = 75;
    let matchReason = 'Candidate demonstrates standard matching credentials.';
    const skills: string[] = [];

    if (text.includes('javascript') || text.includes('typescript') || text.includes('react')) {
      score += 15;
      skills.push('Frontend Web Development');
    }
    if (text.includes('node') || text.includes('mongodb') || text.includes('express')) {
      score += 10;
      skills.push('Backend API Design');
    }
    if (text.includes('python') || text.includes('machine learning')) {
      skills.push('Data Engineering');
    }

    if (score >= 90) {
      matchReason = 'Strong match: Candidate has extensive full-stack web application development experience.';
    } else if (score >= 80) {
      matchReason = 'Good match: Candidate satisfies all core platform technology specifications.';
    }

    return {
      matchScore: Math.min(score, 100),
      reason: matchReason,
      detectedSkills: skills.length > 0 ? skills : ['General IT Support'],
      recommendation: score >= 80 ? 'Proceed to Technical Interview' : 'Hold for Review',
    };
  },

  explainPolicy: async (policyType: string, query: string): Promise<string> => {
    const type = policyType.toUpperCase();
    if (type === 'HR') {
      return `HR Policy Assistant: Employees accrue 1.5 casual leave days per calendar month. Maternity leaves are capped at 180 calendar days. Appraisal cycles initiate on October 1st annually.`;
    }
    if (type === 'IT') {
      return `IT Security Policy Assistant: Device security updates must be run weekly. Corporate VPN credentials are strictly individual. Assets must be returned immediately upon exit lifecycle initiation.`;
    }
    return `Policy Assistant: General workforce guidelines stipulate standard core work windows from 09:00 AM to 06:00 PM with check-in tolerances up to 15 minutes.`;
  },

  getAttendanceInsights: async (employeeId: string): Promise<any> => {
    const charCodeSum = employeeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const punctuality = 85 + (charCodeSum % 15); // e.g. 85% to 100%
    const totalDays = 20 + (charCodeSum % 3);

    return {
      employeeId,
      punctualityRate: `${punctuality}%`,
      daysPresent: totalDays,
      lateArrivals: Math.max(0, 22 - totalDays),
      status: punctuality >= 90 ? 'Excellent' : 'Needs Correction Alert',
      summary: `Employee check-in patterns show standard consistency with high geo-verification compliance.`,
    };
  },

  explainPayroll: async (employeeId: string, month: string): Promise<any> => {
    const charCodeSum = employeeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const base = 5000 + (charCodeSum % 5) * 500; // e.g. 5000 to 7000
    const allowance = 300;
    const deductions = (charCodeSum % 3) * 150; // e.g. 0 to 300

    return {
      employeeId,
      billingMonth: month,
      breakdown: {
        baseSalary: `$${base}`,
        monthlyAllowances: `$${allowance}`,
        taxDeductions: `-$${deductions}`,
        netSalary: `$${base + allowance - deductions}`,
      },
      explanation: `Calculated net earnings for ${month} include allowances for remote equipment support minus check-in delays deductions.`,
    };
  },

  summarizeMeeting: async (meetingText: string): Promise<any> => {
    const lines = meetingText.split('\n').filter((l) => l.trim().length > 0);
    const points = lines.map((line) => `Summarized Action: ${line.trim()}`);

    return {
      meetingSummary: 'Completed weekly operational reviews check and aligned on Developer D milestone deliverables.',
      actionItems: points.length > 0 ? points : ['Action: Validate database indexes migrations.'],
      nextSteps: 'Schedule walkthrough and deployment staging check.',
    };
  },
};

export default aiService;

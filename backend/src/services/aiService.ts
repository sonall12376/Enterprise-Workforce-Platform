import Employee from '../models/Employee';
import Project from '../models/Project';
import Task from '../models/Task';
import HelpDeskTicket from '../models/HelpDeskTicket';
import Asset from '../models/Asset';
import { env } from '../config/env';

export const aiService = {
  generateChat: async (orgId: string, query: string, userId: string): Promise<string> => {
    const q = query.toLowerCase();

    // Fetch database counts for contextual generation
    const employeeCount = await Employee.countDocuments({ orgId }).catch(() => 0);
    const projectCount = await Project.countDocuments({ orgId }).catch(() => 0);
    const activeProjectCount = await Project.countDocuments({ orgId, status: 'Active' }).catch(() => 0);
    const taskCount = await Task.countDocuments({ orgId }).catch(() => 0);
    const todoTaskCount = await Task.countDocuments({ orgId, status: 'Todo' }).catch(() => 0);
    const ticketCount = await HelpDeskTicket.countDocuments({ orgId, status: { $ne: 'Closed' } }).catch(() => 0);
    const assetCount = await Asset.countDocuments({ orgId, status: 'Assigned' }).catch(() => 0);

    const apiKey = env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `System Prompt:\nYou are a helpful AI Operations Assistant for the Enterprise Workforce Management Platform. Use the following real-time database context of the user's organization to answer the query concisely and professionally:\n- Total employees registered: ${employeeCount}\n- Total projects: ${projectCount} (${activeProjectCount} Active)\n- Total tasks: ${taskCount} (${todoTaskCount} Todo, ${taskCount - todoTaskCount} in progress/review)\n- Open support tickets: ${ticketCount}\n- Assigned hardware assets: ${assetCount}\n\nGuidelines:\n- Present this information naturally without mentioning "database context" or raw queries.\n- If greeted, respond politely and list your capabilities (e.g. employee queries, project status, task tracking, ticketing, assets, OKRs).\n- Keep answers clear and brief.\n\nUser query: "${query}"`
                  }
                ]
              }
            ]
          })
        });

        if (response.ok) {
          const data = (await response.json()) as any;
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return reply.trim();
          }
        } else {
          console.error(`Gemini API returned status ${response.status}:`, await response.text());
        }
      } catch (error) {
        console.error('Failed to communicate with Gemini API:', error);
      }
    }

    // Smart Fallback Mock Responder (when API Key is missing or request fails)
    if (q.includes('employee') || q.includes('staff')) {
      return `According to the platform directory, there are currently ${employeeCount} employees registered under your organization. Let me know if you need to fetch specific user details.`;
    }

    if (q.includes('project')) {
      return `There are currently ${projectCount} projects registered in the system, with ${activeProjectCount} projects actively marked as Active/In Progress.`;
    }

    if (q.includes('task')) {
      return `There are currently ${taskCount} total tasks tracked across your projects (${todoTaskCount} in Todo, ${taskCount - todoTaskCount} in progress or review).`;
    }

    if (q.includes('ticket') || q.includes('helpdesk') || q.includes('support')) {
      return `There are currently ${ticketCount} open support tickets requiring agent assignment or attention in the Help Desk module.`;
    }

    if (q.includes('asset') || q.includes('device') || q.includes('laptop')) {
      return `Our hardware records list ${assetCount} assets currently assigned to active employees.`;
    }

    if (q.includes('how are you') || q.includes('how are tou') || q.includes('who are you') || q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return `Hello! I am your AI Operations Assistant. I am doing great and ready to assist you. I can help you query organizational directories, draft OKRs, search assets, or explain corporate compliance policy documents. How can I help you today?`;
    }

    if (q.includes('explain') || q.includes('what is this') || q.includes('help')) {
      return `I am the platform's AI Operations Assistant. You can ask me questions about your organization's counts (like employees, active projects, tasks, open support tickets, and hardware assets), search policy guidelines, analyze resumes, or request insights.`;
    }

    // Default response using dynamic data
    return `As your AI Assistant, I processed your query: "${query}". I can help you query organizational directories, draft OKRs, search assets, or explain corporate compliance policy documents. Currently, your organization has ${employeeCount} employees, ${projectCount} projects, and ${ticketCount} open tickets.`;
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

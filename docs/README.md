# Enterprise Workforce Management Platform Documentation Hub

Welcome to the central documentation hub for the **Enterprise Workforce Management Platform with AI Operations Assistant**. This repository serves as the single source of truth for the entire development team.

---

## 1. Project Introduction
The platform is an enterprise-grade solution designed to consolidate workforce operations into a single platform. It supports attendance management, geofenced tracking, shift calendars, leave request pipelines, automatic payroll calculations, and resume screening evaluations.

Additionally, the system incorporates an **AI Operations Assistant** to query database records, compile employee statistics, analyze candidate resumes, suggest feedback prompts, and answer policy questions.

---

## 2. Platform Core Features
- **Security & RBAC**: Stateless token verification protecting APIs and views according to system roles.
- **Onboarding Directory**: Manages employee life stages, document uploads, and profile parameters.
- **Time Operations**: Real-time clock-in/out, geofencing, shift patterns, and holiday calendars.
- **Leaves Pipeline**: Tracks allocation balances, requests, and approval levels.
- **Payroll calculations**: Calculates basic pay, deductions, taxes, allowances, and distributes payslips.
- **Collaboration Board**: Kanban task tracking, deadline logs, and project assignments.
- **IT Support desk**: IT service tickets queue, priority levels, and assignment tracking.
- **Reports & Insights**: Real-time operational metric dashboard charts.
- **AI Operations**: Google Gemini LLM assistant integration.

---

## 3. Technology Stack
- **Frontend SPA**: React 19, Vite, TypeScript, Tailwind CSS v4, React Router DOM, Axios, Zod.
- **Backend API**: Node.js, Express, TypeScript, Mongoose (MongoDB ODM), Socket.IO, Nodemailer, Cloudinary, Gemini AI.
- **Data Engine**: MongoDB Atlas.

---

## 4. Documentation Catalog

| Document | Purpose |
| :--- | :--- |
| **[Implementation Plan](file:///d:/New%20folder/Xebia_Internship/Enterprise-Workforce-Platform/docs/implementation-plan.md)** | Technical architecture, library decisions, auth rules, and deploy scopes. |
| **[Team Responsibilities](file:///d:/New%20folder/Xebia_Internship/Enterprise-Workforce-Platform/docs/team-responsibilities.md)** | Task allocation among the four developers to enable parallel workflow. |
| **[Database Design](file:///d:/New%20folder/Xebia_Internship/Enterprise-Workforce-Platform/docs/database-design.md)** | Schemas, relations, keys, validation rules, and indexes for all 28 collections. |
| **[API Design](file:///d:/New%20folder/Xebia_Internship/Enterprise-Workforce-Platform/docs/api-design.md)** | The REST API contract listing endpoints, inputs, outputs, and validation rules. |
| **[UI Design](file:///d:/New%20folder/Xebia_Internship/Enterprise-Workforce-Platform/docs/ui-design.md)** | Blueprint detailing pages, inputs, tables, and views for Google Stitch integration. |
| **[RBAC Policies](file:///d:/New%20folder/Xebia_Internship/Enterprise-Workforce-Platform/docs/rbac.md)** | Role permissions mapping table and guard middlewares definitions. |
| **[Business Workflows](file:///d:/New%20folder/Xebia_Internship/Enterprise-Workforce-Platform/docs/workflows.md)** | Mermaid workflow diagrams for recruitment, attendance, leave, and payroll. |
| **[Coding Guidelines](file:///d:/New%20folder/Xebia_Internship/Enterprise-Workforce-Platform/docs/coding-guidelines.md)** | Standards for naming conventions, React/Express code patterns, and Git logs. |
| **[Git Workflow](file:///d:/New%20folder/Xebia_Internship/Enterprise-Workforce-Platform/docs/git-workflow.md)** | Branch naming rules, PR workflows, approvals, and merging methods. |
| **[Folder Structure](file:///d:/New%20folder/Xebia_Internship/Enterprise-Workforce-Platform/docs/folder-structure.md)** | Monorepo layout directory reference manual. |

---

## 5. Development Setup Instructions

### Backend Local Launch:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Copy `.env.example` to `.env` and fill in local credentials:
   ```bash
   cp .env.example .env
   ```
3. Run the development API server:
   ```bash
   npm run dev
   ```

### Frontend Local Launch:
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```

---

## 6. Team Collaboration & Contribution Rules
- Always pull changes from `origin develop` before starting work.
- Keep features isolated within feature branches (`feature/am-leave-balances`).
- Test code compile targets locally (`npm run build`) before making PR requests.
- Link PRs to target tracking issues and request reviews from team members.

---

## 7. License
Licensed under the **MIT License**. For details, please contact the project administrator.

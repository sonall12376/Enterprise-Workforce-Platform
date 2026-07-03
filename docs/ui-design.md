# Frontend UI Planning Document (Google Stitch Ready)

This document provides layout guides, tables, fields, and API linkages for each module to help generate React 19 pages and components using Google Stitch.

---

## 1. Authentication Module
- **Required Pages:** 
  - Login Page (`/login`)
- **Required Forms:**
  - Login Form: `email` (text), `password` (password), `rememberMe` (checkbox).
- **Required Dialogs:** None
- **Navigation Flow:** `/login` -> redirects to `/` (dashboard) upon verification.
- **Role Visibility:** Publicly available.
- **API Dependencies:** POST `/api/auth/login`

---

## 2. Organization Module
- **Required Pages:** 
  - Organization Settings (`/settings/organization`)
  - Department Directory (`/settings/departments`)
- **Required Forms:**
  - Department Form: `name` (text), `code` (text), `managerId` (dropdown).
  - Office Location Form: `name` (text), `timezone` (dropdown), `latitude` (number), `longitude` (number), `radius` (number).
- **Required Tables:**
  - Departments Table: Columns: `Code`, `Department Name`, `Manager Name`, `Employee Count`, `Actions`.
- **Role Visibility:** `SuperAdmin` and `OrgAdmin` only.
- **API Dependencies:** GET/POST `/api/organization/departments`, GET/POST `/api/organization/locations`

---

## 3. Employee Module
- **Required Pages:**
  - Employee Directory (`/employees`)
  - Employee Detail Profile (`/employees/:id`)
  - Onboard Employee (`/employees/new`)
- **Required Forms:**
  - Employee Information Form: `fullName` (text), `email` (text), `role` (dropdown), `departmentId` (dropdown), `designationId` (dropdown), `reportingManagerId` (dropdown).
- **Required Tables:**
  - Employees Directory Table: Columns: `ID`, `Name`, `Department`, `Designation`, `Role`, `Status`, `Actions`.
- **Role Visibility:** Directory visible to all. Onboard form restricted to `SuperAdmin` and `OrgAdmin`.
- **API Dependencies:** GET `/api/employees`, POST `/api/employees/onboard`

---

## 4. Recruitment Module
- **Required Pages:**
  - Candidates Tracker (`/recruitment/candidates`)
  - Active Jobs Panel (`/recruitment/jobs`)
- **Required Forms:**
  - Candidate Registration: `fullName` (text), `email` (text), `phone` (text), `resumeUrl` (file upload).
  - Interview Feedback Form: `rating` (rating selector 1-5), `recommendation` (dropdown: Hire/Hold/Reject), `comments` (textarea).
- **Required Tables:**
  - Candidates Pipeline Table: Columns: `Candidate Name`, `Applied Job`, `Stage`, `Interview Score`, `Status`, `Actions`.
- **Role Visibility:** `SuperAdmin`, `OrgAdmin`, and `Manager`.
- **API Dependencies:** GET/POST `/api/recruitment/candidates`, GET/POST `/api/recruitment/interviews`

---

## 5. Attendance Module
- **Required Pages:**
  - Attendance Logs (`/attendance`)
- **Required Forms:**
  - Clock-In/Out Widget: Simple click trigger with geo-coordinate fetch support.
  - Correction Request Form: `date` (date), `newClockIn` (time), `newClockOut` (time), `reason` (textarea).
- **Required Tables:**
  - Employee Time Log Table: Columns: `Date`, `Clock-In`, `Clock-Out`, `Working Hours`, `Status`, `Action`.
- **Role Visibility:** All logged-in employees.
- **API Dependencies:** POST `/api/attendance/clock-in`, POST `/api/attendance/correction`

---

## 6. Leave Module
- **Required Pages:**
  - Leaves Center (`/leaves`)
- **Required Forms:**
  - Time Off Request Form: `leaveType` (dropdown: Sick/Casual/Earned), `startDate` (date), `endDate` (date), `reason` (textarea).
- **Required Tables:**
  - Requests Log Table: Columns: `Leave Type`, `Duration`, `Status`, `Requested On`, `Approved By`.
- **Required Reusable Components:**
  - Leave Balance Widget: Cards showing remaining `Casual`, `Sick`, and `Earned` leave days.
- **Role Visibility:** All employees. Managers see an additional approval tab.
- **API Dependencies:** GET/POST `/api/leaves/request`, GET `/api/leaves/balance`

---

## 7. Payroll Module
- **Required Pages:**
  - Payslips Hub (`/payroll`)
  - Payroll Administration Dashboard (`/admin/payroll`)
- **Required Forms:**
  - Salary Setup Form: `baseSalary` (number), `allowances` (number), `deductions` (number).
- **Required Tables:**
  - Payslips Registry: Columns: `Pay Period`, `Base Salary`, `Allowances`, `Deductions`, `Net Pay`, `Download Link`.
- **Role Visibility:** Self payslips: All employees. Admin panel: `SuperAdmin` and `OrgAdmin`.
- **API Dependencies:** GET `/api/payroll/payslips`, POST `/api/payroll/calculate`

---

## 8. Performance Module
- **Required Pages:**
  - OKRs & Goals Tracker (`/performance/goals`)
  - Performance Evaluations (`/performance/reviews`)
- **Required Forms:**
  - OKR Definition: `title` (text), `targetDate` (date), `initialValue` (number).
  - Appraisal Form: `evaluationPeriod` (text), `rating` (dropdown 1.0-5.0), `feedback` (textarea).
- **Required Tables:**
  - Goals Registry: Columns: `Goal Objective`, `Deadline`, `Completion Progress`, `Status`.
- **Role Visibility:** Employees track goals. Managers submit appraisal scores.
- **API Dependencies:** GET/POST `/api/performance/goals`, POST `/api/performance/review`

---

## 9. Project Management Module
- **Required Pages:**
  - Projects Listing (`/projects`)
  - Project Kanban Board (`/projects/:id/board`)
- **Required Forms:**
  - Create Project: `name` (text), `startDate` (date), `managerId` (dropdown).
  - Task Definition: `title` (text), `priority` (dropdown: Low/Med/High), `assignedTo` (dropdown).
- **Required Dashboards:**
  - Kanban Board layout divided into lists: `Todo`, `InProgress`, `Review`, and `Done`.
- **Role Visibility:** All active project members.
- **API Dependencies:** GET/POST `/api/projects`, GET/POST `/api/tasks`

---

## 10. Asset Management Module
- **Required Pages:**
  - Assets Inventory (`/assets`)
- **Required Forms:**
  - Hardware Registry Form: `name` (text), `serialNumber` (text), `type` (dropdown: Laptop/Phone/Desk).
- **Required Tables:**
  - Inventory Log Table: Columns: `Asset Name`, `Serial ID`, `Asset Type`, `Assigned Employee`, `Status`, `Action`.
- **Role Visibility:** Admin view only (`SuperAdmin`, `OrgAdmin`).
- **API Dependencies:** GET/POST `/api/assets`, POST `/api/assets/assign`

---

## 11. Help Desk Module
- **Required Pages:**
  - Support Center (`/helpdesk`)
  - Ticket Detail (`/helpdesk/tickets/:id`)
- **Required Forms:**
  - Support Ticket Form: `subject` (text), `description` (textarea), `category` (dropdown: IT/HR), `priority` (dropdown: Low/Med/High).
- **Required Tables:**
  - Ticket Logs: Columns: `Ticket ID`, `Subject`, `Category`, `Priority`, `Status`, `Created Date`, `Action`.
- **Role Visibility:** Open to all users. Assignee settings restricted to agents/admins.
- **API Dependencies:** GET/POST `/api/helpdesk/tickets`

---

## 12. Document Management Module
- **Required Pages:**
  - Shared Documents File Repository (`/documents`)
- **Required Forms:**
  - Upload Document Widget: Drag-and-drop container accepting PDF/PNG with `category` dropdown.
- **Required Tables:**
  - Files Table: Columns: `File Name`, `Category`, `Uploaded By`, `Date Uploaded`, `Download Link`.
- **Role Visibility:** Read access to all. Upload options controlled by user roles.
- **API Dependencies:** GET/POST `/api/documents`

---

## 13. Reports & Analytics Module
- **Required Pages:**
  - Analytics Console (`/reports`)
- **Required Charts:**
  - Employee distribution (Pie chart by department).
  - Monthly net payroll budget (Bar chart over the year).
  - Task status completion stats (Donut chart).
- **Role Visibility:** `SuperAdmin` and `OrgAdmin` restricted.
- **API Dependencies:** GET `/api/reports/dashboard`

---

## 14. AI Operations Assistant Module
- **Required Pages:**
  - AI Assistant Console (`/ai-assistant`)
- **Required Reusable Components:**
  - Floating Assistant Chatbot Widget: An overlay chat component present on all pages for managers/admins.
- **Dialogs / Modals:**
  - Resume Parsing Dialog: Screen displaying candidate file text summary insights.
- **Role Visibility:** Conversational assistant open to all. Advanced resume analytics limited to Recruiters/Managers.
- **API Dependencies:** POST `/api/ai/chat`, POST `/api/ai/parse-resume`

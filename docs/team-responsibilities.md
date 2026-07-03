# Team Responsibilities & Module Allocation

To maximize parallel development and eliminate blocking dependencies, the Enterprise Workforce Management Platform is divided into four independent full-stack ownership areas. Each developer owns the complete lifecycle of their assigned modules, including frontend, backend, database models, APIs, testing, and integration.

The project follows a shared architecture, coding standards, API contracts, and database conventions documented in the `/docs` directory.

---

# 1. Developer Assignments

## 👨‍💻 Developer A – Authentication, Organization & User Management

### Owned Modules

- Authentication
- User Management
- Organization Management
- Role-Based Access Control (RBAC)
- Profile Management

### Backend Responsibilities

- JWT Authentication
- Refresh Token Management
- Forgot Password
- Reset Password
- Change Password
- Account Lock & Unlock
- Session Management
- Role Middleware
- User CRUD APIs
- Organization CRUD APIs
- Department CRUD APIs
- Designation CRUD APIs
- Office Location CRUD APIs
- Work Shift CRUD APIs
- Holiday Calendar CRUD APIs

### Frontend Responsibilities

- Login
- Forgot Password
- Reset Password
- Change Password
- User Profile
- Organization Settings
- Department Management
- Designation Management
- User Management
- Sidebar
- Navbar
- Protected Routes
- Authentication Context

### Database Ownership

- Users
- Organizations
- Departments
- Designations
- OfficeLocations
- WorkShifts
- Holidays
- RefreshTokens
- LoginHistory

---

## 👨‍💻 Developer B – Employee & Recruitment Management

### Owned Modules

- Employee Management
- Recruitment Management
- Document Management

### Backend Responsibilities

- Employee CRUD
- Employee Timeline
- Employee Search
- Employee ID Generation
- Manager Assignment
- Candidate CRUD
- Resume Upload
- Resume Parsing
- Interview Scheduling
- Interview Feedback
- Offer Letter Generation
- Candidate → Employee Conversion
- Document Upload APIs
- Cloudinary Integration

### Frontend Responsibilities

- Employee Dashboard
- Employee List
- Employee Details
- Employee Search
- Candidate Dashboard
- Resume Upload
- Interview Management
- Offer Letter Page
- Employee Documents
- Document Viewer

### Database Ownership

- Employees
- Candidates
- Interviews
- InterviewFeedback
- OfferLetters
- Documents

---

## 👨‍💻 Developer C – HR Operations

### Owned Modules

- Attendance Management
- Leave Management
- Payroll Management
- Performance Management
- Notifications

### Backend Responsibilities

- Clock In
- Clock Out
- Attendance Reports
- Attendance Corrections
- Leave Application
- Leave Approval
- Leave Balance Calculation
- Payroll Engine
- Salary Calculation
- Payslip Generation
- Performance Reviews
- KPI Management
- Goal Tracking
- Notification APIs
- Email Notifications

### Frontend Responsibilities

- Attendance Dashboard
- Attendance Calendar
- Leave Dashboard
- Leave Application
- Leave Approval
- Payroll Dashboard
- Salary History
- Payslip Download
- Performance Dashboard
- KPI Forms
- Goal Tracking UI
- Notification Center

### Database Ownership

- Attendance
- AttendanceCorrections
- LeaveRequests
- LeaveBalances
- Payroll
- PerformanceReviews
- Goals
- Notifications

---

## 👨‍💻 Developer D – Projects, Assets, Help Desk, Reports & AI

### Owned Modules

- Project Management
- Asset Management
- Help Desk
- Reports & Analytics
- AI Operations Assistant

### Backend Responsibilities

- Project CRUD
- Task CRUD
- Sprint Management
- Kanban APIs
- Asset CRUD
- Asset Assignment
- Help Desk CRUD
- Ticket Workflow
- Report Generation APIs
- Dashboard Statistics
- Analytics Queries
- AI Chat API
- Resume Analysis
- Policy Assistant
- Attendance Insights
- Payroll Explanation
- Meeting Notes Summarizer
- Document Search

### Frontend Responsibilities

- Project Dashboard
- Kanban Board
- Task Management
- Asset Dashboard
- Help Desk Dashboard
- Ticket Pages
- Analytics Dashboard
- Reports
- Charts
- AI Chat Widget
- AI Document Search
- AI Resume Analyzer

### Database Ownership

- Projects
- Tasks
- Assets
- AssetAssignments
- HelpDeskTickets
- AIConversations
- Analytics Views

---

# 2. Shared Responsibilities

Every developer is equally responsible for maintaining project quality.

### GitHub Collaboration

- Work only on feature branches.
- Never push directly to `main`.
- Create Pull Requests for every completed feature.
- Review at least one teammate's Pull Request before approval.

### Shared Documentation

All developers must update documentation whenever their module changes.

- API Design
- Database Design
- UI Design
- Workflows
- README

### Shared UI Components

Reusable UI components belong in:

```
frontend/src/components/ui/
```

Examples:

- Button
- Card
- Table
- Modal
- Input
- Pagination
- Badge

Do not duplicate reusable components inside feature folders.

### Shared API Client

All frontend API requests must use:

```
frontend/src/services/api.ts
```

No module should create its own Axios instance.

### Shared Database Rules

If a database model affects another module (for example `Employee`), the owner must notify the team before making breaking changes.

### Testing

Each developer is responsible for:

- Unit Testing
- API Testing
- Frontend Testing
- Bug Fixes
- Module Documentation

---

# 3. Integration Responsibilities

### Developer A ↔ Developer B

- Authentication with Employee onboarding
- Employee profile authorization
- Role-based employee access

### Developer B ↔ Developer C

- Employee records with Attendance
- Leave balance integration
- Payroll employee data
- Performance employee mapping

### Developer C ↔ Developer D

- Attendance analytics
- Payroll reports
- Performance dashboards
- Employee productivity insights

### Developer D ↔ All Developers

The AI Operations Assistant requires read-only access to all approved APIs.

Every module owner must expose secure endpoints that the AI service can consume for contextual responses.

---

# 4. Pull Request & Merge Policy

## Pull Requests

- Every feature must be developed in its own feature branch.
- Every Pull Request requires at least one approval.
- No direct commits to `main`.

## Merge Rules

Merge only after:

- Successful testing
- No merge conflicts
- Documentation updated
- Code review completed

## Conflict Resolution

If merge conflicts occur:

- Developers resolve conflicts together.
- The feature owner is responsible for the final merged code.
- Breaking database or API changes must be communicated to the team before merging.

---

# 5. Project Ownership Summary

| Developer | Modules |
|-----------|---------|
| Developer A | Authentication, User Management, Organization Management, RBAC, Profile Management |
| Developer B | Employee Management, Recruitment Management, Document Management |
| Developer C | Attendance, Leave, Payroll, Performance, Notifications |
| Developer D | Projects, Assets, Help Desk, Reports & Analytics, AI Operations Assistant |
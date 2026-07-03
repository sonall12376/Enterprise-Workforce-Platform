# Core Business Workflows Documentation

This document describes the operational workflows exactly as defined by the SRS. It contains step-by-step flows and Mermaid sequence diagrams for developer reference.

---

## 1. Recruitment Workflow
Manages candidates from application to the official offer letter.

```mermaid
sequenceDiagram
    participant C as Candidate
    participant R as Recruiter / Admin
    participant M as Manager
    
    C->>R: Submits application & Uploads resume
    R->>R: Resume screen (AI Match score)
    R->>C: Schedules Interview Round
    M->>R: Submits feedback rating (1-5 score)
    R->>M: Drafts Offer Letter & Salary terms
    M->>R: Approves Offer Letter
    R->>C: Sends Offer Letter (PDF Link)
    C->>R: Accepts Offer Letter (Status: Accepted)
```

---

## 2. Employee Lifecycle Workflow
Covers lifecycle stages from candidate conversion to onboarding and exit.

```text
[Candidate Offer Accepted] 
           │
           ▼
[Onboarding: Employee profile created automatically] 
           │
           ▼
[Profile Setup: Document verification (ID & Contract uploads)]
           │
           ▼
[Assignments: Department, Designation, Location, WorkShift allocated]
           │
           ▼
[Active Operations: Shift scheduling, attendance, leave cycles, monthly payroll]
           │
           ▼
[Annual Review: Appraisals, goal setting, rating feedback]
           │
           ▼
[Exit Lifecycle: Resignation submission, asset returns, exit survey, status: Terminated]
```

---

## 3. Attendance Workflow
Logs daily hours and manages manual correction requests.

```mermaid
graph TD
    Start([Employee Clock-in]) --> Geo{Geofence match?}
    Geo -->|No| Fail[Block Clock-in]
    Geo -->|Yes| Time{Within Shift hours?}
    Time -->|Late| LogLate[Log status: Late]
    Time -->|OnTime| LogPresent[Log status: Present]
    LogPresent --> Out([Employee Clock-out])
    LogLate --> Out
    Out --> Calc[Calculate Daily Work Minutes]
    Calc --> Correct{Hours correction needed?}
    Correct -->|Yes| Req[Submit correction request]
    Req --> Review{Manager approved?}
    Review -->|No| Reject[Status: Rejected]
    Review -->|Yes| Update[Update Attendance log]
```

---

## 4. Leave Approval Workflow
Ensures leave balance checks before time-off approval.

```mermaid
sequenceDiagram
    participant E as Employee
    participant M as Manager
    participant B as Leave Balance DB
    
    E->>B: Query available balances
    E->>M: Submit leave request (StartDate, EndDate)
    M->>B: Check employee's current balance
    alt Sufficient Balance
        M->>E: Approved & send notification email
        M->>B: Deduct leave days from balance
    else Insufficient Balance
        M->>E: Reject request
    end
```

---

## 5. Payroll Workflow
Details the automated monthly calculations and payslip approvals.

```text
[Month Cutoff Date reached (e.g. 28th)]
           │
           ▼
[Gather unpaid leaves, late check-in deductions, and monthly allowances]
           │
           ▼
[System calculates Net Salary: Base + Allowances - Deductions]
           │
           ▼
[Payroll generated in status: Draft]
           │
           ▼
[OrgAdmin reviews and approves Payroll]
           │
           ▼
[Bank transfer export generated & Payslips status: Paid]
           │
           ▼
[Nodemailer dispatches payslip notifications to employee emails]
```

---

## 6. Performance Review Workflow
Tracks goal alignment (OKRs) and reviews.

1. **Goal Setting:** Manager sets annual goals (OKRs) for Employee. Status: `InProgress`.
2. **Progress Updates:** Employee updates progress percentages (0-100%) on milestones.
3. **Appraisal Initiation:** HR triggers review cycle. Manager assesses goal metrics.
4. **Appraisal Review:** Manager writes comments, selects rating (1.0-5.0), and submits evaluation.
5. **Acknowledgment:** Employee signs off review notes. Status: `Acknowledged`.

---

## 7. Project Management Workflow
Supports agile task assignments.

```mermaid
graph LR
    P[Create Project] --> A[Assign Project Manager]
    A --> T[Create Tasks: Todo]
    T --> Dev[Move to: InProgress]
    Dev --> Rev[Move to: Code Review]
    Rev --> Done[Move to: Done]
    Done --> ProjectFinish{All tasks finished?}
    ProjectFinish -->|Yes| Complete[Complete Project]
```

---

## 8. Help Desk Workflow
Service desk ticketing lifecycle.

1. **Submission:** Employee creates support ticket. System flags category and priority.
2. **Allocation:** System assigns to IT or HR staff agent. Status: `Assigned`.
3. **Resolution:** Agent investigates, changes state to `InProgress`, writes updates, and resolves ticket.
4. **Closure:** Employee receives alert and closes ticket.

---

## 9. AI Operations Assistant Workflow
Interactive prompts processing with database contexts.

```mermaid
sequenceDiagram
    participant E as User / Employee
    participant S as Server API
    participant DB as MongoDB Database
    participant AI as Gemini API
    
    E->>S: Submits chat query (e.g. "Draft OKR for developer")
    S->>S: Validate RBAC permissions scope
    S->>DB: Query context data (role info, policy docs)
    DB-->>S: Return data context
    S->>S: Construct Prompt with system instruction & context
    S->>AI: Dispatch prompt to Gemini model
    AI-->>S: Return response text
    S-->>E: Render parsed chat answer
```

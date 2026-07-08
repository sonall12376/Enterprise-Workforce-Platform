# Enterprise Workforce Management Platform

An enterprise-grade Workforce Management Platform built with React, Vite, Node.js, Express, and MongoDB. This platform features a high-performance feature-based frontend architecture and a modular domain-driven backend routing system to support rapid growth and concurrent development.

---

## 🎯 Project Overview & Problem Statement

### The Problem Statement
Managing a modern, scaling enterprise workforce involves coordinating highly fragmented business operations. Traditional organizations suffer from disconnected operational silos:
- **Manual Overhead & Paper Trails**: Fragmented tools for managing leave balances, payroll slips, and equipment asset allocations.
- **Attendance Leakage & Geolocation Verification**: The lack of coordinate validation leads to inaccurate check-ins and time tracking.
- **Friction in Recruitment Pipeline**: Poor conversions when shortlisting candidates from interview rounds into active employee records.
- **Administrative Access Gaps**: Security concerns when general staff are able to access project financials, system designation settings, or core analytics reports.
- **Information Query Overload**: High overhead spent by HR manually parsing dense company policies, compiling meeting transcripts, or screening uploaded candidate resumes.

### How this Platform Helps
The **Enterprise Workforce Management Platform** consolidates all operation verticals into a secure, single-pane portal:
- **Location-Verified Attendance Check-Ins**: Integrates real-time geofenced coordinate checks (Bangalore HQ boundary tolerances) with fallback safety coordinates when browser geolocations are rejected.
- **Unified Lifecycle Pipeline**: Promotes candidates through a recruitment board, automatically converts them to employee records with base salaries upon digital offer completion, and assigns them to departments.
- **Automated Ledgers & Payslips**: Generates payslip ledgers and handles leave balances based on role privileges.
- **Smart AI Operations Console**: Core AI services to parse policies, summarize uploaded meeting transcripts, and score uploaded PDF resumes against job profiles.
- **Strict RBAC Security Guards**: Enforces Role-Based Access Control across five profiles (*SuperAdmin, OrgAdmin, HR, Manager, Employee*), hiding restricted menus from view and silently redirecting unauthorized attempts back to safe dashboards.

---

## 🔑 Seeded Demo Accounts & Credentials

For evaluation and testing, the database automatically seeds role-specific accounts. You can log in as any of the roles below using the shared password: **`password`**

| Role Title | Access Selector Option | Seeded Work Email | Password |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Super Admin (Platform Operator) | `superadmin@workforce.com` | `password` |
| **Organization Admin** | Organization Admin (Tenant Operations) | `admin@workforce.com` | `password` |
| **HR Manager** | HR Manager (Employee Lifecycle) | `hr@workforce.com` | `password` |
| **Project Manager** | Manager (Team Approval & Sprints) | `manager@workforce.com` | `password` |
| **Standard Employee** | Employee (Staff Self-Service) | `employee@workforce.com` | `password` |

Each user profile is fully seeded with active payroll ledgers, leave requests, allocated hardware assets, goals, appraisals, and notifications history.

---

## Technology Stack

### Frontend
- **Framework & Runtime:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS, Lucide React
- **Routing:** React Router DOM (v6+)
- **State & Form Management:** React Context API, React Hook Form, Zod
- **Networking:** Axios

### Backend
- **Framework & Runtime:** Node.js, Express.js, TypeScript
- **Database & ODM:** MongoDB, Mongoose
- **Real-time Communication:** Socket.IO
- **Services & Integrations:** Cloudinary, Nodemailer

### Package Manager
- `npm`

---

## Folder Structure

```text
enterprise-workforce-platform/
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── config/           # Environment configurations
│   │   ├── controllers/      # Route controllers (domain-driven)
│   │   ├── database/         # ODM/Mongoose clients
│   │   ├── middleware/       # Custom Express middlewares
│   │   ├── models/           # Mongoose schemas & types
│   │   ├── routes/           # Router groups (domain-driven)
│   │   ├── services/         # Third-party/Shared business logic
│   │   ├── sockets/          # Socket.IO handlers
│   │   ├── utils/            # Shared backend helpers
│   │   ├── validators/       # Request validations (Zod/Mongoose)
│   │   ├── app.ts            # App initialization
│   │   └── server.ts         # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # React SPA
│   ├── public/
│   ├── src/
│   │   ├── assets/           # Media assets and global styles
│   │   ├── components/       # Global UI components (common, layout, tables, etc.)
│   │   ├── context/          # Global context providers (AuthContext, etc.)
│   │   ├── features/         # Feature modules (Google Stitch compatible)
│   │   │   └── [feature_name]/
│   │   │       ├── components/
│   │   │       ├── pages/
│   │   │       ├── hooks/
│   │   │       ├── services/
│   │   │       ├── types/
│   │   │       └── utils/
│   │   ├── hooks/            # Global custom hooks
│   │   ├── routes/           # Global router declarations
│   │   ├── services/         # Global API clients/Axios configurations
│   │   ├── utils/            # Global helpers and formatters
│   │   ├── App.tsx           # Root router outlet
│   │   └── main.tsx          # Virtual DOM mounting
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docs/                     # Project documentation
│   ├── api/                  # API endpoints specifications
│   ├── database/             # Schema diagrams and DB drafts
│   ├── meeting-notes/        # Team meetings log
│   └── screenshots/          # UI/UX mockups and screenshots
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or an Atlas connection URI

### Installation

1. Clone the repository and navigate into it:
   ```bash
   git clone <repository-url>
   cd enterprise-workforce-platform
   ```

2. Install dependencies for the backend:
   ```bash
   cd backend
   npm install
   ```

3. Install dependencies for the frontend:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Services

#### Run Backend (Dev Mode)
1. Copy the environment variables template and configure them:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. Start the Express server in development (hot reload) mode:
   ```bash
   npm run dev
   ```
   The backend will be available at `http://localhost:5000`.

#### Run Frontend (Dev Mode)
1. Copy the environment variables template:
   ```bash
   cd frontend
   cp .env.example .env
   ```
2. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

---

## Development & Collaboration Guidelines

To maintain speed, codebase cleanlines, and independence across the 4-developer team, adhere strictly to the guidelines below:

### 1. Git Branch Strategy
- **`main`**: Production-ready code only. Direct pushes are disabled.
- **`develop`**: Integration branch for features. Always create pull requests into `develop`.
- **Feature Branches**: Format as `feature/[developer-initials]-[short-desc]` (e.g., `feature/jd-auth-setup`).
- **Bugfix Branches**: Format as `bugfix/[developer-initials]-[bug-desc]`.

### 2. Commit Message Convention
We follow the **Conventional Commits** specification:
- `feat(auth): add login form validation`
- `fix(attendance): resolve timezone difference in check-in`
- `docs(api): update check-in endpoint response schema`
- `chore(deps): upgrade axios package`

### 3. Folder Ownership Rules
To prevent merge conflicts, developers should own features and work in isolated directories.
- **Feature-Based Ownership**: When implementing a feature (e.g. `leave`), code must reside in:
  - `frontend/src/features/leave/`
  - `backend/src/routes/leave/` and `backend/src/controllers/leave/`
- Avoid touching other feature directories unless explicitly coordinated.
- Share utilities must be placed in global folder levels (`frontend/src/utils/` or `backend/src/utils/`) and communicated to the team.

### 4. Code Reviews & PRs
- Every Pull Request requires at least **one approved review** before merging into `develop`.
- Ensure typescript compilation (`npm run build`) runs cleanly before submitting a PR.
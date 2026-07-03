# Repository Folder Structure Reference

This document explains the purpose and responsibilities of each directory and configuration file in the monorepo.

---

## 1. Project Root Directory

The root level manages high-level directory organization and repository policies:
- **`docs/`**: Platform documentation and developer onboarding blueprints.
- **`backend/`**: Express Node.js API server code.
- **`frontend/`**: React Vite web client code.
- **`README.md`**: Project setup instructions.
- **`.gitignore`**: Excludes system-specific cache files, credentials, and dependency outputs.

---

## 2. Documentation Directory (`docs/`)
Contains development specs and team templates:
- **`api/`**: Endpoint definitions and response models.
- **`database/`**: Mongoose model schemas, field validations, and entity diagrams.
- **`meeting-notes/`**: Team logs from planning and review sessions.
- **`screenshots/`**: UI screenshots and mockup assets.
- **`[doc_files].md`**: Operational guidelines (RBAC, workflows, coding rules, responsibilities).

---

## 3. Backend Directory (`backend/`)

Features a modular layout separating routes, logic, and schemas:

```text
backend/
├── src/
│   ├── config/           # Validated configuration inputs (env.ts via Zod)
│   ├── controllers/      # Domain controllers handling express logic
│   ├── database/         # Mongoose client initialization
│   ├── middleware/       # JWT parsing, access control checks, error captures
│   ├── models/           # Mongoose entity schemas (Employee, LeaveRequest)
│   ├── routes/           # Routing groups mapped to feature endpoints
│   ├── services/         # Integrations (Nodemailer, Cloudinary, Gemini)
│   ├── sockets/          # Socket.IO event handlers
│   ├── validators/       # Request validations using Zod
│   ├── utils/            # Shared helper functions
│   ├── constants/        # Immutable system variables (role arrays, status codes)
│   ├── types/            # Express request expansions and global TS declarations
│   ├── app.ts            # Configures cors, helmet, middlewares, base router
│   └── server.ts         # App listener start, connects DB, boots socket
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 4. Frontend Directory (`frontend/`)

Built around React 19 + TypeScript + Vite, using a **Feature-Based Architecture**:

```text
frontend/
├── public/               # Static assets (favicons, manifest files)
├── src/
│   ├── assets/           # Global styles and static media files
│   ├── components/       # Global UI elements
│   │   ├── common/       # General widgets (Loaders, Error boundaries)
│   │   ├── layout/       # Standard grids (Sidebar, Header, Main content wrapper)
│   │   ├── forms/        # Input components
│   │   ├── tables/       # Paginated grids
│   │   ├── charts/       # Canvas/SVG analytics charts
│   │   └── ui/           # Atomic UI (Buttons, Badges, Modals)
│   ├── context/          # Shared Context Providers (AuthContext, ThemeContext)
│   ├── features/         # Feature folders (Google Stitch ready)
│   │   └── [feature]/    # e.g., auth, leave, attendance
│   │       ├── components/ # Sub-components unique to the feature
│   │       ├── pages/    # Mapped route containers
│   │       ├── hooks/    # Custom hook hooks for state logic
│   │       ├── services/ # Axios API requests specific to feature
│   │       ├── types/    # Type interfaces specific to feature
│   │       └── utils/    # Helpers unique to feature
│   ├── hooks/            # Reusable hooks (useAuth, useDebounce)
│   ├── routes/           # Routing configuration maps
│   ├── services/         # Axios configuration interceptor (api.ts)
│   ├── utils/            # Helper formatters (helpers.ts)
│   ├── constants/        # System-wide variables (routes, theme configurations)
│   ├── types/            # Client interface specifications
│   ├── App.tsx           # Mounts Providers and Router
│   └── main.tsx          # Mounts DOM rendering engine
├── .env.example
├── package.json
├── tsconfig.json
└── vite.config.ts
```

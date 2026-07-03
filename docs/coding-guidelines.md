# Project Coding Guidelines & Development Standards

To maintain code readability, safety, and consistent structure, all four developers must follow the standards listed below.

---

## 1. Naming Conventions

### Folder Naming
- **Frontend & Backend features:** lowercase kebab-case (e.g. `attendance-tracker`, `helpdesk`).
- **Subdirectories:** lowercase singular or plural depending on purpose (`components`, `pages`, `hooks`, `services`).

### File Naming
- **React Components / Pages:** PascalCase (e.g. `LeaveRequestForm.tsx`, `DashboardLayout.tsx`).
- **React Hooks:** camelCase beginning with `use` (e.g. `useAuth.ts`, `useIntersectionObserver.ts`).
- **Backend controllers, routes, configurations, types:** camelCase (e.g. `authController.ts`, `apiRouter.ts`, `env.ts`).
- **Database Models:** Singular PascalCase (e.g. `Employee.ts`, `LeaveRequest.ts`).

---

## 2. Frontend React Conventions
- **Functional Components:** Always write functional components with TypeScript interface props declarations.
- **Hook Isolation:** Keep component UI rendering clean; extract state tracking and HTTP side effects into custom hooks inside the feature folder.
- **Tailwind styling:** Use vanilla utility classes. Avoid inline style mappings unless computing dynamic pixel parameters.
- **Google Stitch compatibility:** Component props must remain flexible and easy to extend so that Google Stitch generated UI layouts can be integrated easily.

---

## 3. Backend Express Conventions
- **Routing Isolation:** Group feature routes inside dedicated router files using Express Router. Do not write business logic directly inside route handlers; defer to Controller methods.
- **Asynchronous Wrappers:** Wrap asynchronous middleware operations in a helper wrapper or try-catch blocks to ensure exceptions propagate to the global error middleware:
  ```typescript
  export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  ```
- **Security Headers:** Enforce Helmet security headers and CORS configurations on all responses.

---

## 4. TypeScript Conventions
- **Strict Mode:** Keep `"strict": true` enabled.
- **Avoid `any`**: Always define complete Interfaces or Types for payloads, entities, and database responses. Use `unknown` with manual type guards when processing variable objects.
- **Type Imports:** Prefix structural imports using `import type` where applicable to optimize client build output.

---

## 5. API Response Format
All REST API payloads must return a consistent JSON schema:

### Success Response (2xx)
```json
{
  "status": "success",
  "message": "Resource created successfully", // Optional
  "data": {
    "id": "603d2e...",
    "field": "value"
  }
}
```

### Error Response (4xx, 5xx)
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Detailed validation message summary",
  "errors": {
    "email": "Invalid email address format"
  }
}
```

---

## 6. Validation & Error Handling
- **Request payload validation:** Pre-validate request body parameters using Zod schemas prior to controller entry.
- **Error Boundaries:** The backend must intercept standard MongoDB duplication errors or validation exceptions and map them to HTTP `400 Bad Request` before invoking `errorHandler`.

---

## 7. Git Collaboration & Conventional Commits
Commit messages must adhere to the **Conventional Commits** standard:
- **Feat:** `feat(payroll): add manual tax adjustment calculation`
- **Fix:** `fix(attendance): resolve timezone gap in check-in calculations`
- **Docs:** `docs(rbac): document manager role write permissions`
- **Style:** `style(components): align sidebar layout cards`
- **Refactor:** `refactor(auth): simplify JWT verification loop`

### Branch Naming Conventions
- `feature/[developer-initials]-[feature-name]` (e.g. `feature/jd-recruitment-interview`)
- `bugfix/[developer-initials]-[issue-desc]` (e.g. `bugfix/am-payslip-pdf-link`)

---

## 8. Pull Request Checklist
Before requesting reviews, the PR author must verify:
- [ ] Code builds without errors (`npm run build` passes locally for both frontend and backend).
- [ ] No strict typescript errors (`any` types avoided, correct models referenced).
- [ ] All new files follow the naming conventions.
- [ ] Sensitive keys (`.env` files) are not committed.
- [ ] A description of the changes and testing steps is documented in the PR details.
- [ ] The feature branch is rebased with the current `develop` branch.

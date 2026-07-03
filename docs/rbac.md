# Role-Based Access Control (RBAC) Matrix

This specification documents the permissions, route protections, and UI visibilities mapped to user roles inside the Enterprise Workforce Management Platform.

---

## 1. System Roles

1. **`SuperAdmin`**: Platform operator. Full read/write access across all corporate organizations.
2. **`OrgAdmin`**: Tenant administrator. Full control of the designated Organization, Departments, Designations, and Settings.
3. **`Manager`**: Departmental head or supervisor. Manages assigned employees, attendance validations, leaves approval, and projects.
4. **`Employee`**: Core staff member. Access is restricted to personal profile, attendance, leave requests, assets assigned, and support tickets.

---

## 2. Module Permissions Matrix

The following table summarizes CRUD (Create, Read, Update, Delete) permissions by role:

| Module | SuperAdmin | OrgAdmin | Manager | Employee |
| :--- | :--- | :--- | :--- | :--- |
| **Organization Settings** | CRUD | CRUD | R (View Only) | No Access |
| **Employee Directory** | CRUD | CRUD | R (View All) | R (View All) |
| **Employee Profiles** | CRUD | CRUD | RU (Direct Reports) | RU (Self Only) |
| **Recruitment** | CRUD | CRUD | CRUD | No Access |
| **Attendance Logs** | CRUD | CRUD | RU (Direct Reports) | RU (Self Only) |
| **Leave Management** | CRUD | CRUD | RU (Approve Reports)| RU (Self Request)|
| **Payroll Processing** | CRUD | CRUD | No Access | R (Self Payslips)|
| **Performance Review**| CRUD | CRUD | CRUD (Appraisals) | R (Self Goals) |
| **Project Board** | CRUD | CRUD | CRUD | RU (Assigned Tasks)|
| **Asset Management** | CRUD | CRUD | R (View Only) | R (Self Assigned)|
| **Help Desk** | CRUD | CRUD | RU (Resolve Tasks) | RU (Self Raised) |
| **Documents Storage** | CRUD | CRUD | RU (Shared Upload) | RU (Self Upload) |
| **Reports & Analytics**| R (All) | R (Org Only) | R (Dept Only) | No Access |
| **AI Assistant** | CRUD | CRUD | CRUD (Queries) | R (Self Queries) |

---

## 3. Route Protection Strategy

### Frontend Route Guards (React Router DOM)
- Route protection is managed via wrapper components:
  - **`PrivateRoute`**: Validates `isAuthenticated === true` using the `useAuth()` hook. Redirects unauthenticated users to `/login`.
  - **`RoleGuard`**: Accepts an array of `allowedRoles` (e.g. `['OrgAdmin', 'SuperAdmin']`). If the user's role does not match, routes redirect to `/unauthorized` or `/dashboard`.

```typescript
// Example usage:
// <Route path="/admin/payroll" element={<RoleGuard allowedRoles={['OrgAdmin', 'SuperAdmin']}><PayrollAdminPage /></RoleGuard>} />
```

### Backend Route Guards (Express Middleware)
- API endpoint authorization is enforced via custom middlewares:
  - **`authenticate`**: Verifies JWT access token validity.
  - **`authorize(roles)`**: Matches `req.user.role` against the endpoint's permitted roles. Throws `403 Forbidden` on mismatch.

```typescript
// Example usage:
// router.post('/calculate', authenticate, authorize(['OrgAdmin', 'SuperAdmin']), calculatePayrollController);
```

---

## 4. Frontend Element Visibility (Google Stitch UI Filter)
To ensure clean UI flows, elements are hidden using conditional rendering based on the user's role profile:

- **Sidebar Navigation Filter**:
  - The "Settings", "Asset Registry", and "Payroll Runs" navigation links check `['SuperAdmin', 'OrgAdmin'].includes(user.role)` before mounting.
  - The "Team Approvals" navigation link mounts only if `user.role` is `SuperAdmin`, `OrgAdmin`, or `Manager`.
- **Action Buttons Filter**:
  - "Add Employee", "Calculate Salary", and "Delete Department" control hooks check role qualifications before rendering buttons to prevent visual clutter and unauthorized interaction.
- **AI Tooling Filter**:
  - Chatbot options for resume analysis and cross-employee search are hidden from standard `Employee` views.

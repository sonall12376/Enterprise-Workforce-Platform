# Shared REST API Design Contract

This document outlines the REST API endpoints grouping by SRS modules. All request payloads and response bodies utilize standard JSON formats.

---

## 1. Authentication Module

### POST `/api/auth/login`
- **Purpose:** Authenticates users and issues JWT access/refresh tokens.
- **Auth Required:** No
- **Allowed Roles:** All users
- **Request Body:**
  ```json
  {
    "email": "employee@organization.com",
    "password": "SecurePassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "data": {
      "accessToken": "eyJhbGciOi...",
      "user": {
        "id": "603d2e1b12cf...",
        "email": "employee@organization.com",
        "name": "Jane Doe",
        "role": "OrgAdmin"
      }
    }
  }
  ```
- **Validation Rules:**
  - `email` must be a valid email format.
  - `password` must be string, minimum 8 characters.
- **Common Error Responses:**
  - `401 Unauthorized`: Invalid password or account suspended.
  - `400 Bad Request`: Validation failure.

---

## 2. Organization Module

### POST `/api/organization/departments`
- **Purpose:** Adds a new department to the tenant registry.
- **Auth Required:** Yes
- **Allowed Roles:** `SuperAdmin`, `OrgAdmin`
- **Request Body:**
  ```json
  {
    "name": "Human Resources",
    "code": "DEPT-HR"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "id": "603d3f1112...",
      "name": "Human Resources",
      "code": "DEPT-HR"
    }
  }
  ```
- **Validation Rules:**
  - `code` must be uppercase alphanumeric and unique in organization.

---

## 3. Employee Module

### GET `/api/employees`
- **Purpose:** Retrieves a paginated list of all active employees.
- **Auth Required:** Yes
- **Allowed Roles:** `SuperAdmin`, `OrgAdmin`, `Manager`
- **Request Body:** None (Query Parameters: `page=1`, `limit=10`, `deptId=XYZ`)
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "employees": [
        {
          "id": "603d2e1b12cf...",
          "employeeId": "EMP-0012",
          "name": "John Doe",
          "email": "john.doe@company.com",
          "role": "Employee"
        }
      ],
      "pagination": { "total": 120, "page": 1, "pages": 12 }
    }
  }
  ```

---

## 4. Recruitment Module

### POST `/api/recruitment/candidates`
- **Purpose:** Registers an applicant for screening.
- **Auth Required:** Yes
- **Allowed Roles:** `SuperAdmin`, `OrgAdmin`, `Manager`
- **Request Body:**
  ```json
  {
    "fullName": "Alice Smith",
    "email": "alice.smith@gmail.com",
    "phone": "+919876543210",
    "resumeUrl": "https://cloudinary.com/resumes/alice_smith.pdf"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": { "id": "603d511aa...", "fullName": "Alice Smith", "status": "Applied" }
  }
  ```

---

## 5. Attendance Module

### POST `/api/attendance/clock-in`
- **Purpose:** Logs daily clock-in timestamp.
- **Auth Required:** Yes
- **Allowed Roles:** `Manager`, `Employee`
- **Request Body:**
  ```json
  {
    "coordinates": { "latitude": 28.6139, "longitude": 77.2090 }
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Clock-in successful",
    "data": { "clockIn": "2026-07-03T19:25:00Z", "status": "Present" }
  }
  ```
- **Validation Rules:**
  - Coordinates verification matching geofence boundary limits.

---

## 6. Leave Module

### POST `/api/leaves/request`
- **Purpose:** Submits an employee request for time-off.
- **Auth Required:** Yes
- **Allowed Roles:** `Manager`, `Employee`
- **Request Body:**
  ```json
  {
    "leaveType": "Sick",
    "startDate": "2026-07-10",
    "endDate": "2026-07-12",
    "reason": "Medical surgery procedure"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": { "id": "603d65aa...", "leaveType": "Sick", "status": "Pending" }
  }
  ```
- **Validation Rules:**
  - `startDate` must be <= `endDate`.

---

## 7. Payroll Module

### POST `/api/payroll/calculate`
- **Purpose:** Calculates payroll deductions and net pay for the month.
- **Auth Required:** Yes
- **Allowed Roles:** `SuperAdmin`, `OrgAdmin`
- **Request Body:**
  ```json
  {
    "employeeId": "603d2e1b12cf...",
    "month": 7,
    "year": 2026
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "baseSalary": 5000,
      "allowances": 300,
      "deductions": 150,
      "netPay": 5150
    }
  }
  ```

---

## 8. Performance Module

### POST `/api/performance/goals`
- **Purpose:** Defines OKR target milestones for employees.
- **Auth Required:** Yes
- **Allowed Roles:** `OrgAdmin`, `Manager`
- **Request Body:**
  ```json
  {
    "employeeId": "603d2e1b12cf...",
    "title": "Deliver Core Routing Setup",
    "targetDate": "2026-09-30"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": { "id": "603d7c...", "title": "Deliver Core Routing Setup", "progress": 0 }
  }
  ```

---

## 9. Project Management Module

### POST `/api/projects`
- **Purpose:** Launches a new project tracking space.
- **Auth Required:** Yes
- **Allowed Roles:** `SuperAdmin`, `OrgAdmin`, `Manager`
- **Request Body:**
  ```json
  {
    "name": "WFM App Redesign",
    "startDate": "2026-08-01",
    "managerId": "603d2e1b12cf..."
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": { "id": "603d8d...", "name": "WFM App Redesign", "status": "Planning" }
  }
  ```

---

## 10. Asset Management Module

### POST `/api/assets/assign`
- **Purpose:** Allocates hardware/software asset to an employee.
- **Auth Required:** Yes
- **Allowed Roles:** `SuperAdmin`, `OrgAdmin`
- **Request Body:**
  ```json
  {
    "assetId": "603d9e...",
    "employeeId": "603d2e1b12cf..."
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Asset allocated successfully"
  }
  ```

---

## 11. Help Desk Module

### POST `/api/helpdesk/tickets`
- **Purpose:** Registers an IT/HR support ticket.
- **Auth Required:** Yes
- **Allowed Roles:** All users
- **Request Body:**
  ```json
  {
    "subject": "VPN connection failure",
    "description": "Fails during authentication step",
    "category": "IT",
    "priority": "High"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": { "ticketId": "603da1...", "status": "Open" }
  }
  ```

---

## 12. Document Management Module

### POST `/api/documents/upload`
- **Purpose:** Saves files to Cloudinary and registers document metadata.
- **Auth Required:** Yes
- **Allowed Roles:** All users
- **Request Body:** (Multipart/Form-Data)
  - `file`: (Binary PDF/PNG)
  - `category`: "Contract"
- **Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": { "id": "603db2...", "fileName": "contract_jd.pdf", "fileUrl": "https://res.cloudinary.com/..." }
  }
  ```

---

## 13. Notifications Module

### GET `/api/notifications`
- **Purpose:** Fetches unread notifications for the logged-in user.
- **Auth Required:** Yes
- **Allowed Roles:** All users
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      { "id": "603dc3...", "title": "Leave Approved", "message": "Your Sick leave was approved.", "isRead": false }
    ]
  }
  ```

---

## 14. Reports & Analytics Module

### GET `/api/reports/dashboard`
- **Purpose:** Compiles global metric insights.
- **Auth Required:** Yes
- **Allowed Roles:** `SuperAdmin`, `OrgAdmin`
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "employeeCount": 240,
      "pendingLeaves": 14,
      "openTickets": 3,
      "allocatedAssets": 182
    }
  }
  ```

---

## 15. AI Operations Assistant Module

### POST `/api/ai/chat`
- **Purpose:** Answers user queries using policy knowledge and platform metrics.
- **Auth Required:** Yes
- **Allowed Roles:** All users
- **Request Body:**
  ```json
  {
    "query": "How many casual leaves do I have remaining?"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "reply": "According to the database logs, you have 6 casual leaves left for the year 2026."
    }
  }
  ```

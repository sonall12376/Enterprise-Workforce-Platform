# Database Design Specification: Enterprise Workforce Management

This database design utilizes a MongoDB structure mapped via Mongoose. Relations are implemented using Reference Identifiers (`mongoose.Schema.Types.ObjectId`).

---

## Group 1: Core Organization Structure

### 1. Organization
- **Purpose:** Represents the core company/tenant configuration.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:** None
- **Important Fields:**
  - `name` (String, Required): Company registered name.
  - `domain` (String, Required, Unique): Domain name for single sign-on or login routing.
  - `logoUrl` (String): CDN path for branding logo.
  - `address` (String): Head office details.
- **Relationships:** One-to-Many with Departments, Locations, Holidays, and Employees.
- **Validation:** `domain` must pass domain-format regex; `name` length between 2-100 characters.

### 2. Department
- **Purpose:** Represents administrative divisions within the organization.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:** 
  - `orgId` -> Organization (`_id`)
  - `managerId` -> Employee (`_id`, Optional)
- **Important Fields:**
  - `name` (String, Required): Department name (e.g., Engineering).
  - `code` (String, Required): Unique identification code (e.g., DEPT-ENG).
- **Relationships:** Many-to-One with Organization; One-to-Many with Designations and Employees.
- **Validation:** `code` must be alphanumeric uppercase; `name` must be unique within the same Organization.

### 3. Designation
- **Purpose:** Job titles and official roles within a department.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `orgId` -> Organization (`_id`)
  - `deptId` -> Department (`_id`)
- **Important Fields:**
  - `title` (String, Required): Job title (e.g., Senior Software Engineer).
  - `grade` (String, Optional): Pay grade scale or hierarchy level.
- **Relationships:** Many-to-One with Department and Organization.
- **Validation:** `title` must be non-empty; unique within the Department scope.

### 4. OfficeLocation
- **Purpose:** Physical office branches of the organization.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `orgId` -> Organization (`_id`)
- **Important Fields:**
  - `name` (String, Required): Branch name (e.g., Delhi HQ).
  - `timezone` (String, Required): Standard IANA timezone descriptor (e.g., Asia/Kolkata).
  - `coordinates` (Object): Geo-coordinates `{ latitude: Number, longitude: Number }` for clock-in verification.
  - `geofenceRadius` (Number): Geofencing boundary in meters.
- **Relationships:** Many-to-One with Organization.
- **Validation:** Latitude between -90 and 90, Longitude between -180 and 180. Radius must be greater than 0.

### 5. Holiday
- **Purpose:** List of corporate holidays per organization or region.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `orgId` -> Organization (`_id`)
- **Important Fields:**
  - `name` (String, Required): Holiday description (e.g., Independence Day).
  - `date` (Date, Required): Date of holiday.
  - `isOptional` (Boolean, Default: false): Indicates restricted holiday.
- **Relationships:** Many-to-One with Organization.
- **Validation:** Date cannot be in the past at creation time; unique combinations of `date` and `orgId`.

### 6. WorkShift
- **Purpose:** Manages work timings and shifts for employees.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `orgId` -> Organization (`_id`)
- **Important Fields:**
  - `name` (String, Required): Shift label (e.g., Night Shift).
  - `startTime` (String, Required): Time format "HH:MM".
  - `endTime` (String, Required): Time format "HH:MM".
  - `gracePeriodMins` (Number, Default: 15): Grace minutes allowed for late clock-ins.
- **Relationships:** Many-to-One with Organization.
- **Validation:** `startTime` and `endTime` must match regular expression `^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$`.

---

## Group 2: User Access, Audits, & Core Profiles

### 7. Employee
- **Purpose:** Central entity for all system users and employees.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `orgId` -> Organization (`_id`)
  - `deptId` -> Department (`_id`)
  - `designationId` -> Designation (`_id`)
  - `locationId` -> OfficeLocation (`_id`)
  - `shiftId` -> WorkShift (`_id`)
  - `reportingManagerId` -> Employee (`_id`, self-referencing)
- **Important Fields:**
  - `employeeId` (String, Required, Unique): Corporate registration number (e.g., EMP-10243).
  - `email` (String, Required, Unique): Workspace email.
  - `passwordHash` (String, Required): Encrypted password digest.
  - `role` (String, Required): User permissions level (`SuperAdmin`, `OrgAdmin`, `Manager`, `Employee`).
  - `status` (String, Default: 'Active'): Active, Onboarding, Suspended, Terminated.
- **Relationships:** Many-to-One with Dept, Designation, Location, Shift, and Manager. One-to-Many with Attendance, Payroll, Assets, and Tasks.
- **Validation:** Email validation regex; password length minimum 8 characters; employeeId format check.

### 8. RefreshToken
- **Purpose:** Manages active sessions and token refreshing.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `employeeId` -> Employee (`_id`)
- **Important Fields:**
  - `token` (String, Required, Unique): Secure generated hash.
  - `expiresAt` (Date, Required): Expiration timestamp.
  - `revoked` (Boolean, Default: false): Indicates if the token was manually invalidated.
- **Relationships:** Many-to-One with Employee.
- **Validation:** Must check `expiresAt` and `revoked` flag prior to token renewal.

### 9. LoginHistory
- **Purpose:** Access auditing for employee accounts.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `employeeId` -> Employee (`_id`)
- **Important Fields:**
  - `timestamp` (Date, Default: Date.now): Login timestamp.
  - `ipAddress` (String): IP address of connection.
  - `userAgent` (String): Client browser specifications.
  - `status` (String): `Success` or `Failed`.
- **Relationships:** Many-to-One with Employee.
- **Validation:** IP address format checks.

### 10. AuditLog
- **Purpose:** Tracks write/update logs across all system resources.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `performedById` -> Employee (`_id`)
- **Important Fields:**
  - `timestamp` (Date, Default: Date.now): Action timestamp.
  - `action` (String, Required): Action type (e.g., `PAYROLL_APPROVED`, `LEAVE_GRANTED`).
  - `targetCollection` (String, Required): Model type modified (e.g., `Payroll`).
  - `targetRecordId` (ObjectId, Required): Reference ID of target object.
  - `previousState` (Object): JSON snapshot before modification.
  - `newState` (Object): JSON snapshot after modification.
- **Relationships:** Many-to-One with Employee.
- **Validation:** Read-only schema.

### 11. Notification
- **Purpose:** In-app notification queue.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `recipientId` -> Employee (`_id`)
- **Important Fields:**
  - `title` (String, Required): Heading.
  - `message` (String, Required): Notification body.
  - `type` (String, Required): Classification (e.g., `ATTENDANCE`, `LEAVE`, `TICKET`, `TASK`).
  - `isRead` (Boolean, Default: false): Read status flag.
  - `createdAt` (Date, Default: Date.now)
- **Relationships:** Many-to-One with Employee.
- **Validation:** `recipientId` and `type` must be present.

---

## Group 3: Recruitment Lifecycle

### 12. Candidate
- **Purpose:** Tracks applicant metrics and resumes.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `orgId` -> Organization (`_id`)
- **Important Fields:**
  - `fullName` (String, Required): Candidate name.
  - `email` (String, Required): Personal email.
  - `phone` (String): Phone number.
  - `resumeUrl` (String, Required): Cloudinary URL of PDF resume.
  - `status` (String, Default: 'Applied'): Applied, Screening, Interviewing, Offered, Rejected, Hired.
- **Relationships:** Many-to-One with Organization; One-to-Many with Interviews and Feedback.
- **Validation:** Candidate email unique within the same job opening scope.

### 13. Interview
- **Purpose:** Logs interview event sessions.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `candidateId` -> Candidate (`_id`)
  - `interviewerId` -> Employee (`_id`)
- **Important Fields:**
  - `roundName` (String, Required): e.g., Technical Round 1.
  - `scheduledTime` (Date, Required): Date and time of session.
  - `durationMins` (Number, Default: 60): Scheduled minutes.
  - `status` (String, Default: 'Scheduled'): Scheduled, Completed, Cancelled, Rescheduled.
- **Relationships:** Many-to-One with Candidate and Employee; One-to-Many with InterviewFeedback.
- **Validation:** Interviewer cannot have overlapping interviews at the same time.

### 14. InterviewFeedback
- **Purpose:** Logs interviewer feedback evaluation scores.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `interviewId` -> Interview (`_id`)
  - `interviewerId` -> Employee (`_id`)
- **Important Fields:**
  - `rating` (Number, Required): Score range from 1 to 5.
  - `comments` (String, Required): Detailed feedback notes.
  - `recommendation` (String, Required): `Hire`, `Hold`, `Reject`.
- **Relationships:** Many-to-One with Interview and Employee.
- **Validation:** Rating must be an integer between 1 and 5.

### 15. OfferLetter
- **Purpose:** Tracks offer validation workflow before hiring.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `candidateId` -> Candidate (`_id`)
  - `approvedById` -> Employee (`_id`)
- **Important Fields:**
  - `offeredSalary` (Number, Required): Annual base salary package.
  - `joiningDate` (Date, Required): Expected joining date.
  - `status` (String, Default: 'Draft'): Draft, PendingApproval, Approved, Sent, Accepted, Declined.
  - `cloudinaryPdfUrl` (String): Cloudinary file path for generated document.
- **Relationships:** Many-to-One with Candidate and Employee.
- **Validation:** `offeredSalary` must be a positive number.

---

## Group 4: Time and Attendance

### 16. Attendance
- **Purpose:** Daily work session registry.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `employeeId` -> Employee (`_id`)
- **Important Fields:**
  - `date` (Date, Required): Work date.
  - `clockIn` (Date, Required): Sign-in timestamp.
  - `clockOut` (Date): Sign-out timestamp.
  - `status` (String, Required): `Present`, `Late`, `HalfDay`, `Absent`.
  - `workMinutes` (Number): Calculated work duration.
- **Relationships:** Many-to-One with Employee.
- **Validation:** `clockOut` timestamp must be after `clockIn` timestamp. Daily entry must be unique per `employeeId` + `date`.

### 17. AttendanceCorrection
- **Purpose:** Requests to adjust faulty attendance records.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `attendanceId` -> Attendance (`_id`)
  - `requestedById` -> Employee (`_id`)
  - `approvedById` -> Employee (`_id`, Optional)
- **Important Fields:**
  - `requestedClockIn` (Date): New check-in time requested.
  - `requestedClockOut` (Date): New check-out time requested.
  - `reason` (String, Required): Detailed justification.
  - `status` (String, Default: 'Pending'): Pending, Approved, Rejected.
- **Relationships:** Many-to-One with Attendance and Employees.
- **Validation:** Reason cannot be empty. Request must be approved by designated reporting manager.

### 18. LeaveRequest
- **Purpose:** Formal vacation/sick time off request submissions.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `employeeId` -> Employee (`_id`)
  - `approvedById` -> Employee (`_id`, Optional)
- **Important Fields:**
  - `leaveType` (String, Required): `Casual`, `Sick`, `Earned`, `Unpaid`.
  - `startDate` (Date, Required): Vacation start date.
  - `endDate` (Date, Required): Vacation end date.
  - `reason` (String, Required): Request reason.
  - `status` (String, Default: 'Pending'): Pending, Approved, Rejected.
- **Relationships:** Many-to-One with Employee.
- **Validation:** `endDate` must be on or after `startDate`. Ensure employee has sufficient balance in `LeaveBalance` before status is marked as `Approved`.

### 19. LeaveBalance
- **Purpose:** Tracks available vacation allowances per calendar year.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `employeeId` -> Employee (`_id`)
- **Important Fields:**
  - `year` (Number, Required): Target year (e.g., 2026).
  - `leaveType` (String, Required): `Casual`, `Sick`, `Earned`.
  - `allocated` (Number, Required): Max allowance.
  - `used` (Number, Default: 0): Deductions.
  - `pending` (Number, Default: 0): Locked days.
- **Relationships:** Many-to-One with Employee.
- **Validation:** `used` must never exceed `allocated` + earned exceptions.

---

## Group 5: Talent Performance & Finance

### 20. Payroll
- **Purpose:** Details monthly payroll calculations.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `employeeId` -> Employee (`_id`)
  - `approvedById` -> Employee (`_id`, Optional)
- **Important Fields:**
  - `month` (Number, Required): 1 to 12.
  - `year` (Number, Required): Calendar year.
  - `baseSalary` (Number, Required): Contractual base rate.
  - `allowances` (Number, Default: 0): Additions.
  - `deductions` (Number, Default: 0): Unpaid leaves, taxes, insurance deductions.
  - `netPay` (Number, Required): Total paid (`baseSalary` + `allowances` - `deductions`).
  - `status` (String, Default: 'Draft'): Draft, PendingApproval, Approved, Paid.
- **Relationships:** Many-to-One with Employee.
- **Validation:** Net pay must equal calculated balance variables. Double entries for the same month/year per employee are rejected.

### 21. PerformanceReview
- **Purpose:** Annual or quarterly appraisal scores.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `employeeId` -> Employee (`_id`)
  - `reviewerId` -> Employee (`_id`)
- **Important Fields:**
  - `reviewPeriod` (String, Required): e.g., "Q1-2026".
  - `rating` (Number, Required): Overall rating score (1 to 5).
  - `feedback` (String, Required): Narrative notes.
  - `status` (String, Default: 'Draft'): Draft, Submitted, Acknowledged.
- **Relationships:** Many-to-One with Employee.
- **Validation:** Rating between 1.0 and 5.0.

### 22. Goal
- **Purpose:** Target milestones and OKRs.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `employeeId` -> Employee (`_id`)
- **Important Fields:**
  - `title` (String, Required): Target goal.
  - `targetDate` (Date, Required): Deadline.
  - `progress` (Number, Default: 0): Progress range from 0 to 100.
  - `status` (String, Default: 'NotStarted'): NotStarted, InProgress, Achieved, Deferred.
- **Relationships:** Many-to-One with Employee.
- **Validation:** Progress must be between 0 and 100.

---

## Group 6: Work Collaboration

### 23. Project
- **Purpose:** High-level project assignments.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `orgId` -> Organization (`_id`)
  - `managerId` -> Employee (`_id`)
- **Important Fields:**
  - `name` (String, Required): Project title.
  - `startDate` (Date, Required): Project launch date.
  - `endDate` (Date): Completion target.
  - `status` (String, Default: 'Planning'): Planning, Active, Completed, OnHold.
- **Relationships:** Many-to-One with Organization and Employee; One-to-Many with Tasks.
- **Validation:** Project code must match organization namespace syntax.

### 24. Task
- **Purpose:** Specific tasks within projects.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `projectId` -> Project (`_id`)
  - `assignedToId` -> Employee (`_id`)
- **Important Fields:**
  - `title` (String, Required): Task title.
  - `description` (String): Task description.
  - `priority` (String, Required): `Low`, `Medium`, `High`, `Critical`.
  - `status` (String, Default: 'Todo'): Todo, InProgress, Review, Done.
  - `dueDate` (Date): Task deadline.
- **Relationships:** Many-to-One with Project and Employee.
- **Validation:** Task deadline cannot exceed parent project's `endDate`.

### 25. Document
- **Purpose:** Encrypted document store metadata.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `uploadedById` -> Employee (`_id`)
  - `orgId` -> Organization (`_id`)
- **Important Fields:**
  - `fileName` (String, Required): Document name.
  - `fileUrl` (String, Required): Secure file link (Cloudinary).
  - `category` (String, Required): `Policy`, `Contract`, `IDProof`, `Resume`.
  - `isPublic` (Boolean, Default: false): Visible to all organization employees.
- **Relationships:** Many-to-One with Employee and Organization.
- **Validation:** File size max limit enforced at controller layer.

---

## Group 7: Resources & Support

### 26. Asset
- **Purpose:** Stores hardware inventory metadata.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `orgId` -> Organization (`_id`)
- **Important Fields:**
  - `name` (String, Required): Asset name (e.g., MacBook Pro).
  - `serialNumber` (String, Required, Unique): Asset barcode/serial.
  - `type` (String, Required): `Hardware`, `Software`, `Furniture`.
  - `status` (String, Default: 'Available'): Available, Assigned, Maintenance, Retired.
- **Relationships:** Many-to-One with Organization; One-to-Many with AssetAssignments.
- **Validation:** Serial number must be unique across the platform.

### 27. AssetAssignment
- **Purpose:** Tracks asset allocations.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `assetId` -> Asset (`_id`)
  - `employeeId` -> Employee (`_id`)
  - `allocatedById` -> Employee (`_id`)
- **Important Fields:**
  - `assignedDate` (Date, Required): Date of allocation.
  - `returnedDate` (Date): Date of return.
  - `status` (String, Default: 'Active'): Active, Returned, Damaged.
- **Relationships:** Many-to-One with Asset and Employees.
- **Validation:** Cannot allocate an Asset whose status is not `Available`.

### 28. HelpDeskTicket
- **Purpose:** IT/HR service support ticketing.
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:**
  - `raisedById` -> Employee (`_id`)
  - `assignedToId` -> Employee (`_id`, Optional)
- **Important Fields:**
  - `subject` (String, Required): Brief issue summary.
  - `description` (String, Required): Detailed explanation.
  - `category` (String, Required): `IT`, `HR`, `Facilities`, `Finance`.
  - `priority` (String, Required): `Low`, `Medium`, `High`, `Urgent`.
  - `status` (String, Default: 'Open'): Open, Assigned, InProgress, Resolved, Closed.
- **Relationships:** Many-to-One with Employees.
- **Validation:** Subject title must not exceed 150 characters.

export interface AttendanceRecord {
  _id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: 'Present' | 'Late' | 'HalfDay' | 'Absent';
  workMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CorrectionRequest {
  _id: string;
  attendanceId: string;
  requestedById: string;
  approvedById?: string;
  requestedClockIn: string;
  requestedClockOut: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

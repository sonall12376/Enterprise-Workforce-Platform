export interface GoalRecord {
  _id: string;
  employeeId: string | { _id: string; email: string; employeeId: string; name?: string };
  title: string;
  targetDate: string;
  progress: number;
  status: 'NotStarted' | 'InProgress' | 'Achieved' | 'Deferred';
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReviewRecord {
  _id: string;
  employeeId: string | { _id: string; email: string; employeeId: string; name?: string };
  reviewerId: string | { _id: string; email: string; employeeId: string; name?: string };
  reviewPeriod: string;
  rating: number;
  feedback: string;
  status: 'Draft' | 'Submitted' | 'Acknowledged';
  createdAt: string;
  updatedAt: string;
}

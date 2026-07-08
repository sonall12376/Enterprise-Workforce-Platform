export interface ProjectStats {
  total: number;
  statusCounts: {
    Planning: number;
    Active: number;
    Completed: number;
    OnHold: number;
  };
}

export interface TaskStats {
  total: number;
  statusCounts: {
    Todo: number;
    InProgress: number;
    Review: number;
    Completed: number;
  };
  priorityCounts: {
    Low: number;
    Medium: number;
    High: number;
    Urgent: number;
  };
}

export interface AssetStats {
  total: number;
  statusCounts: {
    Available: number;
    Assigned: number;
    Maintenance: number;
    Retired: number;
  };
  typeCounts: {
    Hardware: number;
    Software: number;
    Furniture: number;
  };
}

export interface TicketStats {
  total: number;
  statusCounts: {
    Open: number;
    Assigned: number;
    InProgress: number;
    Resolved: number;
    Closed: number;
  };
  categoryCounts: {
    IT: number;
    HR: number;
    Facilities: number;
    Finance: number;
  };
}

export interface DashboardSummary {
  employeeCount: number;
  pendingLeaves: number;
  openTickets: number;
  allocatedAssets: number;
  projectCount: number;
  taskCount: number;
}

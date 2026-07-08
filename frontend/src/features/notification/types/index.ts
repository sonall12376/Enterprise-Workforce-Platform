export interface NotificationRecord {
  _id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'PERFORMANCE' | 'TICKET' | 'TASK';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

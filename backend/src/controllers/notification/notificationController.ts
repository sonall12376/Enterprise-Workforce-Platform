import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Notification from '../../models/Notification';
import { AuthenticatedRequest } from '../../middleware/auth';
import { notificationQuerySchema } from '../../validators/notification';
import { sendNotificationEmail } from '../../services/emailService';

// Helper to resolve external Employee model dynamically
const getEmployeeModel = () => {
  return mongoose.models.Employee || mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
};

// Global helper to create in-app notification + email alert
export const createSystemNotification = async (
  recipientId: string | mongoose.Types.ObjectId,
  title: string,
  message: string,
  type: 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'PERFORMANCE' | 'TICKET' | 'TASK'
) => {
  try {
    const notification = new Notification({
      recipientId: new mongoose.Types.ObjectId(recipientId),
      title,
      message,
      type,
      isRead: false,
    });
    await notification.save();

    // Query employee email to send mail
    const Employee = getEmployeeModel();
    const employee = await Employee.findById(recipientId);
    if (employee && employee.email) {
      // Send email alert in background
      sendNotificationEmail(employee.email, title, message).catch((err) => {
        console.error(`Error sending email to ${employee.email}:`, err);
      });
    }
  } catch (err) {
    console.error('Error creating system notification:', err);
  }
};

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', statusCode: 401, message: 'Unauthorized' });
      return;
    }

    // Validate query
    const validationResult = notificationQuerySchema.safeParse(req.query);
    const fetchAll = validationResult.success ? validationResult.data.all : false;

    const query: any = { recipientId: userId };
    if (!fetchAll) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', statusCode: 401, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      res.status(404).json({ status: 'error', statusCode: 404, message: 'Notification not found.' });
      return;
    }

    if (String(notification.recipientId) !== userId) {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Forbidden: You cannot modify this notification.',
      });
      return;
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read successfully',
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'error', statusCode: 401, message: 'Unauthorized' });
      return;
    }

    await Notification.updateMany({ recipientId: userId, isRead: false }, { $set: { isRead: true } });

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read successfully',
    });
  } catch (err) {
    next(err);
  }
};

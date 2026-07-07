import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Goal from '../../models/Goal';
import PerformanceReview from '../../models/PerformanceReview';
import { AuthenticatedRequest } from '../../middleware/auth';
import { goalCreateSchema, goalUpdateSchema, reviewCreateSchema } from '../../validators/performance';

// Helper to resolve external Employee model dynamically
const getEmployeeModel = () => {
  return mongoose.models.Employee || mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
};

export const createGoal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ status: 'error', statusCode: 401, message: 'Unauthorized' });
      return;
    }

    if (role !== 'SuperAdmin' && role !== 'OrgAdmin' && role !== 'Manager') {
      res.status(403).json({ status: 'error', statusCode: 403, message: 'Forbidden: Admin or Manager role required.' });
      return;
    }

    // Validate request body
    const validationResult = goalCreateSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { employeeId, title, targetDate } = validationResult.data;

    // Check manager reporting structure if current user is Manager
    if (role === 'Manager') {
      const Employee = getEmployeeModel();
      const employee = await Employee.findById(employeeId);
      if (!employee || String(employee.reportingManagerId) !== userId) {
        res.status(403).json({
          status: 'error',
          statusCode: 403,
          message: 'Forbidden: You can only define goals for your direct reports.',
        });
        return;
      }
    }

    const goal = new Goal({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      title,
      targetDate: new Date(targetDate),
      progress: 0,
      status: 'NotStarted',
    });
    await goal.save();

    res.status(201).json({
      status: 'success',
      message: 'Goal defined successfully',
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

export const getGoals = async (
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

    const role = req.user?.role;
    let targetEmployeeId = req.query.employeeId as string;
    const query: any = {};

    if (role === 'Employee') {
      query.employeeId = userId;
    } else if (role === 'Manager') {
      if (targetEmployeeId && targetEmployeeId !== userId) {
        // Verify reporting manager
        const Employee = getEmployeeModel();
        const targetEmp = await Employee.findById(targetEmployeeId);
        if (!targetEmp || String(targetEmp.reportingManagerId) !== userId) {
          res.status(403).json({
            status: 'error',
            statusCode: 403,
            message: 'Forbidden: You can only view goals for yourself or direct reports.',
          });
          return;
        }
        query.employeeId = targetEmployeeId;
      } else if (!targetEmployeeId) {
        const Employee = getEmployeeModel();
        const directReports = await Employee.find({ reportingManagerId: userId }).select('_id');
        const reportIds = directReports.map((d) => d._id);
        query.employeeId = { $in: [...reportIds, new mongoose.Types.ObjectId(userId)] };
      } else {
        query.employeeId = userId;
      }
    } else {
      if (targetEmployeeId) {
        query.employeeId = targetEmployeeId;
      }
    }

    const goals = await Goal.find(query)
      .populate({ path: 'employeeId', model: getEmployeeModel() })
      .sort({ targetDate: 1 });

    res.status(200).json({
      status: 'success',
      data: goals,
    });
  } catch (err) {
    next(err);
  }
};

export const updateGoal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ status: 'error', statusCode: 401, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    // Validate request body
    const validationResult = goalUpdateSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const goal = await Goal.findById(id);
    if (!goal) {
      res.status(404).json({ status: 'error', statusCode: 404, message: 'Goal record not found.' });
      return;
    }

    // Role checks
    if (String(goal.employeeId) !== userId) {
      if (role === 'Manager') {
        const Employee = getEmployeeModel();
        const requester = await Employee.findById(goal.employeeId);
        if (!requester || String(requester.reportingManagerId) !== userId) {
          res.status(403).json({
            status: 'error',
            statusCode: 403,
            message: 'Forbidden: You can only update goals for yourself or direct reports.',
          });
          return;
        }
      } else if (role !== 'SuperAdmin' && role !== 'OrgAdmin') {
        res.status(403).json({
          status: 'error',
          statusCode: 403,
          message: 'Forbidden: You cannot modify this goal.',
        });
        return;
      }
    }

    // Apply updates
    const { progress, status } = validationResult.data;
    if (progress !== undefined) {
      goal.progress = progress;
      if (progress === 100) {
        goal.status = 'Achieved';
      } else if (progress > 0 && goal.status === 'NotStarted') {
        goal.status = 'InProgress';
      }
    }
    if (status !== undefined) {
      goal.status = status;
      if (status === 'Achieved') {
        goal.progress = 100;
      }
    }

    await goal.save();

    res.status(200).json({
      status: 'success',
      message: 'Goal updated successfully',
      data: goal,
    });
  } catch (err) {
    next(err);
  }
};

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) {
      res.status(401).json({ status: 'error', statusCode: 401, message: 'Unauthorized' });
      return;
    }

    if (role !== 'SuperAdmin' && role !== 'OrgAdmin' && role !== 'Manager') {
      res.status(403).json({ status: 'error', statusCode: 403, message: 'Forbidden: Admin or Manager role required.' });
      return;
    }

    // Validate request body
    const validationResult = reviewCreateSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { employeeId, reviewPeriod, rating, feedback } = validationResult.data;

    // Check manager reporting structure if current user is Manager
    if (role === 'Manager') {
      const Employee = getEmployeeModel();
      const employee = await Employee.findById(employeeId);
      if (!employee || String(employee.reportingManagerId) !== userId) {
        res.status(403).json({
          status: 'error',
          statusCode: 403,
          message: 'Forbidden: You can only evaluate performance reviews for your direct reports.',
        });
        return;
      }
    }

    const review = new PerformanceReview({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      reviewerId: new mongoose.Types.ObjectId(userId),
      reviewPeriod,
      rating,
      feedback,
      status: 'Submitted',
    });
    await review.save();

    res.status(201).json({
      status: 'success',
      message: 'Performance review submitted successfully',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

export const getReviews = async (
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

    const role = req.user?.role;
    let targetEmployeeId = req.query.employeeId as string;
    const query: any = {};

    if (role === 'Employee') {
      query.employeeId = userId;
    } else if (role === 'Manager') {
      if (targetEmployeeId && targetEmployeeId !== userId) {
        // Verify reporting manager
        const Employee = getEmployeeModel();
        const targetEmp = await Employee.findById(targetEmployeeId);
        if (!targetEmp || String(targetEmp.reportingManagerId) !== userId) {
          res.status(403).json({
            status: 'error',
            statusCode: 403,
            message: 'Forbidden: You can only view appraisals for yourself or direct reports.',
          });
          return;
        }
        query.employeeId = targetEmployeeId;
      } else if (!targetEmployeeId) {
        const Employee = getEmployeeModel();
        const directReports = await Employee.find({ reportingManagerId: userId }).select('_id');
        const reportIds = directReports.map((d) => d._id);
        query.$or = [
          { employeeId: userId },
          { employeeId: { $in: reportIds } },
          { reviewerId: userId },
        ];
      } else {
        query.employeeId = userId;
      }
    } else {
      if (targetEmployeeId) {
        query.employeeId = targetEmployeeId;
      }
    }

    const reviews = await PerformanceReview.find(query)
      .populate({ path: 'employeeId', model: getEmployeeModel() })
      .populate({ path: 'reviewerId', model: getEmployeeModel() })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: reviews,
    });
  } catch (err) {
    next(err);
  }
};

export const acknowledgeReview = async (
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

    const review = await PerformanceReview.findById(id);
    if (!review) {
      res.status(404).json({ status: 'error', statusCode: 404, message: 'Performance review not found.' });
      return;
    }

    if (String(review.employeeId) !== userId) {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Forbidden: You can only acknowledge appraisals issued to you.',
      });
      return;
    }

    review.status = 'Acknowledged';
    await review.save();

    res.status(200).json({
      status: 'success',
      message: 'Appraisal review acknowledged successfully',
      data: review,
    });
  } catch (err) {
    next(err);
  }
};

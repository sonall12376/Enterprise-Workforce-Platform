import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import LeaveRequest from '../../models/LeaveRequest';
import LeaveBalance from '../../models/LeaveBalance';
import { AuthenticatedRequest } from '../../middleware/auth';
import { leaveRequestSchema, processLeaveSchema } from '../../validators/leave';

// Helper to resolve external Employee model dynamically
const getEmployeeModel = () => {
  return mongoose.models.Employee || mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
};

export const submitLeave = async (
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

    // Validate request body
    const validationResult = leaveRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { leaveType, startDate, endDate, reason } = validationResult.data;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate inclusive leave duration in days
    const durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

    // Check balance for paid leaves
    if (leaveType !== 'Unpaid') {
      const year = start.getFullYear();
      let balance = await LeaveBalance.findOne({ employeeId: userId, year, leaveType });

      if (!balance) {
        // Initialize default balance if none exists
        let allocated = 15; // default casual
        if (leaveType === 'Sick') allocated = 10;
        else if (leaveType === 'Earned') allocated = 12;

        balance = new LeaveBalance({
          employeeId: new mongoose.Types.ObjectId(userId),
          year,
          leaveType,
          allocated,
          used: 0,
          pending: 0,
        });
        await balance.save();
      }

      const availableBalance = balance.allocated - balance.used - balance.pending;
      if (availableBalance < durationDays) {
        res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: `Insufficient leave balance. Requested: ${durationDays} days, Available: ${availableBalance} days.`,
        });
        return;
      }

      // Increment pending days
      balance.pending += durationDays;
      await balance.save();
    }

    // Create Leave Request
    const request = new LeaveRequest({
      employeeId: new mongoose.Types.ObjectId(userId),
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      status: 'Pending',
    });
    await request.save();

    res.status(201).json({
      status: 'success',
      message: 'Leave request submitted successfully',
      data: {
        id: request._id,
        leaveType: request.leaveType,
        status: request.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getRequests = async (
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
        // Verify target employee reports to manager
        const Employee = getEmployeeModel();
        const targetEmp = await Employee.findById(targetEmployeeId);
        if (!targetEmp || String(targetEmp.reportingManagerId) !== userId) {
          res.status(403).json({
            status: 'error',
            statusCode: 403,
            message: 'Forbidden: You can only view requests for yourself or your direct reports.',
          });
          return;
        }
        query.employeeId = targetEmployeeId;
      } else if (!targetEmployeeId) {
        // Fetch manager's own and direct reports' requests
        const Employee = getEmployeeModel();
        const directReports = await Employee.find({ reportingManagerId: userId }).select('_id');
        const reportIds = directReports.map((d) => d._id);
        query.employeeId = { $in: [...reportIds, new mongoose.Types.ObjectId(userId)] };
      } else {
        query.employeeId = userId;
      }
    } else {
      // SuperAdmin or OrgAdmin
      if (targetEmployeeId) {
        query.employeeId = targetEmployeeId;
      }
    }

    const requests = await LeaveRequest.find(query)
      .populate({ path: 'employeeId', model: getEmployeeModel() })
      .sort({ startDate: -1 });

    res.status(200).json({
      status: 'success',
      data: requests,
    });
  } catch (err) {
    next(err);
  }
};

export const getBalances = async (
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
    let targetEmployeeId = (req.query.employeeId as string) || userId;

    if (targetEmployeeId !== userId && role !== 'SuperAdmin' && role !== 'OrgAdmin' && role !== 'Manager') {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Forbidden: You are not authorized to view this employee\'s balances.',
      });
      return;
    }

    if (role === 'Manager' && targetEmployeeId !== userId) {
      // Verify reports to manager
      const Employee = getEmployeeModel();
      const targetEmp = await Employee.findById(targetEmployeeId);
      if (!targetEmp || String(targetEmp.reportingManagerId) !== userId) {
        res.status(403).json({
          status: 'error',
          statusCode: 403,
          message: 'Forbidden: You can only view balances for direct reports.',
        });
        return;
      }
    }

    const year = new Date().getFullYear();
    const leaveTypes = ['Casual', 'Sick', 'Earned'] as const;
    const balances = [];

    for (const type of leaveTypes) {
      let balance = await LeaveBalance.findOne({ employeeId: targetEmployeeId, year, leaveType: type });
      if (!balance) {
        let allocated = 15;
        if (type === 'Sick') allocated = 10;
        else if (type === 'Earned') allocated = 12;

        balance = new LeaveBalance({
          employeeId: new mongoose.Types.ObjectId(targetEmployeeId),
          year,
          leaveType: type,
          allocated,
          used: 0,
          pending: 0,
        });
        await balance.save();
      }
      balances.push(balance);
    }

    res.status(200).json({
      status: 'success',
      data: balances,
    });
  } catch (err) {
    next(err);
  }
};

export const processRequest = async (
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

    // Validate body payload
    const validationResult = processLeaveSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { status } = validationResult.data;

    const request = await LeaveRequest.findById(id);
    if (!request) {
      res.status(404).json({ status: 'error', statusCode: 404, message: 'Leave request not found.' });
      return;
    }

    if (request.status !== 'Pending') {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'This leave request has already been processed.',
      });
      return;
    }

    // Role-based validation
    if (role === 'Employee') {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Forbidden: Employees cannot process leave requests.',
      });
      return;
    } else if (role === 'Manager') {
      const Employee = getEmployeeModel();
      const requester = await Employee.findById(request.employeeId);
      if (!requester || String(requester.reportingManagerId) !== userId) {
        res.status(403).json({
          status: 'error',
          statusCode: 403,
          message: 'Forbidden: You can only approve leave requests for your direct reports.',
        });
        return;
      }
    }

    const start = new Date(request.startDate);
    const end = new Date(request.endDate);
    const durationDays = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

    // Adjust balance
    if (request.leaveType !== 'Unpaid') {
      const year = start.getFullYear();
      const balance = await LeaveBalance.findOne({
        employeeId: request.employeeId,
        year,
        leaveType: request.leaveType,
      });

      if (balance) {
        // Decrease pending
        balance.pending = Math.max(0, balance.pending - durationDays);

        if (status === 'Approved') {
          // Increase used
          balance.used += durationDays;
        }

        await balance.save();
      }
    }

    request.status = status;
    request.approvedById = new mongoose.Types.ObjectId(userId);
    await request.save();

    res.status(200).json({
      status: 'success',
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

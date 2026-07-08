import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Payroll from '../../models/Payroll';
import Attendance from '../../models/Attendance';
import LeaveRequest from '../../models/LeaveRequest';
import { AuthenticatedRequest } from '../../middleware/auth';
import { salarySetupSchema, payrollCalculateSchema, payrollProcessSchema } from '../../validators/payroll';

// Helper to resolve external Employee model dynamically
const getEmployeeModel = () => {
  return mongoose.models.Employee || mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
};

export const setupSalary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = req.user?.role;
    if (role !== 'SuperAdmin' && role !== 'OrgAdmin') {
      res.status(403).json({ status: 'error', statusCode: 403, message: 'Forbidden: Admin access required.' });
      return;
    }

    // Validate body payload
    const validationResult = salarySetupSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { employeeId, baseSalary, allowances, deductions } = validationResult.data;

    // Update Employee document directly (using dynamic model)
    const Employee = getEmployeeModel();
    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { baseSalary, allowances, deductions },
      { new: true }
    );

    if (!employee) {
      res.status(404).json({ status: 'error', statusCode: 404, message: 'Employee not found.' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Salary configuration updated successfully',
      data: {
        employeeId: employee._id,
        baseSalary: employee.baseSalary,
        allowances: employee.allowances,
        deductions: employee.deductions,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const calculatePayroll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = req.user?.role;
    if (role !== 'SuperAdmin' && role !== 'OrgAdmin') {
      res.status(403).json({ status: 'error', statusCode: 403, message: 'Forbidden: Admin access required.' });
      return;
    }

    // Validate body payload
    const validationResult = payrollCalculateSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { employeeId, month, year } = validationResult.data;

    // Check if approved/paid payroll already exists for the period
    const existing = await Payroll.findOne({
      employeeId,
      month,
      year,
      status: { $in: ['Approved', 'Paid'] },
    });

    if (existing) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Payroll for this employee and period has already been processed and approved.',
      });
      return;
    }

    // Fetch employee settings
    const Employee = getEmployeeModel();
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({ status: 'error', statusCode: 404, message: 'Employee profile not found.' });
      return;
    }

    if (employee.baseSalary === undefined || employee.baseSalary === null) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Salary settings are not configured for this employee. Please configure them in Salary Setup first.',
      });
      return;
    }

    const baseSalary = employee.baseSalary;
    const baseAllowances = employee.allowances || 0;
    const baseDeductions = employee.deductions || 0;

    // 1. Calculate Unpaid Leaves deductions
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0); // last day of month

    const unpaidLeaves = await LeaveRequest.find({
      employeeId,
      leaveType: 'Unpaid',
      status: 'Approved',
      $or: [
        { startDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { endDate: { $gte: startOfMonth, $lte: endOfMonth } },
        { startDate: { $lte: startOfMonth }, endDate: { $gte: endOfMonth } },
      ],
    });

    let unpaidDays = 0;
    for (const request of unpaidLeaves) {
      const reqStart = new Date(request.startDate);
      const reqEnd = new Date(request.endDate);

      const overlapStart = reqStart < startOfMonth ? startOfMonth : reqStart;
      const overlapEnd = reqEnd > endOfMonth ? endOfMonth : reqEnd;

      const days = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 3600 * 24)) + 1;
      if (days > 0) {
        unpaidDays += days;
      }
    }

    const unpaidDeduction = Math.round((baseSalary / 30) * unpaidDays);

    // 2. Calculate Late Clock-in deductions (fixed penalty: 20 USD per late clock-in)
    const lateLogsCount = await Attendance.countDocuments({
      employeeId,
      status: 'Late',
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const lateDeduction = lateLogsCount * 20;

    // Totals calculations
    const totalDeductions = baseDeductions + unpaidDeduction + lateDeduction;
    const netPay = Math.max(0, baseSalary + baseAllowances - totalDeductions);

    // Find and update or create Draft payroll record
    let payroll = await Payroll.findOne({ employeeId, month, year });
    if (payroll) {
      payroll.baseSalary = baseSalary;
      payroll.allowances = baseAllowances;
      payroll.deductions = totalDeductions;
      payroll.netPay = netPay;
      payroll.status = 'Draft';
    } else {
      payroll = new Payroll({
        employeeId: new mongoose.Types.ObjectId(employeeId),
        month,
        year,
        baseSalary,
        allowances: baseAllowances,
        deductions: totalDeductions,
        netPay,
        status: 'Draft',
      });
    }
    await payroll.save();

    res.status(200).json({
      status: 'success',
      data: {
        baseSalary: payroll.baseSalary,
        allowances: payroll.allowances,
        deductions: payroll.deductions,
        netPay: payroll.netPay,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPayslips = async (
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
        // Verify direct report
        const Employee = getEmployeeModel();
        const targetEmp = await Employee.findById(targetEmployeeId);
        if (!targetEmp || String(targetEmp.reportingManagerId) !== userId) {
          res.status(403).json({
            status: 'error',
            statusCode: 403,
            message: 'Forbidden: You can only view payslips for yourself or direct reports.',
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
      // SuperAdmin or OrgAdmin
      if (targetEmployeeId) {
        query.employeeId = targetEmployeeId;
      }
    }

    const payslips = await Payroll.find(query)
      .populate({ path: 'employeeId', model: getEmployeeModel() })
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      status: 'success',
      data: payslips,
    });
  } catch (err) {
    next(err);
  }
};

export const processPayroll = async (
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

    if (role !== 'SuperAdmin' && role !== 'OrgAdmin') {
      res.status(403).json({ status: 'error', statusCode: 403, message: 'Forbidden: Admin access required.' });
      return;
    }

    const { id } = req.params;

    // Validate body payload
    const validationResult = payrollProcessSchema.safeParse(req.body);
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

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      res.status(404).json({ status: 'error', statusCode: 404, message: 'Payroll run record not found.' });
      return;
    }

    payroll.status = status;
    payroll.approvedById = new mongoose.Types.ObjectId(userId);
    await payroll.save();

    res.status(200).json({
      status: 'success',
      message: `Payroll run status updated to ${status} successfully`,
      data: payroll,
    });
  } catch (err) {
    next(err);
  }
};

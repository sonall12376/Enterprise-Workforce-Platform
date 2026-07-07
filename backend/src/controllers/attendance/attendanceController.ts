import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Attendance, { IAttendance } from '../../models/Attendance';
import AttendanceCorrection from '../../models/AttendanceCorrection';
import { AuthenticatedRequest } from '../../middleware/auth';
import { clockInSchema, correctionRequestSchema, processCorrectionSchema } from '../../validators/attendance';

// Helper to resolve external models dynamically
const getEmployeeModel = () => {
  return mongoose.models.Employee || mongoose.model('Employee', new mongoose.Schema({}, { strict: false }));
};

const getOfficeLocationModel = () => {
  return mongoose.models.OfficeLocation || mongoose.model('OfficeLocation', new mongoose.Schema({}, { strict: false }));
};

const getWorkShiftModel = () => {
  return mongoose.models.WorkShift || mongoose.model('WorkShift', new mongoose.Schema({}, { strict: false }));
};

// Haversine formula to compute distance between two coordinates in meters
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const clockIn = async (
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
    const validationResult = clockInSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    // Fetch employee details from external model
    const Employee = getEmployeeModel();
    const employee = await Employee.findById(userId);
    if (!employee) {
      res.status(404).json({ status: 'error', statusCode: 404, message: 'Employee profile not found' });
      return;
    }

    // Geofencing verification
    let timezone = 'UTC';
    if (employee.locationId) {
      const OfficeLocation = getOfficeLocationModel();
      const location = await OfficeLocation.findById(employee.locationId);
      if (location) {
        timezone = location.timezone || 'UTC';
        if (location.coordinates && location.geofenceRadius) {
          const reqCoords = req.body.coordinates;
          if (!reqCoords) {
            res.status(400).json({
              status: 'error',
              statusCode: 400,
              message: 'Location coordinates are required for clock-in verification.',
            });
            return;
          }

          const distance = getDistanceInMeters(
            reqCoords.latitude,
            reqCoords.longitude,
            location.coordinates.latitude,
            location.coordinates.longitude
          );

          if (distance > location.geofenceRadius) {
            res.status(400).json({
              status: 'error',
              statusCode: 400,
              message: `Clock-in blocked: You are outside the allowed geofence boundary. Distance: ${Math.round(
                distance
              )}m (Allowed: ${location.geofenceRadius}m)`,
            });
            return;
          }
        }
      }
    }

    // Calculate timezone specific local date (midnight UTC representation)
    const now = new Date();
    const localDateString = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    const todayMidnight = new Date(`${localDateString}T00:00:00.000Z`);

    // Verify if clock-in already exists
    const existing = await Attendance.findOne({ employeeId: userId, date: todayMidnight });
    if (existing) {
      res.status(400).json({ status: 'error', statusCode: 400, message: 'You have already clocked in for today.' });
      return;
    }

    // Check shift timings
    let status: 'Present' | 'Late' = 'Present';
    if (employee.shiftId) {
      const WorkShift = getWorkShiftModel();
      const shift = await WorkShift.findById(employee.shiftId);
      if (shift) {
        const gracePeriod = shift.gracePeriodMins ?? 15;
        const [shiftHour, shiftMinute] = shift.startTime.split(':').map(Number);

        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const localTimeParts = formatter.formatToParts(now);
        const hourPart = localTimeParts.find((p) => p.type === 'hour')?.value || '0';
        const minPart = localTimeParts.find((p) => p.type === 'minute')?.value || '0';
        const clockInHour = parseInt(hourPart, 10);
        const clockInMinute = parseInt(minPart, 10);

        const clockInMinutes = clockInHour * 60 + clockInMinute;
        const shiftStartMinutes = shiftHour * 60 + shiftMinute;

        if (clockInMinutes > shiftStartMinutes + gracePeriod) {
          status = 'Late';
        }
      }
    }

    // Save Attendance
    const attendance = new Attendance({
      employeeId: new mongoose.Types.ObjectId(userId),
      date: todayMidnight,
      clockIn: now,
      status,
    });
    await attendance.save();

    res.status(200).json({
      status: 'success',
      message: 'Clock-in successful',
      data: {
        clockIn: attendance.clockIn,
        status: attendance.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const clockOut = async (
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

    // Find the active (un-clocked-out) log
    const attendance = await Attendance.findOne({
      employeeId: userId,
      clockOut: { $exists: false },
    }).sort({ date: -1 });

    if (!attendance) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'No active clock-in found. Please clock-in first.',
      });
      return;
    }

    const now = new Date();
    attendance.clockOut = now;

    // Calculate workMinutes
    const diffMs = now.getTime() - attendance.clockIn.getTime();
    const workMinutes = Math.round(diffMs / (1000 * 60));
    attendance.workMinutes = workMinutes;

    // Update status to HalfDay if work duration is less than 4 hours (240 minutes)
    if (workMinutes < 240) {
      attendance.status = 'HalfDay';
    }

    await attendance.save();

    res.status(200).json({
      status: 'success',
      message: 'Clock-out successful',
      data: {
        clockIn: attendance.clockIn,
        clockOut: attendance.clockOut,
        workMinutes: attendance.workMinutes,
        status: attendance.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getLogs = async (
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
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 31;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (role === 'Employee') {
      query.employeeId = userId;
    } else if (role === 'Manager') {
      if (targetEmployeeId && targetEmployeeId !== userId) {
        // Verify reporting structure
        const Employee = getEmployeeModel();
        const targetEmp = await Employee.findById(targetEmployeeId);
        if (!targetEmp || String(targetEmp.reportingManagerId) !== userId) {
          res.status(403).json({
            status: 'error',
            statusCode: 403,
            message: 'Forbidden: You can only view logs for yourself or your direct reports.',
          });
          return;
        }
        query.employeeId = targetEmployeeId;
      } else if (!targetEmployeeId) {
        // Fetch manager's own logs and their reports' logs
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

    const logs = await Attendance.find(query).sort({ date: -1 }).skip(skip).limit(limit);
    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        logs,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const submitCorrection = async (
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

    // Validate body payload
    const validationResult = correctionRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: validationResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { attendanceId, requestedClockIn, requestedClockOut, reason } = validationResult.data;

    // Check attendance record validity
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      res.status(404).json({ status: 'error', statusCode: 404, message: 'Attendance record not found.' });
      return;
    }

    if (String(attendance.employeeId) !== userId) {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Forbidden: You can only request corrections for your own logs.',
      });
      return;
    }

    // Save correction request
    const correction = new AttendanceCorrection({
      attendanceId: new mongoose.Types.ObjectId(attendanceId),
      requestedById: new mongoose.Types.ObjectId(userId),
      requestedClockIn: new Date(requestedClockIn),
      requestedClockOut: new Date(requestedClockOut),
      reason,
      status: 'Pending',
    });
    await correction.save();

    res.status(201).json({
      status: 'success',
      message: 'Correction request submitted successfully',
      data: correction,
    });
  } catch (err) {
    next(err);
  }
};

export const getCorrections = async (
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
    const query: any = {};

    if (role === 'Employee') {
      query.requestedById = userId;
    } else if (role === 'Manager') {
      const Employee = getEmployeeModel();
      const reports = await Employee.find({ reportingManagerId: userId }).select('_id');
      const reportIds = reports.map((r) => r._id);
      query.requestedById = { $in: [...reportIds, new mongoose.Types.ObjectId(userId)] };
    }

    const corrections = await AttendanceCorrection.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: corrections,
    });
  } catch (err) {
    next(err);
  }
};

export const processCorrection = async (
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
    const validationResult = processCorrectionSchema.safeParse(req.body);
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

    const correction = await AttendanceCorrection.findById(id);
    if (!correction) {
      res.status(404).json({ status: 'error', statusCode: 404, message: 'Correction request not found.' });
      return;
    }

    if (correction.status !== 'Pending') {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'This correction request has already been processed.',
      });
      return;
    }

    // Role-based validation
    if (role === 'Employee') {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Forbidden: Employees cannot approve correction requests.',
      });
      return;
    } else if (role === 'Manager') {
      const Employee = getEmployeeModel();
      const requester = await Employee.findById(correction.requestedById);
      if (!requester || String(requester.reportingManagerId) !== userId) {
        res.status(403).json({
          status: 'error',
          statusCode: 403,
          message: 'Forbidden: You can only approve correction requests for your direct reports.',
        });
        return;
      }
    }

    if (status === 'Approved') {
      const attendance = await Attendance.findById(correction.attendanceId);
      if (attendance) {
        const reqIn = new Date(correction.requestedClockIn);
        const reqOut = new Date(correction.requestedClockOut);

        attendance.clockIn = reqIn;
        attendance.clockOut = reqOut;

        const workMins = Math.round((reqOut.getTime() - reqIn.getTime()) / (1000 * 60));
        attendance.workMinutes = workMins;

        // Re-evaluate attendance status based on shift timings
        let newStatus: 'Present' | 'Late' | 'HalfDay' = 'Present';
        const Employee = getEmployeeModel();
        const emp = await Employee.findById(attendance.employeeId);
        if (emp && emp.shiftId) {
          const WorkShift = getWorkShiftModel();
          const shift = await WorkShift.findById(emp.shiftId);
          if (shift) {
            const OfficeLocation = getOfficeLocationModel();
            const location = emp.locationId ? await OfficeLocation.findById(emp.locationId) : null;
            const timezone = location?.timezone || 'UTC';
            const gracePeriod = shift.gracePeriodMins ?? 15;
            const [shiftHour, shiftMinute] = shift.startTime.split(':').map(Number);

            const formatter = new Intl.DateTimeFormat('en-US', {
              timeZone: timezone,
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
            const localTimeParts = formatter.formatToParts(reqIn);
            const hourPart = localTimeParts.find((p) => p.type === 'hour')?.value || '0';
            const minPart = localTimeParts.find((p) => p.type === 'minute')?.value || '0';
            const clockInHour = parseInt(hourPart, 10);
            const clockInMinute = parseInt(minPart, 10);

            const clockInMinutes = clockInHour * 60 + clockInMinute;
            const shiftStartMinutes = shiftHour * 60 + shiftMinute;

            if (clockInMinutes > shiftStartMinutes + gracePeriod) {
              newStatus = 'Late';
            }
          }
        }

        // HalfDay check
        if (workMins < 240) {
          newStatus = 'HalfDay';
        }

        attendance.status = newStatus;
        await attendance.save();
      }
    }

    correction.status = status;
    correction.approvedById = new mongoose.Types.ObjectId(userId);
    await correction.save();

    res.status(200).json({
      status: 'success',
      message: `Correction request ${status.toLowerCase()} successfully`,
      data: correction,
    });
  } catch (err) {
    next(err);
  }
};

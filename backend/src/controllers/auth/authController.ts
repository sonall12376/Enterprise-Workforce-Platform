import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Employee } from '../../models/Employee';
import { env } from '../../config/env';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  signupSchema,
} from '../../validators/authValidator';
import { AuthenticatedRequest } from '../../middleware/auth';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Validate payload
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failure',
        errors: fieldErrors,
      });
      return;
    }

    const { email, password, role } = validation.data;

    // 2. Find employee
    const employee = await Employee.findOne({ email: email.toLowerCase() });
    if (!employee) {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid credentials',
      });
      return;
    }

    // Role Verification Check
    if (employee.role !== role) {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Role mismatch: Selected role does not match your registered user profile role.',
      });
      return;
    }

    // 3. Account Lock Check
    if (employee.lockUntil && employee.lockUntil > new Date()) {
      const timeLeft = Math.ceil((employee.lockUntil.getTime() - Date.now()) / 1000 / 60);
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: `Account is temporarily locked. Try again in ${timeLeft} minutes.`,
      });
      return;
    }

    // 4. Verify status is Active
    if (employee.status !== 'Active') {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Account is not active',
      });
      return;
    }

    // 5. Compare passwords
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      // Increment login attempts
      employee.loginAttempts = (employee.loginAttempts || 0) + 1;
      if (employee.loginAttempts >= 5) {
        employee.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        employee.loginAttempts = 0;
      }
      await employee.save();

      if (employee.lockUntil) {
        res.status(403).json({
          status: 'error',
          statusCode: 403,
          message: 'Account locked due to too many failed attempts. Try again in 15 minutes.',
        });
      } else {
        res.status(401).json({
          status: 'error',
          statusCode: 401,
          message: `Invalid credentials. ${5 - (employee.loginAttempts || 0)} attempts remaining.`,
        });
      }
      return;
    }

    // Reset login attempts
    employee.loginAttempts = 0;
    employee.lockUntil = undefined;
    await employee.save();

    // 6. Generate access and refresh tokens
    const payload = {
      id: (employee._id as any).toString(),
      email: employee.email,
      role: employee.role,
      orgId: employee.orgId ? (employee.orgId as any).toString() : undefined,
    };

    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      env.JWT_SECRET + '_refresh',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: employee._id,
          email: employee.email,
          name: employee.name,
          role: employee.role,
          orgId: employee.orgId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Refresh token is required',
      });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_SECRET + '_refresh');
    } catch (err) {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    if (decoded.type !== 'refresh') {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid token type',
      });
      return;
    }

    const employee = await Employee.findById(decoded.id);
    if (!employee || employee.status !== 'Active') {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Unauthorized: Account is suspended or inactive',
      });
      return;
    }

    const payload = {
      id: (employee._id as any).toString(),
      email: employee.email,
      role: employee.role,
      orgId: employee.orgId ? (employee.orgId as any).toString() : undefined,
    };

    const newAccessToken = jwt.sign(
      { ...payload, type: 'access' },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      env.JWT_SECRET + '_refresh',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      status: 'success',
      message: 'Access token refreshed',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failure',
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { email } = validation.data;
    const employee = await Employee.findOne({ email: email.toLowerCase() });
    
    if (!employee) {
      res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Account not found. Please verify your email address.',
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    employee.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    employee.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await employee.save();

    console.log(`🔑 [Forgot Password] Reset Link for ${email}: http://localhost:3000/reset-password/${resetToken}`);

    res.status(200).json({
      status: 'success',
      message: 'If the email exists, a password reset link has been dispatched.',
      data: { resetToken } // sending back for developer testing convenience
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { token } = req.params;
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failure',
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { password } = validation.data;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const employee = await Employee.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!employee) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Password reset token is invalid or has expired',
      });
      return;
    }

    employee.passwordHash = await bcrypt.hash(password, 10);
    employee.resetPasswordToken = undefined;
    employee.resetPasswordExpires = undefined;
    employee.loginAttempts = 0;
    employee.lockUntil = undefined;
    await employee.save();

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failure',
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { currentPassword, newPassword } = validation.data;
    const employee = await Employee.findById(req.user?.id);
    if (!employee) {
      res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Employee profile not found',
      });
      return;
    }

    const isMatch = await employee.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Current password provided is incorrect',
      });
      return;
    }

    employee.passwordHash = await bcrypt.hash(newPassword, 10);
    await employee.save();

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failure',
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { firstName, lastName, email, phone, gender, dob, role, password, emergencyContact } = validation.data;

    const existing = await Employee.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Duplicate email: User already registered with this email address.',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const employeeId = 'EMP-' + Math.floor(100000 + Math.random() * 900000).toString();

    // Default seeded orgId
    const orgId = '603d2e1b12cf000000000001';

    const newEmployee = await Employee.create({
      orgId,
      employeeId,
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      gender,
      dob,
      role,
      passwordHash,
      emergencyContact,
      status: 'Active',
      timeline: [
        {
          action: 'Self Registered',
          description: 'User created their own account via Signup page.',
          performedBy: `${firstName} ${lastName}`,
          date: new Date(),
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      message: 'Signup successful! You can now log in.',
      data: {
        user: {
          id: newEmployee._id,
          email: newEmployee.email,
          name: newEmployee.name,
          role: newEmployee.role,
          orgId: newEmployee.orgId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export default { login, refresh, forgotPassword, resetPassword, changePassword, signup };

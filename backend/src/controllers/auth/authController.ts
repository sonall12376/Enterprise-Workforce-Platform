import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Employee } from '../../models/Employee';
import { loginSchema } from '../../validators/authValidator';
import { env } from '../../config/env';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Validate payload using Zod
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      // Format validation errors to match standard error format
      const fieldErrors = validation.error.flatten().fieldErrors;
      res.status(400).json({
        status: 'error',
        statusCode: 400,
        message: 'Validation failure',
        errors: fieldErrors,
      });
      return;
    }

    const { email, password } = validation.data;

    // 2. Find employee in database
    const employee = await Employee.findOne({ email: email.toLowerCase() });
    if (!employee) {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid credentials',
      });
      return;
    }

    // 3. Verify status is Active
    if (employee.status !== 'Active') {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Account is not active',
      });
      return;
    }

    // 4. Compare passwords
    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Invalid credentials',
      });
      return;
    }

    // 5. Generate JWT token
    const accessToken = jwt.sign(
      {
        id: (employee._id as any).toString(),
        email: employee.email,
        role: employee.role,
        orgId: employee.orgId ? (employee.orgId as any).toString() : undefined,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES_IN as any,
      }
    );

    // 6. Return standard success response matching design spec
    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken,
        user: {
          id: employee._id,
          email: employee.email,
          name: employee.name,
          role: employee.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
export default login;

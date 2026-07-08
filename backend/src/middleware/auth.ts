import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Define custom property on Express Request type to attach authenticated user info
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    orgId?: string;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // 1. Read token from Authorization header (Bearer token)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Unauthorized: Access token missing or invalid',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify token signature against JWT_SECRET
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      orgId?: string;
    };

    // 3. Populate req.user details
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      statusCode: 401,
      message: 'Unauthorized: Invalid or expired access token',
    });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        statusCode: 401,
        message: 'Unauthorized: User authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        statusCode: 403,
        message: 'Forbidden: Insufficient role permissions',
      });
      return;
    }

    next();
  };
};


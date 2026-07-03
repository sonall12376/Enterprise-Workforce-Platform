import { Request, Response, NextFunction } from 'express';

// Define custom property on Express Request type to attach authenticated user info
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    orgId: string;
  };
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // TODO: Implement actual JWT authentication verification
  // 1. Read token from Authorization header (Bearer token)
  // 2. Verify token signature against JWT_SECRET
  // 3. Populate req.user details
  
  // Placeholder behavior: allow requests to pass or return 501/mock details depending on configuration.
  // For the skeleton setup, we call next().
  next();
};

export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // TODO: Implement actual role-based authorization verification
    next();
  };
};

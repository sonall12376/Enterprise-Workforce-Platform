import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import employeeService from '../services/employeeService';
import { createEmployeeSchema, updateEmployeeSchema } from '../validators/employeeValidator';
import mongoose from 'mongoose';

export const createEmployee = async (req: AuthenticatedRequest, res: Response) => {
  const result = createEmployeeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;

  try {
    const employee = await employeeService.create(result.data, orgId);
    return res.status(201).json({
      status: 'success',
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to onboard employee',
    });
  }
};

export const getEmployees = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const filters = {
    deptId: req.query.deptId as string,
    status: req.query.status as string,
    search: req.query.search as string,
  };

  try {
    const { employees, total, pages } = await employeeService.getAll(orgId, filters, { page, limit });
    return res.status(200).json({
      status: 'success',
      data: {
        employees,
        pagination: { total, page, pages },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch employees',
    });
  }
};

export const getEmployeeById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid employee ID format',
    });
  }

  try {
    const employee = await employeeService.getById(id, orgId);
    if (!employee) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Employee profile not found',
      });
    }
    return res.status(200).json({
      status: 'success',
      data: employee,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch employee details',
    });
  }
};

export const updateEmployee = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = (req.user?.orgId || req.body.orgId || '603d2e1b12cf000000000001') as string;
  const performer = req.user?.id || 'System';

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid employee ID format',
    });
  }

  const result = updateEmployeeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Validation failed',
      errors: result.error.format(),
    });
  }

  try {
    const updatedEmployee = await employeeService.update(id, result.data, orgId, performer);
    if (!updatedEmployee) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Employee not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Employee updated successfully',
      data: updatedEmployee,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: error.message || 'Failed to update employee details',
    });
  }
};

export const deleteEmployee = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const orgId = (req.user?.orgId || '603d2e1b12cf000000000001') as string;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: 'error',
      statusCode: 400,
      message: 'Invalid employee ID format',
    });
  }

  try {
    const deletedEmployee = await employeeService.delete(id, orgId);
    if (!deletedEmployee) {
      return res.status(404).json({
        status: 'error',
        statusCode: 404,
        message: 'Employee not found or unauthorized',
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Employee deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to delete employee details',
    });
  }
};

export const getEmployeeMetadata = async (req: AuthenticatedRequest, res: Response) => {
  const orgId = (req.user?.orgId || req.query.orgId || '603d2e1b12cf000000000001') as string;

  try {
    const metadata = await employeeService.getOrgMetadata(orgId);
    return res.status(200).json({
      status: 'success',
      data: metadata,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      statusCode: 500,
      message: error.message || 'Failed to fetch meta parameters',
    });
  }
};

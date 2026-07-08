import { useState, useEffect, useCallback } from 'react';
import employeeService from '../services/employeeService';
import { Employee, EmployeeCreateInput, EmployeeUpdateInput, OrgMetadata } from '../types/employeeTypes';

export const useEmployees = (initialFilters?: { deptId?: string; status?: string; search?: string; page?: number; limit?: number }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [metadata, setMetadata] = useState<OrgMetadata | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters || { page: 1, limit: 10 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchEmployees = useCallback(async (currentFilters = filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await employeeService.getEmployees(currentFilters);
      setEmployees(data.employees);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchMetadata = useCallback(async () => {
    try {
      const data = await employeeService.getMetadata();
      setMetadata(data);
    } catch (err: any) {
      console.error('Failed to fetch organization metadata:', err);
    }
  }, []);

  const addEmployee = async (data: EmployeeCreateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const newEmp = await employeeService.createEmployee(data);
      setEmployees((prev) => [newEmp, ...prev]);
      return newEmp;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to onboard employee';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const editEmployee = async (id: string, data: EmployeeUpdateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await employeeService.updateEmployee(id, data);
      setEmployees((prev) => prev.map((emp) => (emp._id === id ? updated : emp)));
      return updated;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update employee';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const removeEmployee = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await employeeService.deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp._id !== id));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete employee';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees, filters]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return {
    employees,
    metadata,
    isLoading,
    error,
    filters,
    pagination,
    updateFilters,
    refetchEmployees: fetchEmployees,
    addEmployee,
    editEmployee,
    removeEmployee,
  };
};

export default useEmployees;

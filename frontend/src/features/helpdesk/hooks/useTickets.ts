import { useState, useEffect, useCallback } from 'react';
import helpDeskService from '../services/helpDeskService';
import { HelpDeskTicket, TicketCreateInput, TicketUpdateInput } from '../types/helpDeskTypes';

export const useTickets = (initialFilters?: {
  status?: string;
  category?: string;
  priority?: string;
  raisedById?: string;
  assignedToId?: string;
}) => {
  const [tickets, setTickets] = useState<HelpDeskTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTickets = useCallback(async (currentFilters = filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await helpDeskService.getTickets(currentFilters);
      setTickets(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const addTicket = async (data: TicketCreateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTicket = await helpDeskService.createTicket(data);
      setTickets((prev) => [newTicket, ...prev]);
      return newTicket;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create ticket';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const editTicket = async (id: string, data: TicketUpdateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedTicket = await helpDeskService.updateTicket(id, data);
      setTickets((prev) => prev.map((t) => (t._id === id ? updatedTicket : t)));
      return updatedTicket;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update ticket';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const removeTicket = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await helpDeskService.deleteTicket(id);
      setTickets((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete ticket';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const allocateTicket = async (id: string, assignedToId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await helpDeskService.assignTicket(id, assignedToId);
      setTickets((prev) => prev.map((t) => (t._id === id ? updated : t)));
      return updated;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to assign ticket';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const changeTicketStatus = async (
    id: string,
    status: 'Open' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed'
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await helpDeskService.updateTicketStatus(id, status);
      setTickets((prev) => prev.map((t) => (t._id === id ? updated : t)));
      return updated;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update ticket status';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets, filters]);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return {
    tickets,
    isLoading,
    error,
    filters,
    updateFilters,
    refetchTickets: fetchTickets,
    addTicket,
    editTicket,
    removeTicket,
    allocateTicket,
    changeTicketStatus,
  };
};

export default useTickets;

import { useState, useEffect, useCallback } from 'react';
import recruitmentService from '../services/recruitmentService';
import {
  Candidate,
  CandidateCreateInput,
  CandidateUpdateInput,
  Interview,
  ScheduleInterviewInput,
  SubmitFeedbackInput,
} from '../types/recruitmentTypes';

export const useRecruitment = (initialFilters?: { search?: string; status?: string }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters || { search: '', status: '' });

  const fetchCandidates = useCallback(async (currentFilters = filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recruitmentService.getCandidates(currentFilters);
      setCandidates(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch candidates');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchInterviews = useCallback(async (candidateId?: string) => {
    setIsLoading(true);
    try {
      const data = await recruitmentService.getInterviews(candidateId);
      setInterviews(data);
    } catch (err: any) {
      console.error('Failed to fetch interviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCandidate = async (data: CandidateCreateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const newCand = await recruitmentService.createCandidate(data);
      setCandidates((prev) => [newCand, ...prev]);
      return newCand;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to add candidate';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const editCandidate = async (id: string, data: CandidateUpdateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await recruitmentService.updateCandidate(id, data);
      setCandidates((prev) => prev.map((cand) => (cand._id === id ? updated : cand)));
      return updated;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update candidate';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCandidate = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await recruitmentService.deleteCandidate(id);
      setCandidates((prev) => prev.filter((cand) => cand._id !== id));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete candidate';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleRound = async (data: ScheduleInterviewInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const interview = await recruitmentService.scheduleInterview(data);
      setInterviews((prev) => [...prev, interview]);
      return interview;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to schedule interview';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const submitEvaluation = async (interviewId: string, data: SubmitFeedbackInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const feedback = await recruitmentService.submitFeedback(interviewId, data);
      // reload interviews
      await fetchInterviews();
      return feedback;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit feedback';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates, filters]);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return {
    candidates,
    interviews,
    isLoading,
    error,
    filters,
    updateFilters,
    refetchCandidates: fetchCandidates,
    fetchInterviews,
    addCandidate,
    editCandidate,
    removeCandidate,
    scheduleRound,
    submitEvaluation,
  };
};

export default useRecruitment;

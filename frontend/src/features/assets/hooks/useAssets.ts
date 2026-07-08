import { useState, useEffect, useCallback } from 'react';
import assetService from '../services/assetService';
import { Asset, AssetCreateInput, AssetUpdateInput } from '../types/assetTypes';

export const useAssets = (initialFilters?: {
  status?: string;
  type?: string;
  name?: string;
  serialNumber?: string;
}) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchAssets = useCallback(async (currentFilters = filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await assetService.getAssets(currentFilters);
      setAssets(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch assets');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const addAsset = async (data: AssetCreateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const newAsset = await assetService.createAsset(data);
      setAssets((prev) => [newAsset, ...prev]);
      return newAsset;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to create asset';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const editAsset = async (id: string, data: AssetUpdateInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedAsset = await assetService.updateAsset(id, data);
      setAssets((prev) => prev.map((asset) => (asset._id === id ? updatedAsset : asset)));
      return updatedAsset;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update asset';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const removeAsset = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await assetService.deleteAsset(id);
      setAssets((prev) => prev.filter((asset) => asset._id !== id));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete asset';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const allocateAsset = async (assetId: string, employeeId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await assetService.assignAsset(assetId, employeeId);
      await fetchAssets(); // Refresh list to get updated status and populated assignee details
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to assign asset';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const releaseAsset = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await assetService.returnAsset(id);
      await fetchAssets(); // Refresh list to clear assignee details
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to return asset';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets, filters]);

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return {
    assets,
    isLoading,
    error,
    filters,
    updateFilters,
    refetchAssets: fetchAssets,
    addAsset,
    editAsset,
    removeAsset,
    allocateAsset,
    releaseAsset,
  };
};

export default useAssets;

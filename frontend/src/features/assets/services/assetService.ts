import api from '../../../services/api';
import { Asset, AssetCreateInput, AssetUpdateInput } from '../types/assetTypes';

export const assetService = {
  getAssets: async (filters?: {
    status?: string;
    type?: string;
    name?: string;
    serialNumber?: string;
  }): Promise<Asset[]> => {
    const response = await api.get('/assets', { params: filters });
    return response.data.data;
  },

  getAsset: async (id: string): Promise<Asset> => {
    const response = await api.get(`/assets/${id}`);
    return response.data.data;
  },

  createAsset: async (data: AssetCreateInput): Promise<Asset> => {
    const response = await api.post('/assets', data);
    return response.data.data;
  },

  updateAsset: async (id: string, data: AssetUpdateInput): Promise<Asset> => {
    const response = await api.put(`/assets/${id}`, data);
    return response.data.data;
  },

  deleteAsset: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
  },

  assignAsset: async (assetId: string, employeeId: string): Promise<void> => {
    await api.post('/assets/assign', { assetId, employeeId });
  },

  returnAsset: async (id: string): Promise<void> => {
    await api.post(`/assets/${id}/return`);
  },
};

export default assetService;

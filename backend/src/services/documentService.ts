import DocumentModel, { IDocument } from '../models/Document';

export const documentService = {
  create: async (data: any, orgId: string, uploaderId: string): Promise<IDocument> => {
    const document = new DocumentModel({
      ...data,
      orgId,
      uploadedById: uploaderId,
    });
    return await document.save();
  },

  getAllByEmployee: async (orgId: string, employeeId: string): Promise<IDocument[]> => {
    return await DocumentModel.find({ orgId, uploadedById: employeeId }).sort({ createdAt: -1 });
  },

  getById: async (id: string, orgId: string): Promise<IDocument | null> => {
    return await DocumentModel.findOne({ _id: id, orgId });
  },

  delete: async (id: string, orgId: string): Promise<IDocument | null> => {
    return await DocumentModel.findOneAndDelete({ _id: id, orgId });
  },
};

export default documentService;

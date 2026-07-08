import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument extends Document {
  uploadedById: mongoose.Types.ObjectId;
  orgId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  category: 'Policy' | 'Contract' | 'IDProof' | 'Resume' | 'Offer Letter' | 'Profile Photo';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema: Schema = new Schema(
  {
    uploadedById: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    category: {
      type: String,
      enum: ['Policy', 'Contract', 'IDProof', 'Resume', 'Offer Letter', 'Profile Photo'],
      required: true,
    },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const DocumentModel = mongoose.model<IDocument>('Document', DocumentSchema);
export default DocumentModel;

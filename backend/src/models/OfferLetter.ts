import mongoose, { Schema, Document } from 'mongoose';

export interface IOfferLetter extends Document {
  candidateId: mongoose.Types.ObjectId;
  approvedById: mongoose.Types.ObjectId;
  offeredSalary: number;
  joiningDate: Date;
  status: 'Draft' | 'PendingApproval' | 'Approved' | 'Sent' | 'Accepted' | 'Declined';
  cloudinaryPdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OfferLetterSchema: Schema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    approvedById: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    offeredSalary: { type: Number, required: true, min: 0 },
    joiningDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Draft', 'PendingApproval', 'Approved', 'Sent', 'Accepted', 'Declined'],
      default: 'Draft',
    },
    cloudinaryPdfUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const OfferLetter = mongoose.model<IOfferLetter>('OfferLetter', OfferLetterSchema);
export default OfferLetter;

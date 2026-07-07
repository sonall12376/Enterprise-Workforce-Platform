import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidateTimeline {
  stage: 'Applied' | 'Screening' | 'Technical Interview' | 'HR Interview' | 'Selected' | 'Offer Sent' | 'Joined' | 'Rejected';
  note?: string;
  date: Date;
  updatedBy: string;
}

export interface ICandidate extends Document {
  orgId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  status: 'Applied' | 'Screening' | 'Technical Interview' | 'HR Interview' | 'Selected' | 'Offer Sent' | 'Joined' | 'Rejected';
  experienceYears?: number;
  skills: string[];
  resume?: mongoose.Types.ObjectId | null;
  source: string;
  offerDetails?: {
    salary?: number;
    joiningDate?: Date;
    generatedAt?: Date;
    offerLetterDoc?: mongoose.Types.ObjectId | null;
  };
  timeline: ICandidateTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

const CandidateSchema: Schema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    status: {
      type: String,
      enum: ['Applied', 'Screening', 'Technical Interview', 'HR Interview', 'Selected', 'Offer Sent', 'Joined', 'Rejected'],
      default: 'Applied',
    },
    experienceYears: { type: Number, default: 0 },
    skills: [{ type: String }],
    resume: { type: Schema.Types.ObjectId, ref: 'Document', default: null },
    source: { type: String, default: 'Direct Application' },
    offerDetails: {
      salary: { type: Number },
      joiningDate: { type: Date },
      generatedAt: { type: Date },
      offerLetterDoc: { type: Schema.Types.ObjectId, ref: 'Document', default: null },
    },
    timeline: [
      {
        stage: { type: String, required: true },
        note: { type: String },
        date: { type: Date, default: Date.now },
        updatedBy: { type: String, default: 'System' },
      },
    ],
  },
  { timestamps: true }
);

export const Candidate = mongoose.model<ICandidate>('Candidate', CandidateSchema);
export default Candidate;

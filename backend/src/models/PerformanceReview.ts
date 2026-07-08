import mongoose, { Schema, Document } from 'mongoose';

export interface IPerformanceReview extends Document {
  employeeId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  reviewPeriod: string; // e.g. "Q1-2026"
  rating: number; // 1.0 to 5.0
  feedback: string;
  status: 'Draft' | 'Submitted' | 'Acknowledged';
  createdAt: Date;
  updatedAt: Date;
}

const PerformanceReviewSchema = new Schema<IPerformanceReview>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    reviewPeriod: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1.0,
      max: 5.0,
    },
    feedback: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Acknowledged'],
      default: 'Submitted',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PerformanceReview || 
  mongoose.model<IPerformanceReview>('PerformanceReview', PerformanceReviewSchema);

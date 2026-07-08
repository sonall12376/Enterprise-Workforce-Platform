import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewFeedback extends Document {
  interviewId: mongoose.Types.ObjectId;
  interviewerId: mongoose.Types.ObjectId;
  rating: number; // integer 1 to 5
  comments: string;
  recommendation: 'Hire' | 'Hold' | 'Reject';
  createdAt: Date;
  updatedAt: Date;
}

const InterviewFeedbackSchema: Schema = new Schema(
  {
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true },
    interviewerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    rating: { type: Number, required: true, min: 1, max: 5, validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer between 1 and 5',
    }},
    comments: { type: String, required: true, trim: true },
    recommendation: { type: String, enum: ['Hire', 'Hold', 'Reject'], required: true },
  },
  { timestamps: true }
);

export const InterviewFeedback = mongoose.model<IInterviewFeedback>('InterviewFeedback', InterviewFeedbackSchema);
export default InterviewFeedback;

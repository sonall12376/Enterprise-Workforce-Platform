import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  candidateId: mongoose.Types.ObjectId;
  interviewerId: mongoose.Types.ObjectId;
  roundName: string;
  scheduledTime: Date;
  durationMins: number;
  mode: 'Online' | 'In-Person';
  meetingLink?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema: Schema = new Schema(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    interviewerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    roundName: { type: String, required: true, trim: true },
    scheduledTime: { type: Date, required: true },
    durationMins: { type: Number, default: 60 },
    mode: { type: String, enum: ['Online', 'In-Person'], default: 'Online' },
    meetingLink: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

export const Interview = mongoose.model<IInterview>('Interview', InterviewSchema);
export default Interview;

import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
  employeeId: mongoose.Types.ObjectId;
  title: string;
  targetDate: Date;
  progress: number; // 0 to 100
  status: 'NotStarted' | 'InProgress' | 'Achieved' | 'Deferred';
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema = new Schema<IGoal>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      required: true,
    },
    status: {
      type: String,
      enum: ['NotStarted', 'InProgress', 'Achieved', 'Deferred'],
      default: 'NotStarted',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);

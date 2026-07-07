import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  approvedById?: mongoose.Types.ObjectId;
  leaveType: 'Casual' | 'Sick' | 'Earned' | 'Unpaid';
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    approvedById: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    leaveType: {
      type: String,
      enum: ['Casual', 'Sick', 'Earned', 'Unpaid'],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LeaveRequest || 
  mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);

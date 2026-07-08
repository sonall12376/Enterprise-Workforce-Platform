import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveBalance extends Document {
  employeeId: mongoose.Types.ObjectId;
  year: number;
  leaveType: 'Casual' | 'Sick' | 'Earned';
  allocated: number;
  used: number;
  pending: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveBalanceSchema = new Schema<ILeaveBalance>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    leaveType: {
      type: String,
      enum: ['Casual', 'Sick', 'Earned'],
      required: true,
    },
    allocated: {
      type: Number,
      required: true,
      min: 0,
    },
    used: {
      type: Number,
      default: 0,
      min: 0,
    },
    pending: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique index per employee per year per leave type
LeaveBalanceSchema.index({ employeeId: 1, year: 1, leaveType: 1 }, { unique: true });

export default mongoose.models.LeaveBalance || 
  mongoose.model<ILeaveBalance>('LeaveBalance', LeaveBalanceSchema);

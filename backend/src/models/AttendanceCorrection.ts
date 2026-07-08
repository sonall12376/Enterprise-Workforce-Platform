import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceCorrection extends Document {
  attendanceId: mongoose.Types.ObjectId;
  requestedById: mongoose.Types.ObjectId;
  approvedById?: mongoose.Types.ObjectId;
  requestedClockIn: Date;
  requestedClockOut: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceCorrectionSchema = new Schema<IAttendanceCorrection>(
  {
    attendanceId: {
      type: Schema.Types.ObjectId,
      ref: 'Attendance',
      required: true,
    },
    requestedById: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    approvedById: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    requestedClockIn: {
      type: Date,
      required: true,
    },
    requestedClockOut: {
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

export default mongoose.models.AttendanceCorrection || 
  mongoose.model<IAttendanceCorrection>('AttendanceCorrection', AttendanceCorrectionSchema);

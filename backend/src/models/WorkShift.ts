import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkShift extends Document {
  orgId: mongoose.Types.ObjectId;
  name: string;
  startTime: string; // Format "HH:MM"
  endTime: string;   // Format "HH:MM"
  gracePeriodMins: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkShiftSchema: Schema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'Start time must be in HH:MM format',
      },
    },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: 'End time must be in HH:MM format',
      },
    },
    gracePeriodMins: { type: Number, default: 15 },
  },
  { timestamps: true }
);

export const WorkShift = mongoose.model<IWorkShift>('WorkShift', WorkShiftSchema);
export default WorkShift;

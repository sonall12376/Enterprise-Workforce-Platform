import mongoose, { Schema, Document } from 'mongoose';

export interface IHoliday extends Document {
  orgId: mongoose.Types.ObjectId;
  name: string;
  date: Date;
  isOptional: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema: Schema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    isOptional: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique combination of date and orgId
HolidaySchema.index({ orgId: 1, date: 1 }, { unique: true });

export const Holiday = mongoose.model<IHoliday>('Holiday', HolidaySchema);
export default Holiday;

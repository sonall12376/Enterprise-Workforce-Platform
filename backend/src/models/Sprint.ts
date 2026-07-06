import mongoose, { Schema, Document } from 'mongoose';

export interface ISprint extends Document {
  projectId: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  goal?: string;
  status: 'Upcoming' | 'Active' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
}

const SprintSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true, trim: true, minlength: 2 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    goal: { type: String, trim: true },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Completed'],
      default: 'Upcoming',
    },
  },
  { timestamps: true }
);

// Indexes
SprintSchema.index({ projectId: 1, status: 1 });

// Validation: End date must be on or after start date
SprintSchema.pre('validate', function (next) {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be on or after start date');
  }
  next();
});

export const Sprint = mongoose.model<ISprint>('Sprint', SprintSchema);
export default Sprint;

import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  orgId: mongoose.Types.ObjectId;
  managerId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  startDate: Date;
  endDate?: Date;
  status: 'Planning' | 'Active' | 'Completed' | 'OnHold';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      validate: {
        validator: function (v: string) {
          return /^[A-Z0-9_-]+$/.test(v);
        },
        message: (props: any) =>
          `${props.value} is not a valid project code! Must contain only uppercase alphanumeric characters, dashes, or underscores.`,
      },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'Completed', 'OnHold'],
      default: 'Planning',
    },
  },
  { timestamps: true }
);

// Indexes
ProjectSchema.index({ orgId: 1 });
ProjectSchema.index({ code: 1 });

// Validation: End date must be on or after start date
ProjectSchema.pre('validate', function (next) {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be on or after start date');
  }
  next();
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
export default Project;

import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  assignedToId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'InProgress' | 'Review' | 'Done' | 'Completed';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedToId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    title: { type: String, required: true, trim: true, minlength: 2 },
    description: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Todo', 'InProgress', 'Review', 'Done', 'Completed'],
      default: 'Todo',
    },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

// Indexes
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assignedToId: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
export default Task;

import mongoose, { Schema, Document } from 'mongoose';

export interface IHelpDeskTicket extends Document {
  orgId: mongoose.Types.ObjectId;
  raisedById: mongoose.Types.ObjectId;
  assignedToId?: mongoose.Types.ObjectId;
  subject: string;
  description: string;
  category: 'IT' | 'HR' | 'Facilities' | 'Finance';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'Assigned' | 'InProgress' | 'Resolved' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

const HelpDeskTicketSchema: Schema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    raisedById: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    assignedToId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['IT', 'HR', 'Facilities', 'Finance'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Assigned', 'InProgress', 'Resolved', 'Closed'],
      default: 'Open',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes
HelpDeskTicketSchema.index({ orgId: 1, status: 1 });
HelpDeskTicketSchema.index({ raisedById: 1 });
HelpDeskTicketSchema.index({ assignedToId: 1 });

export const HelpDeskTicket = mongoose.model<IHelpDeskTicket>('HelpDeskTicket', HelpDeskTicketSchema);
export default HelpDeskTicket;

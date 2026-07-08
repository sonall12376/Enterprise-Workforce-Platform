import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  domain: string;
  logoUrl?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema(
  {
    name: { type: String, required: true, minlength: 2, maxlength: 100, trim: true },
    domain: { type: String, required: true, unique: true, trim: true },
    logoUrl: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
export default Organization;

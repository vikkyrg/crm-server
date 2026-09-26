import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  contractNumber: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  type: { type: String, enum: ['Service Agreement', 'Development Agreement', 'AMC', 'NDA', 'Vendor Agreement', 'Employment Agreement', 'Other'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  value: { type: Number },
  renewalStatus: { type: String, enum: ['Not Applicable', 'Pending', 'Renewed', 'Cancelled'], default: 'Not Applicable' },
  noticePeriodDays: { type: Number },
  status: { type: String, enum: ['Draft', 'Active', 'Expired', 'Terminated', 'Suspended'], default: 'Draft' },
  documentUrl: { type: String },
  responsibleEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Contract', contractSchema);

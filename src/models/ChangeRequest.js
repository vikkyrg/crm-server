import mongoose from 'mongoose';

const changeRequestSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  crNumber: { type: String, required: true, unique: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  requirement: { type: String, required: true },
  reason: { type: String },
  impact: { type: String },
  estimatedHours: { type: Number, default: 0 },
  additionalCost: { type: Number, default: 0 },
  status: { type: String, enum: ['Requested', 'Estimate', 'Quotation', 'Client Approval', 'Development', 'Testing', 'Delivery', 'Rejected'], default: 'Requested' },
  approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('ChangeRequest', changeRequestSchema);

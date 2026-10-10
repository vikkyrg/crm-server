import mongoose from 'mongoose';

const changeRequestSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  crNumber: { type: String, unique: true, sparse: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  requirement: { type: String, required: true },
  reason: { type: String },
  impact: { type: String },
  estimatedHours: { type: Number, default: 0 },
  additionalCost: { type: Number, default: 0 },
  approvalStatus: { type: String, enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected'], default: 'Draft' },
  status: { 
    type: String, 
    enum: ['Request', 'Estimate', 'Quotation', 'Client Approval', 'Development', 'Testing', 'Delivery'], 
    default: 'Request' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.ChangeRequest || mongoose.model('ChangeRequest', changeRequestSchema);

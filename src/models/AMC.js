import mongoose from 'mongoose';

const amcSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  service: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  value: { type: Number, required: true },
  coverage: { type: String },
  slaId: { type: mongoose.Schema.Types.ObjectId, ref: 'SLA' },
  renewalStatus: { type: String, enum: ['Pending', 'Renewed', 'Expired', 'Cancelled'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Partially Paid', 'Paid'], default: 'Unpaid' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('AMC', amcSchema);

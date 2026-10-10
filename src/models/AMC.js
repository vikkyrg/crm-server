import mongoose from 'mongoose';

const amcSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  amcNumber: { type: String, unique: true, sparse: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  amcValue: { type: Number, required: true },
  costPrice: { type: Number, default: 0 },
  coverageDetails: { type: String },
  slaId: { type: mongoose.Schema.Types.ObjectId, ref: 'SLA' },
  renewalStatus: { type: String, enum: ['Active', 'Expiring Soon', 'Expired', 'Renewed', 'Cancelled'], default: 'Active' },
  paymentStatus: { type: String, enum: ['Pending', 'Partially Paid', 'Paid'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.AMC || mongoose.model('AMC', amcSchema);

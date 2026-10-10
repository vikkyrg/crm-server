import mongoose from 'mongoose';

const procurementSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  poNumber: { type: String, unique: true, sparse: true },
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String },
  itemDescription: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  estimatedAmount: { type: Number, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  requiredDate: { type: Date },
  reason: { type: String },
  approvalStatus: { type: String, enum: ['Request', 'Approved', 'Purchase Order', 'Vendor Invoice', 'Paid', 'Rejected'], default: 'Request' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Procurement || mongoose.model('Procurement', procurementSchema);

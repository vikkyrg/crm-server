import mongoose from 'mongoose';

const domainRenewalSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Domain', required: true },
  renewalDate: { type: Date, required: true },
  previousExpiry: { type: Date, required: true },
  newExpiry: { type: Date, required: true },
  renewalPeriod: { type: String, required: true },
  cost: { type: Number, required: true },
  vendor: { type: String },
  paymentStatus: { type: String, enum: ['Paid', 'Unpaid', 'Pending'], default: 'Paid' },
  transactionRef: { type: String },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.DomainRenewal || mongoose.model('DomainRenewal', domainRenewalSchema);

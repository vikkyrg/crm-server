import mongoose from 'mongoose';

const recurringServiceSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  serviceType: { 
    type: String, 
    enum: ['Domain', 'Hosting', 'Server', 'SSL', 'AMC', 'Maintenance', 'SEO', 'Digital Marketing', 'Software Subscription', 'Other'],
    required: true 
  },
  serviceName: { type: String, required: true },
  startDate: { type: Date, required: true },
  billingCycle: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], default: 'Yearly' },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, required: true },
  nextBillingDate: { type: Date, required: true },
  renewalDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: false },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  cancellationDate: { type: Date },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
  status: { type: String, enum: ['Active', 'Cancelled', 'Expired'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.RecurringService || mongoose.model('RecurringService', recurringServiceSchema);

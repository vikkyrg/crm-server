import mongoose from 'mongoose';

const creditNoteSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  creditNoteNumber: { type: String, unique: true, sparse: true }, // e.g. "INN-CN-000001"
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  issueDate: { type: Date, default: Date.now },
  amount: { type: Number, required: true, min: 0.01 },
  taxAdjustment: { type: Number, default: 0, min: 0 },
  totalCreditAmount: { type: Number, required: true, min: 0.01 },
  reason: { 
    type: String, 
    enum: ['Billing Error', 'Scope Reduction', 'Deficiency in Service', 'Dispute Resolution', 'Client Goodwill', 'Other'],
    default: 'Scope Reduction'
  },
  detailedReason: { type: String, trim: true },
  adjustmentType: {
    type: String,
    enum: ['Invoice Balance Reduction', 'Cash/Bank Refund', 'Cash Refund', 'Both'],
    default: 'Invoice Balance Reduction'
  },
  refundAmount: { type: Number, default: 0, min: 0 },
  refundTransactionRef: { type: String, trim: true },
  refundPaymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'UPI', 'Cheque', 'Credit Card', 'Cash', 'N/A'],
    default: 'N/A'
  },
  status: { 
    type: String, 
    enum: ['Draft', 'Approved', 'Rejected', 'Applied'], 
    default: 'Applied' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

creditNoteSchema.index({ clientId: 1, deletedAt: 1 });
creditNoteSchema.index({ invoiceId: 1, deletedAt: 1 });

export default mongoose.models.CreditNote || mongoose.model('CreditNote', creditNoteSchema);

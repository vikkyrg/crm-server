import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  paymentId: { type: String, unique: true, sparse: true },
  receiptNumber: { type: String, unique: true, sparse: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  invoiceId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Invoice',
    default: null,
    set: (v) => (!v || (typeof v === 'string' && v.trim() === '') ? null : v)
  },
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project',
    default: null,
    set: (v) => (!v || (typeof v === 'string' && v.trim() === '') ? null : v)
  },
  paymentType: { 
    type: String, 
    enum: ['Invoice Payment', 'Advance', 'Retainer', 'Deposit', 'Other'], 
    default: 'Invoice Payment' 
  },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  paymentMethod: { 
    type: String, 
    enum: ['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Payment Gateway', 'Other'], 
    default: 'Bank Transfer' 
  },
  transactionReference: { type: String, trim: true },
  bankName: { type: String },
  gatewayName: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['Completed', 'Pending', 'Failed', 'Refunded', 'Cancelled'], default: 'Completed' },
  verificationStatus: { type: String, enum: ['Verified', 'Pending Verification', 'Rejected'], default: 'Verified' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

// Prevent duplicate transaction references across valid payment records
paymentSchema.index(
  { transactionReference: 1 }, 
  { 
    unique: true, 
    sparse: true, 
    partialFilterExpression: { transactionReference: { $type: 'string', $gt: '' }, deletedAt: null } 
  }
);

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

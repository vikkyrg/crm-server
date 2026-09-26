import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  paymentId: { type: String, required: true, unique: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true, min: 1 },
  date: { type: Date, required: true, default: Date.now },
  method: { type: String, enum: ['Bank transfer', 'UPI', 'Cash', 'Cheque', 'Gateway', 'Other'], required: true },
  transactionReference: { type: String },
  bank: { type: String },
  gateway: { type: String },
  notes: { type: String },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Completed' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);

import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Polymorphic ref (Quotation, Expense, etc.)
  referenceType: { type: String, required: true },
  module: { type: String, required: true },
  level: { type: Number, default: 1 },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  decisionDate: { type: Date },
  comments: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Approval', approvalSchema);

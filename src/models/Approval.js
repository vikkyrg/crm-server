import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  module: { 
    type: String, 
    enum: ['Quotation', 'Expense', 'Purchase', 'Leave', 'Discount', 'ChangeRequest', 'Deployment', 'Contract', 'Payment'],
    required: true 
  },
  recordId: { type: mongoose.Schema.Types.ObjectId, required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  level: { type: Number, default: 1 },
  amount: { type: Number, default: 0 },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  comments: { type: String },
  actionDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Approval || mongoose.model('Approval', approvalSchema);

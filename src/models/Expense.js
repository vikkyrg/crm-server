import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  expenseId: { type: String, required: true, unique: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  amount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  date: { type: Date, required: true },
  receiptUrl: { type: String },
  description: { type: String },
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);

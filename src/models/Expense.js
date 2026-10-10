import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  expenseId: { type: String, unique: true, sparse: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true }, // Travel, Office Supplies, Software, Infrastructure, Other
  amount: { type: Number, required: true },
  expenseDate: { type: Date, default: Date.now },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  receiptUrl: { type: String },
  description: { type: String },
  approvalStatus: { 
    type: String, 
    enum: ['Pending', 'Manager Approved', 'Finance Approved', 'Paid', 'Rejected'], 
    default: 'Pending' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);

import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Date, required: true }, // Store as first day of the month
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  incentives: { type: Number, default: 0 },
  overtimePay: { type: Number, default: 0 },
  leaveDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Pending', 'Processing', 'Paid'], default: 'Pending' },
  payslipUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Payroll', payrollSchema);

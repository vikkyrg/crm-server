import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payrollMonth: { type: String, required: true }, // e.g. "2026-09"
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  incentives: { type: Number, default: 0 },
  overtimeAmount: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  leaveDeductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Draft', 'Processed', 'Paid'], default: 'Draft' },
  paymentDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Payroll || mongoose.model('Payroll', payrollSchema);

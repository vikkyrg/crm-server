import fs from 'fs';
import path from 'path';

const modelsDir = path.join(process.cwd(), 'src/models');
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });

const files = {
  // Phase 5 Support
  'src/models/Ticket.js': `import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  ticketId: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  service: { type: String },
  category: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  attachments: [{ type: String }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slaRuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'SLA' },
  status: { type: String, enum: ['Open', 'Assigned', 'In Progress', 'Waiting for Client', 'Resolved', 'Closed', 'Reopened'], default: 'Open' },
  dueDate: { type: Date },
  resolution: { type: String },
  closedDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);
`,
  // Phase 6 Recurring Business
  'src/models/AMC.js': `import mongoose from 'mongoose';

const amcSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  service: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  value: { type: Number, required: true },
  coverage: { type: String },
  slaId: { type: mongoose.Schema.Types.ObjectId, ref: 'SLA' },
  renewalStatus: { type: String, enum: ['Pending', 'Renewed', 'Expired', 'Cancelled'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Partially Paid', 'Paid'], default: 'Unpaid' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('AMC', amcSchema);
`,
  // Phase 7 Finance
  'src/models/Invoice.js': `import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  rate: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  invoiceNumber: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  invoiceDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  items: [invoiceItemSchema],
  subtotal: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, required: true },
  status: { type: String, enum: ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'], default: 'Draft' },
  pdfUrl: { type: String },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
`,
  'src/models/Payment.js': `import mongoose from 'mongoose';

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
`,
  'src/models/Expense.js': `import mongoose from 'mongoose';

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
`,
  // Phase 8 HR
  'src/models/Employee.js': `import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true, unique: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Designation' },
  joiningDate: { type: Date },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employmentStatus: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Terminated'], default: 'Full-time' },
  salaryInformation: { type: mongoose.Schema.Types.Mixed }, // Basic, allowances, etc
  documents: [{ type: String }],
  skills: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);
`,
  'src/models/Attendance.js': `import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  workHours: { type: Number, default: 0 },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half day', 'Leave', 'Holiday', 'WFH'], required: true },
  overtimeHours: { type: Number, default: 0 },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
`,
  'src/models/Leave.js': `import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' },
  managerApproval: {
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date }
  },
  hrApproval: {
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date }
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);
`,
  'src/models/Payroll.js': `import mongoose from 'mongoose';

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
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filepath);
  fs.writeFileSync(fullPath, content);
  console.log('Wrote', filepath);
}
console.log('Phase 5-8 Models scaffolded.');

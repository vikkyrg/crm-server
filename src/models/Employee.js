import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  employeeId: { type: String, unique: true, sparse: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  department: { type: String },
  designation: { type: String },
  joiningDate: { type: Date },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employmentStatus: { type: String, enum: ['Full Time', 'Part Time', 'Contract', 'Intern', 'Terminated'], default: 'Full Time' },
  basicSalary: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  skills: [{ type: String }],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  status: { type: String, enum: ['Active', 'On Leave', 'Inactive', 'Terminated'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

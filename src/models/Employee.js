import mongoose from 'mongoose';

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

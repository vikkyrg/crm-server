import mongoose from 'mongoose';

const employeeKPISchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  periodMonth: { type: String, required: true }, // e.g. "2026-09"
  tasksCompleted: { type: Number, default: 0 },
  tasksOverdue: { type: Number, default: 0 },
  projectContribution: { type: Number, default: 0 },
  billableHours: { type: Number, default: 0 },
  supportTicketsResolved: { type: Number, default: 0 },
  avgResponseTimeMinutes: { type: Number, default: 0 },
  salesGenerated: { type: Number, default: 0 },
  collectionsMade: { type: Number, default: 0 },
  attendanceDays: { type: Number, default: 0 },
  clientFeedbackScore: { type: Number, default: 5 },
  kpiScore: { type: Number, default: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.EmployeeKPI || mongoose.model('EmployeeKPI', employeeKPISchema);

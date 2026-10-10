import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true }, // e.g. Requirement, UI/UX, Development, Testing, Client UAT, Deployment, Handover
  description: { type: String },
  plannedDate: { type: Date },
  actualDate: { type: Date },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Delayed'], default: 'Pending' },
  completionPercent: { type: Number, default: 0 },
  delayDays: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema);

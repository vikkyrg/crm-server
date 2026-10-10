import mongoose from 'mongoose';

const bugSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  bugId: { type: String, unique: true, sparse: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  moduleName: { type: String },
  description: { type: String, required: true },
  screenshotUrl: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  severity: { type: String, enum: ['Minor', 'Major', 'Critical', 'Blocker'], default: 'Minor' },
  assignedDeveloper: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  qaAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Open', 'Assigned', 'In Progress', 'Fixed', 'QA', 'Reopened', 'Closed'], default: 'Open' },
  resolvedDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Bug || mongoose.model('Bug', bugSchema);

import mongoose from 'mongoose';

const bugSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  bugId: { type: String, required: true, unique: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  module: { type: String },
  description: { type: String, required: true },
  screenshotUrl: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  severity: { type: String, enum: ['Low', 'Minor', 'Major', 'Critical', 'Blocker'], default: 'Major' },
  developer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  qa: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Open', 'Assigned', 'In Progress', 'Fixed', 'QA', 'Reopened', 'Closed'], default: 'Open' },
  resolvedDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Bug', bugSchema);

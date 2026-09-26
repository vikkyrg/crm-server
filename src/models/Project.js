import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  projectId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
  service: { type: String },
  startDate: { type: Date },
  expectedEndDate: { type: Date },
  actualEndDate: { type: Date },
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  budget: { type: Number, default: 0 },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: { type: String, enum: ['Planning', 'Active', 'On Hold', 'Delayed', 'Testing', 'Ready for deployment', 'Completed', 'Cancelled'], default: 'Planning' },
  technology: { type: String },
  repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' },
  hostingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hosting' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);

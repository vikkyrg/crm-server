import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  taskId: { type: String, required: true, unique: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  milestoneId: { type: mongoose.Schema.Types.ObjectId, ref: 'Milestone' },
  name: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  startDate: { type: Date },
  dueDate: { type: Date },
  status: { type: String, enum: ['To Do', 'In Progress', 'Blocked', 'Review', 'QA', 'Completed'], default: 'To Do' },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  dependencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);

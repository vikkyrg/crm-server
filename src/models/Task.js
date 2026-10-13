import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  taskId: { type: String, unique: true, sparse: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  taskName: { type: String, required: true },
  description: { type: String },
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  startDate: { type: Date },
  dueDate: { type: Date },
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Blocked', 'Review', 'QA', 'Completed'], 
    default: 'To Do' 
  },
  estimatedHours: { type: Number, default: 0 },
  actualHours: { type: Number, default: 0 },
  dependencyTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  attachments: [{ type: String }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model('Task', taskSchema);

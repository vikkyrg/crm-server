import mongoose from 'mongoose';

const workflowSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  name: { type: String, required: true },
  description: { type: String },
  trigger: { type: String, required: true }, // e.g., 'LeadCreated', 'PaymentOverdue'
  conditions: [{
    field: { type: String },
    operator: { type: String }, // 'eq', 'gt', 'lt', 'contains'
    value: { type: mongoose.Schema.Types.Mixed }
  }],
  actions: [{
    actionType: { type: String, required: true }, // 'SendEmail', 'CreateTask', 'AssignUser'
    config: { type: mongoose.Schema.Types.Mixed }
  }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Workflow', workflowSchema);

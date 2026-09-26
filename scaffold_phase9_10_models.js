import fs from 'fs';
import path from 'path';

const modelsDir = path.join(process.cwd(), 'src/models');
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });

const files = {
  // Phase 10 Automation
  'src/models/Workflow.js': `import mongoose from 'mongoose';

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
`,
  'src/models/Notification.js': `import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: String, enum: ['In-app', 'Email', 'WhatsApp', 'Push', 'SMS'], default: 'In-app' },
  type: { type: String }, // 'Follow-up', 'Payment', 'Approval'
  title: { type: String, required: true },
  message: { type: String, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  referenceType: { type: String },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  status: { type: String, enum: ['Pending', 'Sent', 'Failed'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filepath);
  fs.writeFileSync(fullPath, content);
  console.log('Wrote', filepath);
}
console.log('Phase 9 and 10 Models scaffolded.');

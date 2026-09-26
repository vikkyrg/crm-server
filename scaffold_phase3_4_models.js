import fs from 'fs';
import path from 'path';

const modelsDir = path.join(process.cwd(), 'src/models');
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });

const files = {
  'src/models/Project.js': `import mongoose from 'mongoose';

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
`,
  'src/models/Task.js': `import mongoose from 'mongoose';

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
`,
  'src/models/Milestone.js': `import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true }, // e.g. Requirement, UI/UX, Development
  plannedDate: { type: Date },
  actualDate: { type: Date },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Delayed'], default: 'Pending' },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Milestone', milestoneSchema);
`,
  'src/models/Bug.js': `import mongoose from 'mongoose';

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
`,
  'src/models/ChangeRequest.js': `import mongoose from 'mongoose';

const changeRequestSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  crNumber: { type: String, required: true, unique: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  requirement: { type: String, required: true },
  reason: { type: String },
  impact: { type: String },
  estimatedHours: { type: Number, default: 0 },
  additionalCost: { type: Number, default: 0 },
  status: { type: String, enum: ['Requested', 'Estimate', 'Quotation', 'Client Approval', 'Development', 'Testing', 'Delivery', 'Rejected'], default: 'Requested' },
  approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('ChangeRequest', changeRequestSchema);
`,
  'src/models/TimeEntry.js': `import mongoose from 'mongoose';

const timeEntrySchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes or hours
  description: { type: String },
  isManual: { type: Boolean, default: false },
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('TimeEntry', timeEntrySchema);
`,
  'src/models/Website.js': `import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  websiteId: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Domain' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  websiteType: { type: String, enum: ['Corporate', 'Business', 'E-commerce', 'Custom web application', 'WordPress', 'PHP', 'React', 'Laravel', 'Other'] },
  technology: { type: String },
  framework: { type: String },
  repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' },
  hostingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hosting' },
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server' },
  sslId: { type: mongoose.Schema.Types.ObjectId, ref: 'SSL' },
  deploymentDate: { type: Date },
  renewalDate: { type: Date },
  amcId: { type: mongoose.Schema.Types.ObjectId, ref: 'AMC' },
  status: { type: String, enum: ['Active', 'Inactive', 'Maintenance'], default: 'Active' },
  backupStatus: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Website', websiteSchema);
`,
  'src/models/Domain.js': `import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  domainName: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  registrar: { type: String },
  registrationDate: { type: Date },
  expiryDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: false },
  nameservers: [{ type: String }],
  dnsProvider: { type: String },
  status: { type: String, enum: ['Active', 'Expired', 'Transferring', 'Pending'], default: 'Active' },
  responsibleEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Domain', domainSchema);
`,
  'src/models/Hosting.js': `import mongoose from 'mongoose';

const hostingSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  provider: { type: String, required: true },
  accountReference: { type: String },
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server' },
  plan: { type: String },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  startDate: { type: Date },
  expiryDate: { type: Date, required: true },
  cost: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  renewalStatus: { type: String, enum: ['Active', 'Pending', 'Expired', 'Cancelled'], default: 'Active' },
  ip: { type: String },
  backupStatus: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Hosting', hostingSchema);
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filepath);
  fs.writeFileSync(fullPath, content);
  console.log('Wrote', filepath);
}
console.log('Phase 3 and 4 Models scaffolded.');

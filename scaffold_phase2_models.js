import fs from 'fs';
import path from 'path';

const modelsDir = path.join(process.cwd(), 'src/models');
if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });

const files = {
  'src/models/FollowUp.js': `import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Poloymorphic ref to Lead, Client, etc.
  referenceType: { type: String, enum: ['Lead', 'Client', 'Project'], required: true },
  date: { type: Date, required: true },
  time: { type: String },
  type: { type: String, enum: ['Call', 'Email', 'Meeting', 'WhatsApp', 'Other'], required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  outcome: { type: String },
  status: { type: String, enum: ['Pending', 'Completed', 'Overdue', 'Cancelled'], default: 'Pending' },
  nextFollowUpId: { type: mongoose.Schema.Types.ObjectId, ref: 'FollowUp' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('FollowUp', followUpSchema);
`,
  'src/models/Client.js': `import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  clientId: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  industry: { type: String },
  email: { type: String },
  phone: { type: String },
  whatsapp: { type: String },
  website: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  gstNumber: { type: String },
  panNumber: { type: String },
  clientType: { type: String },
  accountManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  salesperson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Client', clientSchema);
`,
  'src/models/Contact.js': `import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  name: { type: String, required: true },
  designation: { type: String },
  department: { type: String },
  email: { type: String },
  phone: { type: String },
  whatsapp: { type: String },
  type: { type: String, enum: ['Primary', 'Billing', 'Technical', 'Decision Maker', 'Other'], default: 'Other' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);
`,
  'src/models/Quotation.js': `import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const quotationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  quotationNumber: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  date: { type: Date, required: true, default: Date.now },
  validUntil: { type: Date },
  salesperson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  items: [quotationItemSchema],
  subtotal: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  terms: { type: String },
  paymentSchedule: { type: String },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending Approval', 'Sent', 'Viewed', 'Negotiation', 'Accepted', 'Rejected', 'Expired', 'Cancelled'], 
    default: 'Draft' 
  },
  approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Quotation', quotationSchema);
`,
  'src/models/Approval.js': `import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  referenceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Polymorphic ref (Quotation, Expense, etc.)
  referenceType: { type: String, required: true },
  module: { type: String, required: true },
  level: { type: Number, default: 1 },
  approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  decisionDate: { type: Date },
  comments: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Approval', approvalSchema);
`,
  'src/models/Contract.js': `import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  contractNumber: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  type: { type: String, enum: ['Service Agreement', 'Development Agreement', 'AMC', 'NDA', 'Vendor Agreement', 'Employment Agreement', 'Other'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  value: { type: Number },
  renewalStatus: { type: String, enum: ['Not Applicable', 'Pending', 'Renewed', 'Cancelled'], default: 'Not Applicable' },
  noticePeriodDays: { type: Number },
  status: { type: String, enum: ['Draft', 'Active', 'Expired', 'Terminated', 'Suspended'], default: 'Draft' },
  documentUrl: { type: String },
  responsibleEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Contract', contractSchema);
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filepath);
  fs.writeFileSync(fullPath, content);
  console.log('Wrote', filepath);
}
console.log('Phase 2 CRM models scaffolded.');

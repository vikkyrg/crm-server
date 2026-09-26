import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  ticketId: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  service: { type: String },
  category: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  attachments: [{ type: String }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slaRuleId: { type: mongoose.Schema.Types.ObjectId, ref: 'SLA' },
  status: { type: String, enum: ['Open', 'Assigned', 'In Progress', 'Waiting for Client', 'Resolved', 'Closed', 'Reopened'], default: 'Open' },
  dueDate: { type: Date },
  resolution: { type: String },
  closedDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);

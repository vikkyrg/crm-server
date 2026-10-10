import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  ticketId: { type: String, unique: true, sparse: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  contactId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  serviceType: { type: String },
  category: { type: String, default: 'General' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  attachmentUrl: { type: String },
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slaId: { type: mongoose.Schema.Types.ObjectId, ref: 'SLA' },
  isUnderWarranty: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['Open', 'Assigned', 'In Progress', 'Waiting for Client', 'Resolved', 'Closed', 'Reopened'], 
    default: 'Open' 
  },
  dueDate: { type: Date },
  resolutionNotes: { type: String },
  closedDate: { type: Date },
  satisfactionRating: { type: Number, min: 1, max: 5 },
  satisfactionFeedback: { type: String },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderType: { type: String, enum: ['Staff', 'Client'], default: 'Staff' },
    message: String,
    attachmentUrl: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  leadId: { type: String, unique: true, sparse: true },
  companyName: { type: String, required: true },
  contactName: { type: String, required: true },
  phone: { type: String },
  whatsapp: { type: String },
  email: { type: String },
  website: { type: String },
  location: { type: String },
  industry: { type: String },
  leadSource: { 
    type: String, 
    enum: ['Website', 'Google Ads', 'Facebook', 'Instagram', 'WhatsApp', 'Referral', 'Upwork', 'Freelancer', 'Cold Call', 'Existing Client', 'Other'],
    default: 'Website'
  },
  serviceInterested: { type: String },
  estimatedBudget: { type: Number, default: 0 },
  expectedValue: { type: Number, default: 0 },
  salesperson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost', 'On Hold'], 
    default: 'New' 
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  lastContacted: { type: Date },
  nextFollowUp: { type: Date },
  notes: { type: String },
  notesCount: { type: Number, default: 0 },
  isConverted: { type: Boolean, default: false },
  convertedClientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  convertedDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);
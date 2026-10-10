import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  followUpDate: { type: Date, required: true },
  followUpTime: { type: String },
  followUpType: { 
    type: String, 
    enum: ['Call', 'Meeting', 'Email', 'WhatsApp', 'Demo', 'Other'], 
    default: 'Call' 
  },
  notes: { type: String },
  outcome: { type: String },
  nextFollowUp: { type: Date },
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.FollowUp || mongoose.model('FollowUp', followUpSchema);

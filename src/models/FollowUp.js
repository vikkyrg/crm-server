import mongoose from 'mongoose';

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

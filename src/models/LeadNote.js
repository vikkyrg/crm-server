import mongoose from 'mongoose';

const leadNoteSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  note: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date },
  status: { type: String, enum: ['Active', 'Archived'], default: 'Active' }
}, { timestamps: true });

export default mongoose.models.LeadNote || mongoose.model('LeadNote', leadNoteSchema);

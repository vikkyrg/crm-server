import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  contactName: { type: String, required: true },
  designation: { type: String },
  email: { type: String },
  phone: { type: String },
  whatsapp: { type: String },
  department: { type: String },
  isPrimary: { type: Boolean, default: false },
  isBilling: { type: Boolean, default: false },
  isTechnical: { type: Boolean, default: false },
  isDecisionMaker: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Contact || mongoose.model('Contact', contactSchema);

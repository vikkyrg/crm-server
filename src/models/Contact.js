import mongoose from 'mongoose';

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

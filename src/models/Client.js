import mongoose from 'mongoose';

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

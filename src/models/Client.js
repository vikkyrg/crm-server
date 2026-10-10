import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  clientId: { type: String, unique: true, sparse: true },
  companyName: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  whatsapp: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String, default: 'India' },
  gstNumber: { type: String },
  panNumber: { type: String },
  industry: { type: String },
  clientType: { type: String, enum: ['Enterprise', 'SMB', 'Startup', 'Government', 'Other'], default: 'SMB' },
  accountManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  salesperson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  status: { type: String, enum: ['Active', 'Inactive', 'Archived'], default: 'Active' },
  onboardingStatus: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  offboardingStatus: { type: String, enum: ['N/A', 'In Progress', 'Completed'], default: 'N/A' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Client || mongoose.model('Client', clientSchema);

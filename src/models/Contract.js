import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  contractNumber: { type: String, unique: true, sparse: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  contractType: { 
    type: String, 
    enum: ['Service Agreement', 'Development Agreement', 'AMC', 'NDA', 'Employment Agreement', 'Vendor Agreement', 'Other'],
    default: 'Service Agreement' 
  },
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  value: { type: Number, default: 0 },
  renewalStatus: { type: String, enum: ['Auto-Renew', 'Manual', 'None'], default: 'Manual' },
  noticePeriodDays: { type: Number, default: 30 },
  status: { type: String, enum: ['Draft', 'Active', 'Expiring Soon', 'Expired', 'Terminated'], default: 'Active' },
  documentUrl: { type: String },
  signatureStatus: { type: String, enum: ['Unsigned', 'Pending Signature', 'Signed'], default: 'Unsigned' },
  signedDate: { type: Date },
  signerName: { type: String },
  responsibleEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Contract || mongoose.model('Contract', contractSchema);

import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  domainName: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  registrar: { type: String },
  registrarAccountRef: { type: String },
  registrationDate: { type: Date },
  expiryDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: false },
  nameservers: [{ type: String }],
  dnsProvider: { type: String },
  status: { type: String, enum: ['Active', 'Expiring Soon', 'Expired', 'Transferred'], default: 'Active' },
  renewalStatus: { type: String, enum: ['Due', 'Renewal In Progress', 'Renewed', 'Expired', 'Cancelled'], default: 'Renewed' },
  sslId: { type: mongoose.Schema.Types.ObjectId, ref: 'SSL' },
  hostingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hosting' },
  responsibleEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  renewalCost: { type: Number, default: 0 },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Domain || mongoose.model('Domain', domainSchema);

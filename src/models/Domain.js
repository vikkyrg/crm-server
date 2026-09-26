import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  domainName: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  registrar: { type: String },
  registrationDate: { type: Date },
  expiryDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: false },
  nameservers: [{ type: String }],
  dnsProvider: { type: String },
  status: { type: String, enum: ['Active', 'Expired', 'Transferring', 'Pending'], default: 'Active' },
  responsibleEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Domain', domainSchema);

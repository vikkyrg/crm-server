import mongoose from 'mongoose';

const sslSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  domainName: { type: String, required: true },
  certificateType: { type: String, enum: ["Let's Encrypt", "Comodo", "Wildcard", "EV SSL", "Other"], default: "Let's Encrypt" },
  provider: { type: String },
  issueDate: { type: Date },
  expiryDate: { type: Date, required: true },
  autoRenew: { type: Boolean, default: true },
  installationStatus: { type: String, enum: ['Installed', 'Pending', 'Failed', 'Expired'], default: 'Installed' },
  responsibleEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.SSL || mongoose.model('SSL', sslSchema);

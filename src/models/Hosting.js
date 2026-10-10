import mongoose from 'mongoose';

const hostingSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  hostingProvider: { type: String, required: true },
  accountName: { type: String },
  serverIp: { type: String },
  planName: { type: String },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  websiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Website' },
  startDate: { type: Date },
  expiryDate: { type: Date, required: true },
  costPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  autoRenew: { type: Boolean, default: false },
  controlPanelUrl: { type: String },
  backupStatus: { type: String, enum: ['Active', 'Inactive', 'Failed'], default: 'Active' },
  status: { type: String, enum: ['Active', 'Expiring Soon', 'Expired', 'Cancelled'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Hosting || mongoose.model('Hosting', hostingSchema);

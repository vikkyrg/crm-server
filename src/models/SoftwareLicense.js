import mongoose from 'mongoose';

const softwareLicenseSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  softwareName: { type: String, required: true },
  licenseType: { type: String, enum: ['Perpetual', 'Subscription', 'Freemium', 'OEM'], default: 'Subscription' },
  accountEmail: { type: String },
  assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  purchaseDate: { type: Date },
  expiryDate: { type: Date },
  cost: { type: Number, default: 0 },
  licenseKeyRef: { type: String }, // Encrypted reference
  status: { type: String, enum: ['Active', 'Expiring Soon', 'Expired'], default: 'Active' }
}, { timestamps: true });

export default mongoose.models.SoftwareLicense || mongoose.model('SoftwareLicense', softwareLicenseSchema);

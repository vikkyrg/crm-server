import mongoose from 'mongoose';

const hostingSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  provider: { type: String, required: true },
  accountReference: { type: String },
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server' },
  plan: { type: String },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  startDate: { type: Date },
  expiryDate: { type: Date, required: true },
  cost: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  renewalStatus: { type: String, enum: ['Active', 'Pending', 'Expired', 'Cancelled'], default: 'Active' },
  ip: { type: String },
  backupStatus: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Hosting', hostingSchema);
